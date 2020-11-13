import { useContext, createContext } from 'react';

export const AuthContext = createContext(null);
export function useAuthContext() {
  return useContext(AuthContext);
};

export const UserContext = createContext(null);
export function useUserContext() {
  return useContext(UserContext);
};
