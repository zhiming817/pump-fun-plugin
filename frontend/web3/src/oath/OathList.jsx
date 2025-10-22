import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { getOathCount, getOathList } from '../utils/oath/index.js';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

export default function OathList() {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [oaths, setOaths] = useState([]);
  const [oathCount, setOathCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOaths();
  }, []);

  const loadOaths = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取 Oath 数量
      const count = await getOathCount();
      setOathCount(count);

      // 获取 Oath 列表
      const oathList = await getOathList(20);
      setOaths(oathList);

      console.log('Loaded oaths:', oathList);
    } catch (err) {
      console.error('Error loading oaths:', err);
      setError(err.message || 'Failed to load oaths');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOath = () => {
    navigate('/oaths/create');
  };

  const handleViewOath = (oathId) => {
    navigate(`/oaths/${oathId}`);
  };

  const formatCollateral = (amount) => {
    // 假设是 6 位小数 (USDC/USDT)
    const value = amount / 1000000;
    return value.toLocaleString();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 64px)'}}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-400">Loading oaths...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">
                  Active Oaths
                </h1>
              </div>
              <p className="text-gray-400">
               Track all oaths grouped by deadline. Successful projects share rewards from failed oaths in their group.
              </p>
            </div>
            <button
              onClick={handleCreateOath}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl"
            >
              + Create New Oath
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Oaths</p>
                  <p className="text-3xl font-bold text-emerald-400">{oathCount}</p>
                </div>
                <div className="text-4xl">📜</div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">My Oaths</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {publicKey ? oaths.filter(o => o.creator === publicKey.toString()).length : 0}
                  </p>
                </div>
                <div className="text-4xl">👤</div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Oaths</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {oaths.filter(o => Object.keys(o.status)[0] === 'active').length}
                  </p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-400 text-xl mr-2">⚠️</span>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Oaths List */}
        {oaths.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No Oaths Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to create an oath and commit to your goals!
            </p>
            <button
              onClick={handleCreateOath}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Create Your First Oath
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oaths.map((oath) => (
              <div
                key={oath.id}
                onClick={() => handleViewOath(oath.id)}
                className="bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-md hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">Oath #{oath.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(oath.status)}`}>
                      {getStatusLabel(oath.status)}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg line-clamp-2">
                    {oath.content}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">📂</span>
                    <span>{oath.category}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">💰</span>
                    <span>${formatCollateral(oath.stableCollateral)} Collateral</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">📅</span>
                    <span>{formatDate(oath.startTime)} - {formatDate(oath.endTime)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">👤</span>
                    <span className="truncate" title={oath.creator}>
                      {oath.creator.substring(0, 8)}...{oath.creator.substring(oath.creator.length - 6)}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-[#0a0a0a] border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Created {formatDate(oath.createdAt)}</span>
                    <span className="text-emerald-400 font-medium hover:text-emerald-300">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
