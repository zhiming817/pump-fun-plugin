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
        // Provide more specific error messages
        if (result.error?.includes('does not exist')) {
          setError(`Oath #${oathId} does not exist. It may not have been created yet.`);
        } else if (result.error?.includes('Failed to decode')) {
          setError(`Oath #${oathId} exists but has corrupted data. Please contact support.`);
        } else {
          setError(result.error || 'Failed to load oath');
        }
      }
    } catch (err) {
      console.error('Error loading oath:', err);
      if (err.message?.includes('does not exist')) {
        setError(`Oath #${oathId} does not exist. It may not have been created yet.`);
      } else {
        setError(err.message || 'Failed to load oath');
      }
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

  const formatCollateral = (amount) => {
    const value = amount / 1000000;
    return value.toLocaleString();
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
      active: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      expired: 'text-gray-600 bg-gray-100',
      failed: 'text-red-600 bg-red-100'
    };
    return colorMap[statusKey] || 'text-gray-600 bg-gray-100';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 64px)'}}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading oath details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !oath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-6">{error || 'Oath not found'}</p>
            <button
              onClick={() => navigate('/oaths')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Oaths
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/oaths')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Oaths
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Oath #{oath.id}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(oath.status)}`}>
              {getStatusLabel(oath.status)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Commitment</h2>
            <p className="text-lg leading-relaxed">{oath.content}</p>
          </div>

          {/* Details Grid */}
          <div className="p-8 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Category</h3>
                <p className="text-lg font-medium text-gray-800">📂 {oath.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Creator</h3>
                <p className="text-lg font-mono text-gray-800 break-all">
                  {oath.creator}
                  {isCreator() && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">You</span>
                  )}
                </p>
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Start Date</h3>
                <p className="text-lg font-medium text-gray-800">📅 {formatDate(oath.startTime)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">End Date</h3>
                <p className="text-lg font-medium text-gray-800">🏁 {formatDate(oath.endTime)}</p>
              </div>
            </div>

            {/* Collateral Info */}
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Collateral Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stable Collateral:</span>
                  <span className="font-bold text-purple-600">${formatCollateral(oath.stableCollateral)} USDC</span>
                </div>
                {oath.isOverCollateralized && (
                  <div className="flex items-center text-sm text-purple-700">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Over-collateralized
                  </div>
                )}
                {oath.targetApy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target APY:</span>
                    <span className="font-medium text-gray-800">{(oath.targetApy / 100).toFixed(2)}%</span>
                  </div>
                )}
                {oath.currentApy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current APY:</span>
                    <span className="font-medium text-green-600">{(oath.currentApy / 100).toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence */}
            {oath.evidence && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Evidence of Completion</h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{oath.evidence}</p>
                </div>
              </div>
            )}

            {/* Slashing Info */}
            {oath.slashingInfo && (
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Slashing Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-600">Slashed Amount:</span>
                    <span className="font-bold">${formatCollateral(oath.slashingInfo.slashedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Slashing Time:</span>
                    <span>{formatDate(oath.slashingInfo.slashingTime)}</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-red-600 font-medium">Reason:</span>
                    <p className="mt-1 text-red-700">{oath.slashingInfo.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Created At</h3>
                <p className="text-gray-700">{formatDate(oath.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Last Updated</h3>
                <p className="text-gray-700">{formatDate(oath.updatedAt)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {canComplete() && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  ✅ Complete Oath
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contract Address */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Contract Address:</span>
            <span className="ml-2 font-mono text-xs break-all">{oath.address}</span>
          </div>
        </div>
      </div>

      {/* Complete Oath Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Oath</h3>
            <p className="text-gray-600 mb-4">
              Provide evidence that you've completed your oath. This will be recorded on-chain.
            </p>
            <textarea
              placeholder="Describe how you completed your oath, include links, images, or other proof..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setEvidence('');
                }}
                disabled={isCompleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteOath}
                disabled={isCompleting || !evidence.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
