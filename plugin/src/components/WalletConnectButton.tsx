/**
 * WalletConnectButton Component
 * 
 * 通过 postMessage 与页面注入的 Phantom 桥接脚本通信
 */

import React, { useState, useEffect, useCallback } from 'react';

interface WalletConnectButtonProps {
  onConnected?: (publicKey: string) => void;
  onDisconnected?: () => void;
}

// 主组件 - 通过 postMessage 与 Phantom 通信
export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ onConnected, onDisconnected }) => {
  const [phantomDetected, setPhantomDetected] = useState(false);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 监听来自页面的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 只处理来自同一个窗口的消息
      if (event.source !== window) {
        return;
      }

      const { type, data, error } = event.data;

      switch (type) {
        case 'PHANTOM_DETECTED':
          console.log('[Wallet] Phantom detected via bridge:', data);
          setPhantomDetected(true);
          if (data.connected && data.publicKey) {
            setConnected(true);
            setPublicKey(data.publicKey);
          }
          break;

        case 'PHANTOM_NOT_FOUND':
          console.log('[Wallet] Phantom not found');
          setPhantomDetected(false);
          break;

        case 'PHANTOM_CONNECTED':
          console.log('[Wallet] Connected:', data.publicKey);
          setConnected(true);
          setPublicKey(data.publicKey);
          setConnecting(false);
          // 自动触发签名
          requestSign(data.publicKey);
          break;

        case 'PHANTOM_CONNECT_ERROR':
          console.error('[Wallet] Connect error:', error);
          alert('连接失败: ' + error);
          setConnecting(false);
          break;

        case 'PHANTOM_SIGNED':
          console.log('[Wallet] Message signed');
          setSignatureStatus('success');
          setIsSigning(false);
          if (publicKey && onConnected) {
            onConnected(publicKey);
          }
          setTimeout(() => {
            setSignatureStatus('idle');
          }, 3000);
          break;

        case 'PHANTOM_SIGN_ERROR':
          console.error('[Wallet] Sign error:', error);
          setSignatureStatus('error');
          setIsSigning(false);
          setTimeout(() => {
            setSignatureStatus('idle');
          }, 3000);
          break;

        case 'PHANTOM_DISCONNECTED':
          console.log('[Wallet] Disconnected');
          setConnected(false);
          setPublicKey(null);
          setSignatureStatus('idle');
          if (onDisconnected) {
            onDisconnected();
          }
          break;

        case 'PHANTOM_ACCOUNT_CHANGED':
          console.log('[Wallet] Account changed:', data.publicKey);
          setPublicKey(data.publicKey);
          setConnected(true);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [publicKey, onConnected, onDisconnected]);

  // 请求签名
  const requestSign = useCallback((walletAddress: string) => {
    setIsSigning(true);
    setSignatureStatus('idle');

    const message = `🛡️ Antidump Plugin Wallet Connection\n\nI authorize this antidump plugin to connect to my wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}\n\nThis request will not trigger any blockchain transaction or cost any gas fees.`;
    
    // 通过 postMessage 发送签名请求
    window.postMessage({
      type: 'SIGN_PHANTOM_MESSAGE',
      data: { message }
    }, '*');
  }, []);

  // 连接 Phantom 钱包
  const handleConnect = useCallback(() => {
    if (!phantomDetected) {
      alert('请先安装 Phantom 钱包扩展');
      window.open('https://phantom.app/', '_blank');
      return;
    }

    setConnecting(true);
    console.log('[Wallet] Requesting connection...');
    
    // 通过 postMessage 发送连接请求
    window.postMessage({
      type: 'CONNECT_PHANTOM'
    }, '*');
  }, [phantomDetected]);

  // 断开连接
  const handleDisconnect = useCallback(() => {
    console.log('[Wallet] Requesting disconnect...');
    
    // 通过 postMessage 发送断开连接请求
    window.postMessage({
      type: 'DISCONNECT_PHANTOM'
    }, '*');
  }, []);

  // 未连接状态 - 显示 Phantom 按钮
  if (!connected) {
    return (
      <div className="wallet-connect-container">
        <div className="wallet-list-title">选择钱包</div>
        <div className="wallet-list">
          <button
            className="wallet-list-item"
            onClick={handleConnect}
            disabled={connecting || !phantomDetected}
          >
            <img 
              src="https://phantom.app/img/phantom-logo.svg"
              alt="Phantom"
              className="wallet-icon"
            />
            <span className="wallet-name">Phantom</span>
            {connecting && <span className="wallet-connecting">连接中...</span>}
          </button>
          
          {!phantomDetected && (
            <div className="wallet-list-empty">
              <p>未检测到 Phantom 钱包</p>
              <p className="wallet-list-hint">请先安装 Phantom 钱包扩展</p>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="wallet-install-link"
              >
                👉 点击安装 Phantom
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 已连接状态
  return (
    <div className="wallet-connect-container">
      <div className="wallet-info">
        <div className="wallet-status">
          {isSigning && (
            <span className="wallet-status-signing">
              <span className="spinner"></span>
              正在签名...
            </span>
          )}
          {signatureStatus === 'success' && (
            <span className="wallet-status-success">
              ✓ 签名成功！钱包已连接
            </span>
          )}
          {signatureStatus === 'error' && (
            <span className="wallet-status-error">
              ✗ 签名失败，请重试
            </span>
          )}
        </div>
        
        {signatureStatus === 'success' && publicKey && (
          <div className="wallet-address">
            <span className="wallet-address-label">已连接:</span>
            <span className="wallet-address-value">
              {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
            </span>
          </div>
        )}
        
        {signatureStatus === 'error' && publicKey && (
          <button className="wallet-retry-button" onClick={() => requestSign(publicKey)}>
            重试签名
          </button>
        )}
        
        <button className="wallet-disconnect-button" onClick={handleDisconnect}>
          断开连接
        </button>
      </div>
    </div>
  );
};

export default WalletConnectButton;

