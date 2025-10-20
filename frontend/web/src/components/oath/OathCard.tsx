/**
 * 誓言卡片组件
 */

import { Oath, getOathStatusText, getOathStatusColor } from '@/lib/contract/types';

interface OathCardProps {
  oath: Oath;
  onComplete?: (oathId: bigint) => void;
  onSlash?: (oathId: bigint) => void;
}

export function OathCard({ oath, onComplete, onSlash }: OathCardProps) {
  const statusColor = getOathStatusColor(oath.status);
  const statusText = getOathStatusText(oath.status);
  
  // 格式化日期
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN');
  };

  // 格式化金额（从 lamports 转换为 SOL）
  const formatAmount = (lamports: bigint) => {
    return (Number(lamports) / 1e9).toFixed(4);
  };

  // 判断是否已过期
  const isExpired = Number(oath.endTime) < Date.now() / 1000;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* 状态标签 */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
        >
          {statusText}
        </span>
        <span className="text-gray-500 text-sm">
          ID: {oath.id.toString()}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-xl font-bold mb-2">{oath.content}</h3>

      {/* 类别 */}
      <div className="text-sm text-gray-600 mb-4">
        分类: {oath.category}
      </div>

      {/* 详细信息 */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">稳定币抵押:</span>
          <span className="font-medium">{formatAmount(oath.stableCollateral)} SOL</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">截止日期:</span>
          <span className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
            {formatDate(oath.endTime)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">创建时间:</span>
          <span className="text-gray-700">{formatDate(oath.createdAt)}</span>
        </div>

        {oath.status === 1 && (
          <div className="flex justify-between">
            <span className="text-gray-500">完成时间:</span>
            <span className="text-green-600">{formatDate(oath.updatedAt)}</span>
          </div>
        )}

        {oath.slashingInfo && (
          <div className="flex justify-between">
            <span className="text-gray-500">削减时间:</span>
            <span className="text-red-600">{formatDate(oath.slashingInfo.slashingTime)}</span>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-4 flex gap-2">
        {oath.status === 0 && onComplete && (
          <button
            onClick={() => onComplete(oath.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            完成誓言
          </button>
        )}

        {oath.status === 0 && isExpired && onSlash && (
          <button
            onClick={() => onSlash(oath.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            削减抵押
          </button>
        )}
      </div>
    </div>
  );
}
