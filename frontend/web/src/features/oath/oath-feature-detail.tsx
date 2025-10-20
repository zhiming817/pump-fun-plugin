/**
 * 誓言详情页面
 */

import { useParams, useNavigate } from 'react-router';
import { useOath } from '@/lib/contract';
import { OathCard } from '@/components/oath/OathCard.tsx';

export default function OathDetailFeature() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: oath, isLoading, error } = useOath(id || null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">加载失败: {error.message}</p>
          <button
            onClick={() => navigate('/oath')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← 返回列表
          </button>
        </div>
      </div>
    );
  }

  if (!oath) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">未找到该誓言</p>
          <button
            onClick={() => navigate('/oath')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← 返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/oath')}
        className="text-blue-600 hover:text-blue-800 mb-6"
      >
        ← 返回列表
      </button>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">誓言详情</h1>
        <OathCard oath={oath} />
      </div>
    </div>
  );
}
