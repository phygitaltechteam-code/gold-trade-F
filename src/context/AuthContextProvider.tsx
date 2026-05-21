import React, {ReactNode, useEffect, useState} from 'react';
import {AuthContext} from './AuthContext';
import {Token, User} from '@/types';

import {jwtDecode} from 'jwt-decode';
import {QUERY_KEYS} from '@/lib/react-query/QueryKeys';

const AuthContextProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>();
  const [token, setToken] = useState<Token | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Development Mock Role Check to view panels without a backend login
    const mockRole = localStorage.getItem('mock_role');
    if (mockRole) {
      const upperRole = mockRole.toUpperCase();
      const mockUser: User = {
        id: 'mock-dev-id-999',
        fullname: `Mock ${mockRole.charAt(0).toUpperCase() + mockRole.slice(1).toLowerCase()}`,
        role: upperRole,
        exp: Math.floor(Date.now() / 1000) + 86400,
      } as any;

      setToken({accessToken: 'mock-token', refreshToken: 'mock-token'});
      setUser(mockUser);
      setRole(upperRole);
      setIsSuperAdmin(upperRole === 'SUPERADMIN');
      setIsAuthenticated(true);
      return;
    }

    const localToken = JSON.parse(
      localStorage.getItem(QUERY_KEYS.TOKEN) || 'null',
    );

    if (localToken) {
      const decodedToken: User = jwtDecode(localToken.accessToken);

      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem(QUERY_KEYS.TOKEN);
        setToken(null);
        setUser(null);
        setRole(null);
        setIsSuperAdmin(false);
        setIsAuthenticated(false);
      } else {
        setToken(localToken);
        setUser(decodedToken);
        setRole(decodedToken.role);
        setIsSuperAdmin(decodedToken.role === 'SuperAdmin');
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Value of the context
  const contextValue = {
    user,
    setUser,
    role,
    token,
    setToken,
    isAuthenticated,
    setIsAuthenticated,
    isSuperAdmin,
    setIsSuperAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
