import React, { useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clusterApiUrl } from '@solana/web3.js';
import Home from './oath/Home.jsx';
import CreateVaultFlow from './components/CreateVaultFlow.jsx';
import VaultList from './components/VaultList.jsx';
import VaultDetail from './components/VaultDetail.jsx';
import OathList from './oath/OathList.jsx';
import CreateOathFlow from './oath/CreateOathFlow.jsx';
import OathDetail from './oath/OathDetail.jsx';
import ProtocolStats from './oath/ProtocolStats.jsx';
import BrowseProjects from './oath/BrowseProjects.jsx';
import { NETWORK_CONFIG } from './config.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient();

function App() {
  // 使用配置文件中的网络设置
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => NETWORK_CONFIG.RPC_URL || clusterApiUrl(network), [network]);

  // 配置支持的钱包
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <HashRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vaults" element={<VaultList />} />
                <Route path="/vaults/create" element={<CreateVaultFlow />} />
                <Route path="/vaults/:vaultId" element={<VaultDetail />} />
                
                {/* Oath Routes */}
                <Route path="/oaths" element={<OathList />} />
                <Route path="/oaths/create" element={<CreateOathFlow />} />
                <Route path="/oaths/:oathId" element={<OathDetail />} />
                <Route path="/stats" element={<ProtocolStats />} />
                <Route path="/projects" element={<BrowseProjects />} />
              </Routes>
            </HashRouter>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}

export default App;