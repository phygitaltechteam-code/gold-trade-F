// import {Token, User} from '@/types';
// import {QUERY_KEYS} from '@/lib/react-query/queryKeys';
// import axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
// import {jwtDecode} from 'jwt-decode';

// export const unAuthenticatedApi: AxiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_SERVER_URL,
// });

// // Get the token from localStorage
// let token: Token = JSON.parse(localStorage.getItem(QUERY_KEYS.TOKEN) || 'null');

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_SERVER_URL,
//   headers: {
//     Authorization: token ? `Bearer ${token.accessToken}` : '',
//   },
// });

// api.interceptors.request.use(async (req) => {
//   // Refresh token if it has expired
//   if (!token) {
//     token = JSON.parse(localStorage.getItem(QUERY_KEYS.TOKEN) || 'null');
//     if (token) {
//       req.headers.Authorization = `Bearer ${token.accessToken}`;
//     }
//   }

//   if (token) {
//     const user: User = jwtDecode(token.accessToken || '');
//     const isExpired = user.exp && user.exp * 1000 < Date.now();

//     if (isExpired) {
//       try {
//         const res = await unAuthenticatedApi.post('/users/refresh-token', {
//           refreshToken: token.refreshToken,
//         });

//         localStorage.setItem(
//           QUERY_KEYS.TOKEN,
//           JSON.stringify({
//             accessToken: res.data.accessToken,
//             refreshToken: res.data.refreshToken,
//           }),
//         );
//         req.headers.Authorization = `Bearer ${res.data.accessToken}`;
//         token = {
//           accessToken: res.data.accessToken,
//           refreshToken: res.data.refreshToken,
//         };
//       } catch (error) {
//         console.error('Token refresh failed:', error);
//         localStorage.removeItem(QUERY_KEYS.TOKEN);
//       }
//     }
//   }

//   return req;
// });

// api.interceptors.response.use(
//   async (res: AxiosResponse) => {
//     return res.data;
//   },
//   (error: AxiosError<unknown>) => {
//     if (error.response?.status === 401) {
//       console.error('Unauthorized:', error.response.data);
//     } else if (error.response?.status === 403) {
//       console.error('Forbidden:', error.response.data);
//     } else if (error.response?.status === 404) {
//       console.error('Not found:', error.response.data);
//     } else if (error.response?.status === 500) {
//       console.error('Server error:', error.response.data);
//     } else {
//       console.error('Error:', error.response?.data);
//     }

//     return Promise.reject(error);
//   },
// );

import {Token, User} from '@/types';
import {QUERY_KEYS} from '@/lib/react-query/queryKeys';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import {jwtDecode} from 'jwt-decode'; // default import

export const unAuthenticatedApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

// --- helper: poll localStorage until token appears (or timeout) ---
function waitForToken(
  timeoutMs = 2000,
  intervalMs = 50,
): Promise<Token | null> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      try {
        const raw = localStorage.getItem(QUERY_KEYS.TOKEN) || 'null';
        const t = JSON.parse(raw) as Token | null;
        if (t) return resolve(t);
      } catch {
        // ignore JSON parse errors, keep polling until timeout
      }

      if (Date.now() - start >= timeoutMs) return resolve(null);
      setTimeout(check, intervalMs);
    };
    check();
  });
}

// --- token refresh single-flight control ---
let refreshPromise: Promise<Token | null> | null = null;

async function refreshToken(refreshTokenValue: string): Promise<Token | null> {
  // reuse in-flight refresh if present
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await unAuthenticatedApi.post('/users/refresh-token', {
        refreshToken: refreshTokenValue,
      });
      const newToken: Token = {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      };
      localStorage.setItem(QUERY_KEYS.TOKEN, JSON.stringify(newToken));
      return newToken;
    } catch (err) {
      // on refresh failure clear token
      localStorage.removeItem(QUERY_KEYS.TOKEN);
      return null;
    } finally {
      // ensure next refresh can be started later
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// --- axios instance that does not set module-level token header (read at request-time) ---
export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

// Request interceptor: wait for token if absent, refresh if expired, set Authorization header
api.interceptors.request.use(
  async (req) => {
    // 1) Always try immediate read first (fast path)
    let token: Token | null = null;
    try {
      token = JSON.parse(
        localStorage.getItem(QUERY_KEYS.TOKEN) || 'null',
      ) as Token | null;
    } catch {
      token = null;
    }

    // 2) If token not found, wait a little for it to appear (tunable)
    if (!token) {
      token = await waitForToken(2000, 50); // wait up to 2s; change as needed
    }

    // 3) If token exists, check expiry and refresh if needed
    if (token?.accessToken) {
      let decoded: {exp?: number} | null = null;
      try {
        decoded = jwtDecode(token.accessToken) as {exp?: number} | null;
      } catch {
        decoded = null;
      }

      const isExpired = decoded?.exp ? decoded.exp * 1000 < Date.now() : false;

      if (isExpired) {
        // try refresh; refreshToken function serializes concurrent refreshes
        try {
          const newToken = await refreshToken(token.refreshToken!);
          if (newToken?.accessToken) {
            req.headers.Authorization = `Bearer ${newToken.accessToken}`;
          } else {
            // refresh failed -> no auth header
            delete req.headers.Authorization;
          }
        } catch {
          delete req.headers.Authorization;
        }
      } else {
        // not expired: attach existing token
        req.headers.Authorization = `Bearer ${token.accessToken}`;
      }
    } else {
      // no token available: ensure header not set
      delete req.headers.Authorization;
    }

    return req;
  },
  (error) => Promise.reject(error),
);

// Response interceptor (same error logging as you had + returning res.data)
api.interceptors.response.use(
  async (res: AxiosResponse) => {
    return res.data;
  },
  (error: AxiosError<unknown>) => {
    const status = error.response?.status;
    if (status === 401) {
      console.error('Unauthorized:', error.response?.data);
    } else if (status === 403) {
      console.error('Forbidden:', error.response?.data);
    } else if (status === 404) {
      console.error('Not found:', error.response?.data);
    } else if (status === 500) {
      console.error('Server error:', error.response?.data);
    } else {
      console.error('Error:', error.response?.data);
    }

    return Promise.reject(error);
  },
);
