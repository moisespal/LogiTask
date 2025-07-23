import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { TodaysPaymentsResponse } from '../types/interfaces';

export const useTodaysPayments = (enabled: boolean = true) => {
  return useQuery<TodaysPaymentsResponse>({
    queryKey: ['todaysPayments'],
    queryFn: async () => {
      const response = await api.get('/api/daily/payments/');
      return response.data; 
    },
    enabled, // Only run the query if enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};
