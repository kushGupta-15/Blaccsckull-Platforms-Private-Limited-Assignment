import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchCompetitions } from '../api/competitions';
import { ICompetition } from '../types';

const PAGE_SIZE = 10;

export const competitionsListKey = (status?: string, search?: string) =>
  ['competitions', { status, search }] as const;

export const useCompetitions = (status?: string, search?: string) =>
  useInfiniteQuery({
    queryKey: competitionsListKey(status, search),
    queryFn: ({ pageParam = 1 }) =>
      fetchCompetitions({ page: pageParam as number, limit: PAGE_SIZE, status, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

// Flatten all pages into a single ICompetition array
export const flattenCompetitions = (
  pages: { items: ICompetition[] }[]
): ICompetition[] => pages.flatMap((p) => p.items);
