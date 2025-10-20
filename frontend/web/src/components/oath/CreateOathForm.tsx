/**
 * 创建誓言表单组件
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCreateOath, useIsInitialized } from '@/lib/contract';
import { CreateOathArgs } from '@/lib/contract/types-v2';
import { useWalletUi } from '@wallet-ui/react';

export function CreateOathForm() {
  const navigate = useNavigate();
  const { account } = useWalletUi();
  const { mutate: createOath, isPending } = useCreateOath(account ?? null);
  const { data: isInitialized, isLoading: isCheckingInit, error: initError } = useIsInitialized();
  const [formData, setFormData] = useState({
    content: '',
    category: '',
    startTime: '',
    endTime: '',
    collateral: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查是否已初始化
    if (!isInitialized) {
      alert('合约未初始化，请先初始化合约');
      return;
    }

    try {
      // 转换日期为 Unix 时间戳
      const startTimestamp = BigInt(
        Math.floor(new Date(formData.startTime).getTime() / 1000)
      );
      const endTimestamp = BigInt(
        Math.floor(new Date(formData.endTime).getTime() / 1000)
      );
      
      // 解析抵押金额（假设是 SOL，转换为 lamports）
      const collateralAmount = parseFloat(formData.collateral) || 0;
      const stableCollateral = BigInt(Math.floor(collateralAmount * 1000000000)); // SOL to lamports

      const args: CreateOathArgs = {
        content: formData.content,
        category: formData.category,
        categoryId: 'default', // 默认分类 ID
        startTime: startTimestamp,
        endTime: endTimestamp,
        stableCollateral: stableCollateral,
        collateralTokens: [], // 暂时为空数组
        isOverCollateralized: stableCollateral > BigInt(1000000000), // 超过 1 SOL 认为过度抵押
        tokenAddress: null, // 可选字段
        targetApy: null, // 可选字段
      };

      createOath(args);
      
      // 重置表单
      setFormData({
        content: '',
        category: '',
        startTime: '',
        endTime: '',
        collateral: '',
      });
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  // 加载状态
  if (isCheckingInit) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">检查合约状态...</span>
        </div>
      </div>
    );
  }

  // 错误状态
  if (initError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-bold mb-2">无法连接到合约</h3>
          <p className="text-red-600 mb-4">{initError.message}</p>
          <p className="text-sm text-gray-600">
            请检查：
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
            <li>钱包是否已连接</li>
            <li>网络连接是否正常</li>
            <li>RPC 节点是否可用</li>
          </ul>
        </div>
      </div>
    );
  }

  // 未初始化状态
  if (!isInitialized) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-yellow-800 font-bold mb-2">合约未初始化</h3>
              <p className="text-yellow-700 mb-4">
                在创建誓言之前，需要先初始化 Oath 合约。
              </p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">初始化合约需要：</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>拥有管理员权限</li>
                  <li>支付初始化费用（少量 SOL）</li>
                  <li>创建全局状态和抵押池账户</li>
                </ul>
              </div>
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={() => navigate('/oath/initialize')}
              >
                前往初始化
              </button>
              <p className="text-xs text-gray-500 mt-3">
                注意：只有合约管理员可以执行初始化操作
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 初始化状态信息 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-green-800 font-medium">合约已就绪</p>
            <p className="text-sm text-green-600">
              可以开始创建誓言
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">创建誓言</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            誓言内容 *
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="输入誓言内容"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            誓言分类 *
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="例如：学习、健身、工作等"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            开始时间 *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            结束时间 *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            抵押金额 (SOL) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.001"
            value={formData.collateral}
            onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isPending ? '创建中...' : '创建誓言'}
        </button>
      </form>
    </div>
  );
}
