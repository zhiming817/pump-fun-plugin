/**
 * 完成誓言 Hook
 * 
 * TODO: 实现真实的完成誓言交易
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletUi } from '@wallet-ui/react';
import { toast } from 'sonner';

export function useCompleteOath() {
  const { account } = useWalletUi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (oathId: string) => {
      if (!account) {
        throw new Error('请先连接钱包');
      }

      console.warn('[TODO] 需要实现真实的完成誓言交易', oathId);
      
      // Mock 延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      throw new Error('完成誓言功能尚未实现。请先部署智能合约到 Solana。');
    },
    onSuccess: (_, oathId) => {
      toast.success('誓言完成！抵押金已返还。');
      queryClient.invalidateQueries({ queryKey: ['oath', 'userOaths'] });
      queryClient.invalidateQueries({ queryKey: ['oath', 'detail', oathId] });
    },
    onError: (error: Error) => {
      toast.error(`完成失败: ${error.message}`);
      console.error('完成誓言错误:', error);
    },
  });
}
