/**
 * Coin 事件类型定义
 */

export interface CoinEvent {
  id: number;
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  bonding_curve: string;
  user_account: string;
  creator: string;
  timestamp: number;
  virtual_token_reserves: number;
  virtual_sol_reserves: number;
  real_token_reserves: number;
  token_total_supply: number;
  signature: string | null;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  image: string | null;
  created_at: string;
}

export interface CoinListResponse {
  success: boolean;
  data: CoinEvent[];
  error: string | null;
  total: number;
  page: number;
  page_size: number;
}
