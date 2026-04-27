import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useCallHistory = () => {
  return useQuery({
    queryKey: ['callHistory'],
    queryFn: async () => {
      // Fetches data from /api/v1/calls/history or your current route
      // (If your backend route is different, change it here)
      const res = await api.get('/calls/history'); 
      return res.data.data;
    }
  });
};