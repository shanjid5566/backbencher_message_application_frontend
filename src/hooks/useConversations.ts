import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

// Basic type for data coming from the database
export interface Conversation {
  id: string;
  isGroup: boolean;
  users: Array<{
    id: string;
    name: string;
    image: string | null;
    isOnline: boolean;
    lastSeen: string | null;
  }>;
  messages: Array<{
    body: string | null;
    createdAt: string;
  }>;
}

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      // Calling backend GET /api/v1/conversations API
      const response = await api.get('/conversations');
      return response.data.data as Conversation[];
    },
  });
};