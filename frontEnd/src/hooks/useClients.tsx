import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { ClientDataID } from '../types/interfaces';

const fetchClients = async () => {
  const response = await api.get('/api/clients/');
  return response.data;
};

export const useClients = (enabled: boolean = true) => {
  const { data: clients, error, isLoading, refetch } = useQuery<ClientDataID[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
    enabled: enabled,
    staleTime: 15 * 60 * 1000,     // 15 minutes
    gcTime: 2 * 60 * 60 * 1000,    // 2 hours cache
  });

  return { clients: clients || [], error, isLoading, refetch };
};