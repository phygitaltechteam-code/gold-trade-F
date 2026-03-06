// utils/axios.ts
import {QUERY_KEYS} from '@/lib/react-query/QueryKeys';
import {Token, User} from '@/types';
import axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import {jwtDecode} from 'jwt-decode';

// Helper function to get token
const getToken = (): Token | null => {
  const tokenStr = localStorage.getItem(QUERY_KEYS.TOKEN);
  return tokenStr ? JSON.parse(tokenStr) : null;
};

export const unAuthenticatedApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(async (req) => {
  const token = getToken();

  if (token?.accessToken) {
    try {
      const user: User = jwtDecode(token.accessToken);
      const isExpired = user.exp && user.exp * 1000 < Date.now();

      if (isExpired) {
        // Token expired, try to refresh
        try {
          const res = await unAuthenticatedApi.post('/users/refresh-token', {
            refreshToken: token.refreshToken,
          });

          const newToken = {
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          };

          localStorage.setItem(QUERY_KEYS.TOKEN, JSON.stringify(newToken));
          req.headers.Authorization = `Bearer ${res.data.accessToken}`;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem(QUERY_KEYS.TOKEN);
          // Don't set auth header if refresh failed
        }
      } else {
        // Token valid, use it
        req.headers.Authorization = `Bearer ${token.accessToken}`;
      }
    } catch (decodeError) {
      console.error('Token decode failed:', decodeError);
      localStorage.removeItem(QUERY_KEYS.TOKEN);
    }
  }

  return req;
});

// Response interceptor
api.interceptors.response.use(
  (res: AxiosResponse) => {
    return res.data; // This returns only the data, which might be stripping the response structure
  },
  (error: AxiosError<unknown>) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized:', error.response.data);
      // Clear token on 401
      localStorage.removeItem(QUERY_KEYS.TOKEN);
    } else if (error.response?.status === 403) {
      console.error('Forbidden:', error.response.data);
    } else if (error.response?.status === 404) {
      console.error('Not found:', error.response.data);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    } else {
      console.error('Error:', error.response?.data);
    }

    return Promise.reject(error);
  },
);
