/**
 * 检查合约是否已初始化
 * 
 * 通过查询 global_state PDA 账户是否存在来判断
 */

import { useQuery } from '@tanstack/react-query';
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUi } from '@wallet-ui/react';
import { deriveGlobalStatePDA } from '../instructions';

export function useIsInitialized() {
  const { connected } = useWalletUi();
  const { client } = useSolana();

  return useQuery({
    queryKey: ['oath', 'isInitialized'],
    queryFn: async () => {
      try {
        const [globalState] = await deriveGlobalStatePDA();
        
        // 转换 PublicKey 到 Address (gill 格式)
        const globalStateAddress = globalState.toBase58() as any;
        
        const { value: accountInfo } = await client.rpc
          .getAccountInfo(globalStateAddress, { encoding: 'base64' })
          .send();
        
        // 如果账户存在且有数据，说明已初始化
        return accountInfo !== null && accountInfo.data && accountInfo.data.length > 0;
      } catch (error) {
        console.error('[useIsInitialized] 查询失败:', error);
        return false;
      }
    },
    enabled: connected,
    staleTime: 30000, // 30秒缓存
  });
}
