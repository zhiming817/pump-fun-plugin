/**
 * Window object type extensions
 * 扩展 Window 对象类型定义
 */

interface Window {
  // Metamask / Ethereum provider
  ethereum?: {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  };

  // Phantom wallet
  solana?: {
    isPhantom?: boolean;
    publicKey?: any;
    connect?: () => Promise<{ publicKey: any }>;
    disconnect?: () => Promise<void>;
    signMessage?: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
  };

  // Buffer polyfill
  Buffer?: typeof Buffer;
  global?: typeof globalThis;
  process?: any;
}

