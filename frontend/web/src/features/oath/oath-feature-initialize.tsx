/**
 * 初始化合约页面
 */

import { InitializeContract } from '@/components/oath';
import { useNavigate } from 'react-router';

export default function OathInitializeFeature() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/oath')}
          className="text-blue-600 hover:text-blue-800 mb-6"
        >
          ← 返回列表
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">初始化合约</h1>
          <p className="text-gray-600">
            首次使用前需要初始化 Oath 智能合约
          </p>
        </div>

        <InitializeContract />

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold mb-3">初始化后你可以：</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>创建和管理自己的誓言</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>质押代币作为承诺的抵押</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>完成誓言后取回抵押</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>参与誓言的监督和执行</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
