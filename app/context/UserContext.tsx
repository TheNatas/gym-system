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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [fullLoading, setFullLoading] = useState(false);
  const [silentLoading, setSilentLoading] = useState(false);

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
      setUsers(prev => append ? [...prev, ...fetchedUsersResponse.items] : fetchedUsersResponse.items);
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

  return (
    <UserContext.Provider value={{ users, total, loading, fullLoading, silentLoading, fetchUsers, setUsers }}>
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
