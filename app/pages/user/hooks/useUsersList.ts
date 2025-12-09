import { getUsers } from "@/app/api/modules/user";
import { User } from "@/app/api/modules/user/dtos/User";
import { useCallback, useEffect, useState } from "react";

type UseUsersListProps = {
  autoFetch?: boolean;
  pageSize?: number;
}

export const useUsersList = ({ autoFetch = true, pageSize = 10 }: UseUsersListProps = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (params: { page?: number; search?: string; append?: boolean } | number = {}) => {
    // Backward compatibility for UserView which passes a number
    const actualParams = typeof params === 'number' ? { page: params } : params;
    const { page = 1, search = '', append = false } = actualParams;

    setLoading(true);
    try {
      const fetchedUsersResponse = await getUsers({ page, pageSize, search });
      setUsers(prev => append ? [...prev, ...fetchedUsersResponse.items] : fetchedUsersResponse.items);
      setTotal(fetchedUsersResponse.total);
      return fetchedUsersResponse;
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [autoFetch, fetchUsers]);

  return { users, total, fetchUsers, setUsers, loading };
}