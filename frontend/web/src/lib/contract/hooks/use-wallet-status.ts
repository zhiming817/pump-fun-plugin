/**
 * 钱包状态 Hook
 */

import { useSolana } from '@/components/solana/use-solana';
import { useWalletUi } from '@wallet-ui/react';

export function useWalletStatus() {
  const { account, connected } = useWalletUi();
  const { client } = useSolana();

  return {
    connected,
    address: account?.address,
    account,
    client,
  };
}
