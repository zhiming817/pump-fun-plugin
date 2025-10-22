import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { createOath } from '../utils/oath/index.js';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

const CATEGORY_OPTIONS = [
  { id: 'health', name: 'Health & Fitness', icon: '💪' },
  { id: 'learning', name: 'Learning & Education', icon: '📚' },
  { id: 'career', name: 'Career & Business', icon: '💼' },
  { id: 'financial', name: 'Financial Goals', icon: '💰' },
  { id: 'personal', name: 'Personal Development', icon: '🌱' },
  { id: 'social', name: 'Social & Relationships', icon: '👥' },
  { id: 'creative', name: 'Creative Projects', icon: '🎨' },
  { id: 'other', name: 'Other', icon: '📌' }
];

export default function CreateOathFlow() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const { setVisible } = useWalletModal();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    content: '',
    category: '',
    categoryId: '',
    startTime: Math.floor(Date.now() / 1000) + 300, // 默认5分钟后开始
    endTime: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days default
    stableCollateral: 100,
    collateralTokens: [],
    isOverCollateralized: false,
    tokenAddress: null,
    targetApy: null
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategorySelect = (categoryId) => {
    const category = CATEGORY_OPTIONS.find(c => c.id === categoryId);
    updateFormData('category', category.name);
    updateFormData('categoryId', categoryId);
  };

  const handleCreateOath = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      setVisible(true);
      return;
    }

    // 防止重复提交
    if (isCreating) {
      console.log('⏳ Already creating oath, please wait...');
      return;
    }

    // 验证必填字段
    if (!formData.content.trim()) {
      alert('Please enter your oath content');
      return;
    }

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    if (formData.stableCollateral <= 0) {
      alert('Collateral amount must be greater than 0');
      return;
    }

    // 验证时间有效性
    const now = Math.floor(Date.now() / 1000);
    if (formData.endTime <= formData.startTime) {
      alert('End date must be after start date');
      return;
    }

    if (formData.endTime <= now) {
      alert('End date must be in the future');
      return;
    }

    setIsCreating(true);
    try {
      // 在提交时重新计算开始时间,确保是未来的时间(+60秒缓冲)
      const now = Math.floor(Date.now() / 1000);
      const submissionData = {
        ...formData,
        startTime: Math.max(formData.startTime, now + 60), // 至少在60秒后开始
        endTime: Math.max(formData.endTime, now + 86400)   // 确保结束时间也是有效的
      };
      
      const result = await createOath(wallet, submissionData);
      
      // 检查是否是"已处理"的成功结果
      if (result.note && result.note.includes('already been processed')) {
        alert(`Oath creation in progress!\nPlease check your oaths list.`);
        console.log('⚠️ Oath creation result (already processed):', result);
      } else {
        alert(`Oath created successfully!\nOath ID: ${result.oathId}\nTransaction: ${result.transactionSignature}`);
        console.log('✅ Oath creation result:', result);
      }
      
      // 导航到誓言列表或详情页
      if (result.oathId !== undefined) {
        navigate(`/oaths/${result.oathId}`);
      } else {
        navigate('/oaths');
      }
    } catch (error) {
      console.error('❌ Error creating oath:', error);
      
      // 简化的错误处理
      const errorMessage = error.message || String(error);
      if (errorMessage.includes('User rejected')) {
        alert('Transaction was cancelled.');
      } else {
        alert('Failed to create oath: ' + errorMessage);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const formatDateForInput = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().slice(0, 16);
  };

  const handleDateChange = (field, value) => {
    const timestamp = Math.floor(new Date(value).getTime() / 1000);
    updateFormData(field, timestamp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <button
                onClick={() => navigate('/oaths')}
                className="mr-3 p-2 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              🤝 Create New Oath
            </h1>
            {!connected && (
              <button
                onClick={() => setVisible(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Connect Wallet
              </button>
            )}
          </div>
          <p className="text-gray-600 ml-14">
            Make a commitment and stake collateral to keep yourself accountable
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Oath Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Oath / Commitment *
            </label>
            <textarea
              placeholder="I will exercise 5 times a week for the next 30 days..."
              value={formData.content}
              onChange={(e) => updateFormData('content', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Be specific and measurable with your commitment
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.categoryId === category.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.startTime)}
                onChange={(e) => handleDateChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.endTime)}
                onChange={(e) => handleDateChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Collateral */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collateral Amount (USDC) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stableCollateral}
                onChange={(e) => updateFormData('stableCollateral', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Amount to stake as commitment. You'll get it back if you complete your oath.
            </p>
          </div>

          {/* Over Collateralized Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="overCollateralized"
              checked={formData.isOverCollateralized}
              onChange={(e) => updateFormData('isOverCollateralized', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="overCollateralized" className="ml-2 text-sm text-gray-700">
              Over-collateralized (stake more than the minimum)
            </label>
          </div>

          {/* Optional: Target APY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target APY (Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.targetApy || ''}
                onChange={(e) => updateFormData('targetApy', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g., 12.5"
                className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Expected annual percentage yield if you're staking yield-generating tokens
            </p>
          </div>

          {/* Summary */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {Math.ceil((formData.endTime - formData.startTime) / 86400)} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collateral:</span>
                <span className="font-medium">${formData.stableCollateral} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">
                  {formData.categoryId ? CATEGORY_OPTIONS.find(c => c.id === formData.categoryId)?.name : 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate('/oaths')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOath}
              disabled={isCreating || !connected}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Oath...
                </span>
              ) : (
                'Create Oath'
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 How it works</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Stake collateral to commit to your goal</li>
            <li>• Complete your oath before the deadline</li>
            <li>• Provide evidence of completion to get your collateral back</li>
            <li>• Fail to complete and your collateral may be slashed</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
