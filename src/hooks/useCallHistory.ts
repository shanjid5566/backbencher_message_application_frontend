import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useCallHistory = () => {
  return useQuery({
    queryKey: ['callHistory'],
    queryFn: async () => {
      // ব্যাকএন্ডের /api/v1/calls/history বা আপনার যে রাউট আছে সেখান থেকে ডেটা আনবে
      // (যদি আপনার backend route অন্য কিছু হয়, তবে এখানে সেটা বদলে দেবেন)
      const res = await api.get('/calls/history'); 
      return res.data.data;
    }
  });
};