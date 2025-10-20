/**
 * 誓言列表组件
 */

import { useUserOaths } from '@/lib/contract';
import type { Oath } from '@/lib/contract/types';
import { OathCard } from './OathCard.tsx';
import { useNavigate } from 'react-router';

export function OathList() {
  const { data: oaths = [], isLoading, error, refetch } = useUserOaths();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">加载失败: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          重试
        </button>
      </div>
    );
  }

  if (oaths.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-lg mb-4">暂无誓言</p>
        <p className="text-gray-500 text-sm mb-6">创建你的第一个誓言吧！</p>
        <button
          onClick={() => navigate('/oath/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          创建誓言
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">我的誓言</h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/oath/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + 创建誓言
          </button>
          <button
            onClick={() => refetch()}
            className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 border border-blue-600 rounded-lg transition-colors"
          >
            刷新
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {oaths.map((oath: Oath) => (
          <OathCard key={oath.id.toString()} oath={oath} />
        ))}
      </div>
    </div>
  );
}
