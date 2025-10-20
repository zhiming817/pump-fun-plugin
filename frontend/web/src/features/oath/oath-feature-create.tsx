/**
 * 创建誓言页面
 */

import { CreateOathForm } from '@/components/oath';
import { useNavigate } from 'react-router';

export default function OathCreateFeature() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/oath')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← 返回列表
          </button>
          <h1 className="text-4xl font-bold mb-2">创建新誓言</h1>
          <p className="text-gray-600">填写下面的表单创建你的誓言承诺</p>
        </div>
        
        <CreateOathForm />
      </div>
    </div>
  );
}
