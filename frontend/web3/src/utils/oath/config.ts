import { Connection, PublicKey, Commitment } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { NETWORK_CONFIG } from '../../config.js';
import { IDL } from '../../idl/pumpfun_oath_contract_idl.js';

// Oath 合约配置
export const OATH_CONTRACT_CONFIG = {
  PROGRAM_ID: 'Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ',
  SEEDS: {
    GLOBAL_STATE: 'global_state',
    OATH: 'oath',
    COLLATERAL_POOL: 'collateral_pool'
  }
};

// 初始化 Solana 连接
export const connection = new Connection(
  NETWORK_CONFIG.RPC_URL,
  (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment
);

// 获取 Program 实例
export function getOathProgram(wallet: any): Program {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment }
  );
  
  const program = new Program(
    IDL as any,
    provider
  );
  
  return program;
}

// 创建只读的 Program 实例
export function getReadOnlyOathProgram(): Program {
  const provider = new AnchorProvider(
    connection,
    { publicKey: PublicKey.default } as any,
    { commitment: (NETWORK_CONFIG.COMMITMENT || 'confirmed') as Commitment }
  );
  
  return new Program(
    IDL as any,
    provider
  );
}
