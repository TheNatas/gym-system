import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '@/app/context/UserContext';

export const useUserSearch = (pageSize = 20) => {
  const { usersForSelect: users, loadingUsersForSelect: loading, fetchUsersForSelect: fetchSearchUsers } = useUserContext();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  const loadUsers = useCallback(async (currentPage: number, search: string, append: boolean) => {
    try {
      const response = await fetchSearchUsers({ page: currentPage, search, append, pageSize });
      if (response) {
        setHasMore(response.items.length === pageSize);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    }
  }, [fetchSearchUsers, pageSize]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers(1, searchValue, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, loadUsers]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadUsers(nextPage, searchValue, true);
    }
  }, [loading, hasMore, page, searchValue, loadUsers]);

  const resetSearch = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setSearchValue('');
    loadUsers(1, '', false);
  }, [loadUsers]);

  return {
    users,
    loading,
    searchValue,
    setSearchValue,
    loadMore,
    resetSearch
  };
};
