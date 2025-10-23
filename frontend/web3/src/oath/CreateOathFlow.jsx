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
    startTime: Math.floor(Date.now() / 1000) + 300, // 默认5分钟后开始
    endTime: Math.floor(Date.now() / 1000) + 10800, // 默认3小时
    stableCollateral: 5, // 默认5 SOL
    tokenAddress: '', // Token地址必填
    targetApy: 80000 // 默认目标市值 $80,000
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
    if (formData.stableCollateral < 0.1) {
      alert('Stake amount must be at least 0.1 SOL');
      return;
    }

    if (!formData.tokenAddress || formData.tokenAddress.trim() === '') {
      alert('Token address is required');
      return;
    }

    // 验证 Token 地址格式
    try {
      // 简单验证：应该是 Base58 格式，长度在 32-44 字符之间
      if (formData.tokenAddress.length < 32 || formData.tokenAddress.length > 44) {
        throw new Error('Invalid address length');
      }
    } catch (error) {
      alert('Please enter a valid Solana token address');
      return;
    }

    if (!formData.targetApy || formData.targetApy < 1000) {
      alert('Target market cap must be at least $1,000');
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Launch Your Oath
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Commit to your project's success. Stake SOL and prove your dedication to the community.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Build Trust Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
            <div className="w-12 h-12 mb-6 text-[#4ade80]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Build Trust</h3>
            <p className="text-gray-400 leading-relaxed">
              Show your commitment by staking SOL. Your oath proves you're here for the long term.
            </p>
          </div>

          {/* Time-Bound Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
            <div className="w-12 h-12 mb-6 text-[#4ade80]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Time-Bound</h3>
            <p className="text-gray-400 leading-relaxed">
              Choose your graduation timeline. Reach $80K market cap within your chosen timeframe.
            </p>
          </div>

          {/* Win Together Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
            <div className="w-12 h-12 mb-6 text-[#4ade80]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Win Together</h3>
            <p className="text-gray-400 leading-relaxed">
              Succeed and keep your stake. Fail and your stake rewards successful projects in your group.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 space-y-6">
          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.startTime)}
                onChange={(e) => handleDateChange('startTime', e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.endTime)}
                onChange={(e) => handleDateChange('endTime', e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
              />
            </div>
          </div>

          {/* Collateral */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stake Amount (SOL) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.stableCollateral}
                onChange={(e) => updateFormData('stableCollateral', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Minimum: 0.1 SOL. Your stake will be returned if you reach the target market cap.
            </p>
          </div>

          {/* Token Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Address *
            </label>
            <input
              type="text"
              placeholder="Enter Solana token address"
              value={formData.tokenAddress}
              onChange={(e) => updateFormData('tokenAddress', e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              The Solana token address you want to associate with this oath (e.g., from pump.fun)
            </p>
          </div>

          {/* Target Market Cap */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Market Cap (USDC) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">$</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={formData.targetApy || 80000}
                onChange={(e) => updateFormData('targetApy', parseFloat(e.target.value) || 80000)}
                placeholder="80000"
                className="w-full pl-8 pr-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Target market capitalization in USDC (e.g., $80,000)
            </p>
          </div>

          {/* Summary */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="font-medium text-gray-200">
                  {Math.ceil((formData.endTime - formData.startTime) / 3600)} hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stake:</span>
                <span className="font-medium text-gray-200">{formData.stableCollateral} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Market Cap:</span>
                <span className="font-medium text-gray-200">
                  ${(formData.targetApy || 80000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate('/oaths')}
              className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOath}
              disabled={isCreating || !connected}
              className="flex-1 px-6 py-3 bg-[#4ade80] text-black rounded-lg hover:bg-[#3dca6e] font-medium transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h4 className="font-semibold text-white mb-3">💡 How it works</h4>
          <ul className="text-sm text-gray-400 space-y-2">
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
