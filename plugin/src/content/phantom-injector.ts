/**
 * Phantom Wallet Injector
 * 
 * 这个脚本会被注入到页面的真实环境（Main World）中
 * 用于访问 Phantom 钱包注入的 window.solana 对象
 */

export function injectPhantomBridge(): void {
  // 创建一个 script 标签，注入到页面中
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      console.log('[Phantom Bridge] Script injected into page context');
      
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
      
      // 暴露连接函数
      window.connectPhantom = async function() {
        const phantom = window.solana;
        
        if (!phantom?.isPhantom) {
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
        } catch (error) {
          window.postMessage({
            type: 'PHANTOM_CONNECT_ERROR',
            error: error.message
          }, '*');
        }
      };
      
      // 暴露签名函数
      window.signPhantomMessage = async function(message) {
        const phantom = window.solana;
        
        if (!phantom?.isPhantom) {
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
        } catch (error) {
          window.postMessage({
            type: 'PHANTOM_SIGN_ERROR',
            error: error.message
          }, '*');
        }
      };
      
      // 暴露断开连接函数
      window.disconnectPhantom = async function() {
        const phantom = window.solana;
        
        if (!phantom?.isPhantom) {
          return;
        }
        
        try {
          await phantom.disconnect();
          window.postMessage({
            type: 'PHANTOM_DISCONNECTED'
          }, '*');
        } catch (error) {
          console.error('[Phantom Bridge] Disconnect error:', error);
        }
      };
      
      // 监听账户变化
      if (window.solana?.isPhantom) {
        window.solana.on('accountChanged', (publicKey) => {
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
    })();
  `;
  
  // 注入到页面中（必须在 head 或 body 存在后）
  (document.head || document.documentElement).appendChild(script);
  
  // 注入后立即移除 script 标签（代码已经执行了）
  script.remove();
  
  console.log('[Phantom Injector] Bridge script injected into page');
}

