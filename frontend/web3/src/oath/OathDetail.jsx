import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { getOath, completeOath } from '../utils/oath/index.js';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

export default function OathDetail() {
  const { oathId } = useParams();
  const navigate = useNavigate();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const { setVisible } = useWalletModal();
  
  const [oath, setOath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    loadOath();
  }, [oathId]);

  const loadOath = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getOath(parseInt(oathId));
      
      if (result.success) {
        setOath(result.oath);
        console.log('Loaded oath:', result.oath);
      } else {
        setError(result.error || 'Failed to load oath');
      }
    } catch (err) {
      console.error('Error loading oath:', err);
      setError(err.message || 'Failed to load oath');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOath = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      setVisible(true);
      return;
    }

    if (!oath || oath.creator !== publicKey.toString()) {
      alert('Only the oath creator can complete this oath');
      return;
    }

    if (!evidence.trim()) {
      alert('Please provide evidence of completion');
      return;
    }

    setIsCompleting(true);
    try {
      const result = await completeOath(wallet, parseInt(oathId), evidence);
      
      alert(`Oath completed successfully!\nTransaction: ${result.transactionSignature}`);
      console.log('Oath completion result:', result);
      
      // 重新加载誓言详情
      await loadOath();
      setShowCompleteModal(false);
      setEvidence('');
    } catch (error) {
      console.error('Error completing oath:', error);
      alert('Failed to complete oath: ' + error.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatCollateral = (lamports) => {
    // 转换 lamports 为 SOL (1 SOL = 10^9 lamports)
    const value = lamports / 1000000000;
    return value.toFixed(4);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      active: 'Active',
      completed: 'Completed',
      expired: 'Expired',
      failed: 'Failed'
    };
    return statusMap[Object.keys(status)[0]] || 'Unknown';
  };

  const getStatusColor = (status) => {
    const statusKey = Object.keys(status)[0];
    const colorMap = {
      active: 'text-blue-400 bg-blue-500/20',
      completed: 'text-green-400 bg-green-500/20',
      expired: 'text-gray-400 bg-gray-500/20',
      failed: 'text-red-400 bg-red-500/20'
    };
    return colorMap[statusKey] || 'text-gray-400 bg-gray-500/20';
  };

  const isCreator = () => {
    return connected && publicKey && oath && oath.creator === publicKey.toString();
  };

  const canComplete = () => {
    if (!oath) return false;
    const statusKey = Object.keys(oath.status)[0];
    return isCreator() && statusKey === 'active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 64px)'}}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ade80] mb-4"></div>
            <p className="text-gray-400">Loading oath details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !oath) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-[#1a1a1a] border border-red-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300 mb-6">{error || 'Oath not found'}</p>
            <button
              onClick={() => navigate('/oaths')}
              className="px-6 py-3 bg-[#4ade80] text-black rounded-lg hover:bg-[#22c55e] font-medium transition-colors"
            >
              Back to Oaths
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/oaths')}
            className="flex items-center text-[#4ade80] hover:text-[#22c55e] mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Oaths
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Oath #{oath.id}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(oath.status)}`}>
              {getStatusLabel(oath.status)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] p-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Token Commitment</h2>
            <p className="text-lg font-mono break-all text-black/90">{oath.tokenAddress}</p>
          </div>

          {/* Details Grid */}
          <div className="p-8 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Target Market Cap</h3>
                <p className="text-lg font-medium text-white">🎯 ${(oath.targetMarketCap / 1000).toFixed(1)}K</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Creator</h3>
                <p className="text-sm font-mono text-gray-300 break-all">
                  {oath.creator}
                  {isCreator() && (
                    <span className="ml-2 text-xs bg-[#4ade80]/20 text-[#4ade80] px-2 py-1 rounded">You</span>
                  )}
                </p>
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Start Date</h3>
                <p className="text-lg font-medium text-white">📅 {formatDate(oath.startTime)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">End Date</h3>
                <p className="text-lg font-medium text-white">🏁 {formatDate(oath.endTime)}</p>
              </div>
            </div>

            {/* Collateral Info */}
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💰 Stake Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">SOL Staked:</span>
                  <span className="font-bold text-[#4ade80]">{formatCollateral(oath.solCollateral)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Market Cap:</span>
                  <span className="font-medium text-white">${oath.targetMarketCap.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Evidence */}
            {oath.evidence && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📝 Evidence of Completion</h3>
                <div className="bg-[#0f0f0f] border border-green-800 rounded-xl p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{oath.evidence}</p>
                </div>
              </div>
            )}

            {/* Slashing Info */}
            {oath.slashingInfo && (
              <div className="bg-[#0f0f0f] border border-red-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Slashing Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-400">Slashed Amount:</span>
                    <span className="font-bold text-white">{formatCollateral(oath.slashingInfo.slashedAmount)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Slashing Time:</span>
                    <span className="text-gray-300">{formatDate(oath.slashingInfo.slashingTime)}</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-red-400 font-medium">Reason:</span>
                    <p className="mt-1 text-red-300">{oath.slashingInfo.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Created At</h3>
                <p className="text-gray-300">{formatDate(oath.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Last Updated</h3>
                <p className="text-gray-300">{formatDate(oath.updatedAt)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {canComplete() && (
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full px-6 py-3 bg-[#4ade80] text-black rounded-lg hover:bg-[#22c55e] font-medium transition-colors"
                >
                  ✅ Complete Oath
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contract Address */}
        <div className="mt-4 bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">
            <span className="font-medium">Contract Address:</span>
            <span className="ml-2 font-mono text-xs break-all text-gray-500">{oath.address}</span>
          </div>
        </div>
      </div>

      {/* Complete Oath Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Complete Oath</h3>
            <p className="text-gray-400 mb-4">
              Provide evidence that you've completed your oath. This will be recorded on-chain.
            </p>
            <textarea
              placeholder="Describe how you completed your oath, include links, images, or other proof..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setEvidence('');
                }}
                disabled={isCompleting}
                className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-[#0f0f0f] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteOath}
                disabled={isCompleting || !evidence.trim()}
                className="flex-1 px-4 py-2 bg-[#4ade80] text-black rounded-lg hover:bg-[#22c55e] disabled:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isCompleting ? 'Completing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
