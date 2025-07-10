import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Job } from '../types/interfaces';

const fetchTodaysJobs = async () => {
  const response = await api.get('/api/getTodaysJobs/');
  return response.data;
};

export const useTodaysJobs = (enabled: boolean = true) => {
  const { data: jobs, error, isLoading, refetch } = useQuery<Job[]>({
    queryKey: ['todaysJobs'],
    queryFn: fetchTodaysJobs,
    enabled: enabled,
    refetchOnWindowFocus: true,   
    staleTime: 5 * 60 * 1000,     // 5 minutes
    gcTime: 2 * 60 * 60 * 1000,    // 2 hours cache
  });

  return { jobs: jobs || [], error, isLoading, refetch };
};