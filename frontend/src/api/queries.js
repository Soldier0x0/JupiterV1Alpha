import { useQuery } from 'react-query';
import { fetchJSON } from './client';

export const useEvents = (query) => {
  return useQuery(['events', query], () => fetchJSON(`/api/events?${new URLSearchParams(query)}`), {
    staleTime: 60000,
    retry: 3,
  });
};

export const useIntel = () => {
  return useQuery('intel', () => fetchJSON('/api/intel'), {
    staleTime: 60000,
    retry: 3,
  });
};
