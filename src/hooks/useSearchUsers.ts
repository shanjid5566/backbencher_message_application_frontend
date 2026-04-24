import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useSearchUsers = (searchQuery: string) => {
  return useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await api.get(`/users/search?q=${searchQuery}`);
      return response.data.data;
    },
    enabled: searchQuery.length > 0,
  });
};
