import { useUserContext } from "@/app/context/UserContext";
import { useEffect } from "react";

type UseUsersListProps = {
  autoFetch?: boolean;
  pageSize?: number;
}

export const useUsersList = ({ autoFetch = true, pageSize = 10 }: UseUsersListProps = {}) => {
  const { users, total, loading, fullLoading, silentLoading, fetchUsers, setUsers } = useUserContext();

  useEffect(() => {
    if (autoFetch && users.length === 0) {
      fetchUsers({ pageSize });
    }
  }, [autoFetch, fetchUsers, pageSize, users.length]);

  return { users, total, fetchUsers, setUsers, loading, fullLoading, silentLoading };
}