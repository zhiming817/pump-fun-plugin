/**
 * Phantom Wallet Injector
 * 
 * 这个脚本会被注入到页面的真实环境（Main World）中
 * 用于访问 Phantom 钱包注入的 window.solana 对象
 */

export function injectPhantomBridge(): void {
  // 使用 postMessage 方式与页面通信，避免注入内联脚本
  console.log('[Phantom Bridge] Initializing bridge communication');
  
  // 检测 Phantom
  function detectPhantom() {
    const phantom = window.solana;
    
    if (phantom?.isPhantom) {
      console.log('[Phantom Bridge] Phantom detected!');
      window.postMessage({
        type: 'PHANTOM_DETECTED',
        data: {
          isPhantom: true,
          publicKey: phantom.publicKey?.toBase58() || null,
          connected: !!phantom.publicKey
        }
      }, '*');
      return true;
    }
    
    console.log('[Phantom Bridge] Phantom not detected yet');
    return false;
  }
  
  // 立即检测
  if (!detectPhantom()) {
    // 如果没检测到，监听 Phantom 加载
    let attempts = 0;
    const maxAttempts = 50;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (detectPhantom()) {
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        console.log('[Phantom Bridge] Phantom not found after', maxAttempts, 'attempts');
        clearInterval(checkInterval);
        
        window.postMessage({
          type: 'PHANTOM_NOT_FOUND'
        }, '*');
      }
    }, 100);
  }
  
  // 监听来自页面的消息
  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'CONNECT_PHANTOM':
        await connectPhantom();
        break;
      case 'SIGN_PHANTOM_MESSAGE':
        await signPhantomMessage(data.message);
        break;
      case 'DISCONNECT_PHANTOM':
        await disconnectPhantom();
        break;
    }
  });
  
  // 连接函数
  async function connectPhantom() {
    const phantom = window.solana;
    
    if (!phantom?.isPhantom || !phantom.connect) {
      window.postMessage({
        type: 'PHANTOM_CONNECT_ERROR',
        error: 'Phantom not found'
      }, '*');
      return;
    }
    
    try {
      const response = await phantom.connect();
      const publicKey = response.publicKey.toBase58();
      
      window.postMessage({
        type: 'PHANTOM_CONNECTED',
        data: { publicKey }
      }, '*');
    } catch (error: any) {
      window.postMessage({
        type: 'PHANTOM_CONNECT_ERROR',
        error: error?.message || 'Unknown error'
      }, '*');
    }
  }
  
  // 签名函数
  async function signPhantomMessage(message: string) {
    const phantom = window.solana;
    
    if (!phantom?.isPhantom || !phantom.signMessage) {
      window.postMessage({
        type: 'PHANTOM_SIGN_ERROR',
        error: 'Phantom not found'
      }, '*');
      return;
    }
    
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const { signature } = await phantom.signMessage(encodedMessage, 'utf8');
      
      window.postMessage({
        type: 'PHANTOM_SIGNED',
        data: { signature: Array.from(signature) }
      }, '*');
    } catch (error: any) {
      window.postMessage({
        type: 'PHANTOM_SIGN_ERROR',
        error: error?.message || 'Unknown error'
      }, '*');
    }
  }
  
  // 断开连接函数
  async function disconnectPhantom() {
    const phantom = window.solana;
    
    if (!phantom?.isPhantom || !phantom.disconnect) {
      return;
    }
    
    try {
      await phantom.disconnect();
      window.postMessage({
        type: 'PHANTOM_DISCONNECTED'
      }, '*');
    } catch (error: any) {
      console.error('[Phantom Bridge] Disconnect error:', error);
    }
  }
  
  // 监听账户变化
  if (window.solana?.isPhantom && typeof (window.solana as any).on === 'function') {
    (window.solana as any).on('accountChanged', (publicKey: any) => {
      if (publicKey) {
        window.postMessage({
          type: 'PHANTOM_ACCOUNT_CHANGED',
          data: { publicKey: publicKey.toBase58() }
        }, '*');
      } else {
        window.postMessage({
          type: 'PHANTOM_DISCONNECTED'
        }, '*');
      }
    });
  }
  
  console.log('[Phantom Injector] Bridge communication initialized');
}

