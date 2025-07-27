import { QueryClient } from '@tanstack/react-query';
import { ClientDataID, Job, TodaysPaymentsResponse } from '../types/interfaces';

export const updateClientInCaches = (
    queryClient: QueryClient, 
    updatedClient: ClientDataID
) => {
    // 1. Update clients cache
    queryClient.setQueryData(['clients'], (oldClients: ClientDataID[] | undefined) => {
        if (!oldClients) return [];
        return oldClients.map(client => 
            client.id === updatedClient.id ? updatedClient : client
        );
    });

    // 2. Update jobs cache if it exists and is fresh
    const jobsQuery = queryClient.getQueryState(['todaysJobs']);
    if (jobsQuery?.data && jobsQuery?.status === 'success') {
        queryClient.setQueryData(['todaysJobs'], (oldJobs: Job[] | undefined) => {
            if (!oldJobs) return [];
            return oldJobs.map(job => 
                job.client.id === updatedClient.id 
                    ? { ...job, client: updatedClient }
                    : job
            );
        });
    }
    // 3. Update payments cache if it exists and is fresh
    const paymentsQuery = queryClient.getQueryState(['todaysPayments']);
    if (paymentsQuery?.data && paymentsQuery?.status === 'success') {
        console.log('Updating payments cache with fresh client data');
        queryClient.setQueryData(['todaysPayments'], (oldPaymentsData: TodaysPaymentsResponse | undefined) => {
            if (!oldPaymentsData?.payments) return oldPaymentsData;
            
            return {
                ...oldPaymentsData,
                payments: oldPaymentsData.payments.map((payment) => 
                    payment.client?.id === updatedClient.id 
                        ? { ...payment, client: updatedClient }
                        : payment
                )
            };
        });
    }
};