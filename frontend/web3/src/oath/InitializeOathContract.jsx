import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { initializeOathGlobal, isOathGlobalInitialized } from '../utils/oath';

export default function InitializeOathContract() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const { setVisible } = useWalletModal();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      setIsChecking(true);
      const initialized = await isOathGlobalInitialized();
      setIsInitialized(initialized);
      console.log('Oath contract initialized:', initialized);
    } catch (error) {
      console.error('Error checking initialization:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInitialize = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      setVisible(true);
      return;
    }

    setIsInitializing(true);
    try {
      const result = await initializeOathGlobal(wallet);
      alert(`Contract initialized successfully!\nTransaction: ${result.transactionSignature}`);
      
      // 重新检查初始化状态
      await checkInitialization();
    } catch (error) {
      console.error('Error initializing contract:', error);
      alert('Failed to initialize contract: ' + error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isChecking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-800">Checking contract status...</span>
        </div>
      </div>
    );
  }

  if (isInitialized) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-green-800">Contract Initialized</h3>
            <p className="text-sm text-green-700">The Oath contract is ready to use</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start">
        <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-2">Contract Not Initialized</h3>
          <p className="text-sm text-yellow-700 mb-4">
            The Oath contract needs to be initialized before you can create oaths. This is a one-time operation.
          </p>
          {!connected ? (
            <button
              onClick={() => setVisible(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
            >
              Connect Wallet to Initialize
            </button>
          ) : (
            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isInitializing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing...
                </span>
              ) : (
                'Initialize Contract'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
