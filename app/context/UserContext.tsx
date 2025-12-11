'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from "@/app/api/modules/user/dtos/User";
import { getUsers } from "@/app/api/modules/user";

type UserContextType = {
  users: User[];
  total: number;
  loading: boolean;
  fullLoading: boolean;
  silentLoading: boolean;
  fetchUsers: (params?: { page?: number; search?: string; append?: boolean; pageSize?: number; silent?: boolean } | number) => Promise<{ items: User[]; total: number }>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  
  usersForSelect: User[];
  loadingUsersForSelect: boolean;
  fetchUsersForSelect: (params?: { page?: number; search?: string; append?: boolean; pageSize?: number }) => Promise<{ items: User[]; total: number }>;
  setUsersForSelect: React.Dispatch<React.SetStateAction<User[]>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [fullLoading, setFullLoading] = useState(false);
  const [silentLoading, setSilentLoading] = useState(false);

  const [usersForSelect, setUsersForSelect] = useState<User[]>([]);
  const [loadingUsersForSelect, setLoadingUsersForSelect] = useState(false);

  const loading = fullLoading || silentLoading;

  const fetchUsers = useCallback(async (params: { page?: number; search?: string; append?: boolean; pageSize?: number; silent?: boolean } | number = {}) => {
    const actualParams = typeof params === 'number' ? { page: params } : params;
    const { page = 1, search = '', append = false, pageSize = 10, silent = false } = actualParams;

    if (silent) {
      setSilentLoading(true);
    } else {
      setFullLoading(true);
    }
    try {
      const fetchedUsersResponse = await getUsers({ page, pageSize, search });
      setUsers(prev => {
        if (append) {
          const userMap = new Map(prev.map((u) => [u.id, u]));
          fetchedUsersResponse.items.forEach((u) => {
            userMap.set(u.id, u);
          });
          return Array.from(userMap.values());
        }
        return fetchedUsersResponse.items;
      });
      setTotal(fetchedUsersResponse.total);
      return fetchedUsersResponse;
    } finally {
      if (silent) {
        setSilentLoading(false);
      } else {
        setFullLoading(false);
      }
    }
  }, []);

  const fetchSearchUsers = useCallback(async (params: { page?: number; search?: string; append?: boolean; pageSize?: number } = {}) => {
    const { page = 1, search = '', append = false, pageSize = 10 } = params;

    setLoadingUsersForSelect(true);
    try {
      const fetchedUsersResponse = await getUsers({ page, pageSize, search });
      setUsersForSelect(prev => {
        if (append) {
          const userMap = new Map(prev.map((u) => [u.id, u]));
          fetchedUsersResponse.items.forEach((u) => {
            userMap.set(u.id, u);
          });
          return Array.from(userMap.values());
        }
        return fetchedUsersResponse.items;
      });
      return fetchedUsersResponse;
    } finally {
      setLoadingUsersForSelect(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ 
      users, total, loading, fullLoading, silentLoading, fetchUsers, setUsers,
      usersForSelect: usersForSelect, loadingUsersForSelect: loadingUsersForSelect, fetchUsersForSelect: fetchSearchUsers, setUsersForSelect: setUsersForSelect
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
