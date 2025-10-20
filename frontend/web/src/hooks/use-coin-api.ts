import { useQuery } from '@tanstack/react-query';
import type { CoinListResponse } from '@/types/coin';

const API_BASE_URL = 'http://127.0.0.1:3000';

/**
 * 获取 Coin 列表
 */
export function useCoinList(page: number = 1, pageSize: number = 9) {
  return useQuery<CoinListResponse>({
    queryKey: ['coins', page, pageSize],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/events?page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch coins');
      }
      
      return response.json();
    },
    staleTime: 30000, // 30 秒内不重新请求
  });
}

/**
 * 根据 mint 获取单个 Coin
 */
export function useCoin(mint: string) {
  return useQuery({
    queryKey: ['coin', mint],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/events/mint/${mint}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch coin');
      }
      
      return response.json();
    },
    enabled: !!mint,
  });
}
