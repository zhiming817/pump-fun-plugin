import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { initializeVaultGlobal, getVaultCount, isVaultGlobalInitialized } from '../utils/contractUtils.ts';

export default function InitializeContract() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [isInitializing, setIsInitializing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(null);
  const [vaultCount, setVaultCount] = useState(0);
  const [message, setMessage] = useState('');

  // 自动检查初始化状态
  useEffect(() => {
    if (publicKey) {
      checkInitialization();
    }
  }, [publicKey]);

  const checkInitialization = async () => {
    setIsChecking(true);
    setMessage('');
    
    try {
      const initialized = await isVaultGlobalInitialized(wallet);
      setIsInitialized(initialized);
      
      if (initialized) {
        const count = await getVaultCount(wallet);
        setVaultCount(count);
        setMessage(`✅ Contract is initialized. Current vault count: ${count}`);
      } else {
        setVaultCount(0);
        setMessage('⚠️ Contract not initialized yet. Click "Initialize Contract" to initialize.');
      }
    } catch (error) {
      console.error('Error checking initialization:', error);
      setIsInitialized(false);
      setMessage(`❌ Error checking status: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInitialize = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setIsInitializing(true);
    setMessage('Initializing contract...');
    
    try {
      const result = await initializeVaultGlobal(wallet);
      setMessage(`✅ Contract initialized successfully! TX: ${result.transactionSignature}`);
      setIsInitialized(true);
      // 重新检查以获取最新状态
      await checkInitialization();
    } catch (error) {
      console.error('Error initializing contract:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Contract Initialization</h3>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Before creating vaults, the contract needs to be initialized once.
          Click "Check Status" to see if initialization is needed.
        </p>

        <div className="flex gap-3">
          <button
            onClick={checkInitialization}
            disabled={isChecking || !publicKey}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Check Status'}
          </button>

          {isInitialized === false && (
            <button
              onClick={handleInitialize}
              disabled={isInitializing || !publicKey}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isInitializing ? 'Initializing...' : 'Initialize Contract'}
            </button>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-800' 
              : message.startsWith('⚠️')
              ? 'bg-yellow-50 text-yellow-800'
              : 'bg-red-50 text-red-800'
          }`}>
            <p className="text-sm font-mono break-all">{message}</p>
          </div>
        )}

        {!publicKey && (
          <div className="text-sm text-gray-500">
            💡 Connect your wallet to check or initialize the contract
          </div>
        )}
      </div>
    </div>
  );
}
