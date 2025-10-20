/**
 * 初始化合约组件
 */

import { useState } from 'react';
import { useInitializeContract, useIsInitialized } from '@/lib/contract';
import { useWalletUi } from '@wallet-ui/react';

export function InitializeContract() {
  const { account } = useWalletUi();
  const { mutate: initialize, isPending } = useInitializeContract(account ?? null);
  const { data: isInitialized, isLoading } = useIsInitialized();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInitialize = () => {
    if (!account) {
      setErrorMsg('请先连接钱包');
      return;
    }
    
    setSuccess(false);
    setErrorMsg(null);
    initialize();
  };

  // 如果已初始化，显示成功消息
  if (isInitialized && !isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-green-800 font-bold mb-2">合约已初始化</h3>
              <p className="text-green-700">
                Oath 合约已经完成初始化，可以开始创建誓言了。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">初始化 Oath 合约</h3>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          初始化合约将创建以下账户：
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
          <li>全局状态账户 (Global State)</li>
          <li>抵押池账户 (Collateral Pool)</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>注意：</strong>
        </p>
        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
          <li>• 只有合约管理员可以执行初始化</li>
          <li>• 需要支付账户租金（约 0.01 SOL）</li>
          <li>• 合约只能初始化一次</li>
        </ul>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800 font-medium">初始化成功！</p>
          </div>
          <p className="text-sm text-green-600 mt-2">
            合约已成功初始化，页面将自动刷新...
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-medium">初始化失败</p>
          <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={handleInitialize}
        disabled={isPending || success}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {isPending ? '初始化中...' : success ? '已初始化' : '执行初始化'}
      </button>
    </div>
  );
}
