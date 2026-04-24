import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    // Store conversationId in queryKey to automatically fetch on change
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      // Make backend API call
      const response = await api.get(`/messages?conversationId=${conversationId}&limit=50`);
      return response.data.data.messages;
    },
    // Only run the query if conversationId is present
    enabled: !!conversationId, 
  });
};
