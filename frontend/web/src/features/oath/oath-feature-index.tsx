/**
 * Oath 列表页面
 */

import { OathList } from '@/components/oath';
import { useIsInitialized } from '@/lib/contract';

export default function OathIndexFeature() {
  const { data: isInitialized, isLoading, error } = useIsInitialized();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">我的誓言</h1>
        <p className="text-gray-600">查看和管理你创建的所有誓言</p>
      </div>

      {/* 全局状态信息 */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">正在加载合约状态...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-bold mb-2">无法连接到合约</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && isInitialized && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">合约已就绪</span>
            </div>
            <div className="text-sm text-green-600">
              可以创建和管理誓言
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && !isInitialized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-yellow-800 font-bold mb-2">合约未初始化</h3>
              <p className="text-yellow-700 mb-4">
                Oath 合约尚未初始化，需要管理员执行初始化操作后才能使用。
              </p>
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={() => window.location.href = '/oath/initialize'}
              >
                前往初始化
              </button>
            </div>
          </div>
        </div>
      )}
      
      <OathList />
    </div>
  );
}
