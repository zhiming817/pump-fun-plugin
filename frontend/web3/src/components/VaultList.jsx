import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVaultCount, getVaultEvents } from '../utils/contractUtils.ts';
import { getStrategyNameById } from '../utils/strategyUtils.js';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

export default function VaultList() {
  const navigate = useNavigate();
  const [vaults, setVaults] = useState([]);
  const [vaultCount, setVaultCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVaults();
  }, []);

  const loadVaults = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取 Vault 数量
      const count = await getVaultCount();
      setVaultCount(count);

      // 获取 Vault 事件(作为 Vault 列表的数据源)
      const events = await getVaultEvents(20);
      setVaults(events);

      console.log('Loaded vaults:', events);
    } catch (err) {
      console.error('Error loading vaults:', err);
      setError(err.message || 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVault = () => {
    navigate('/vaults/create');
  };

  const handleViewVault = (vaultId) => {
    navigate(`/vaults/${vaultId}`);
  };

  const formatApy = (apy) => {
    return `${(apy / 100).toFixed(2)}%`;
  };

  const formatAmount = (amount) => {
    // 假设是 6 位小数
    const value = amount / 1000000;
    return value.toLocaleString();
  };

  const getRiskLabel = (level) => {
    const levels = ['Low Risk', 'Medium Risk', 'High Risk'];
    return levels[level] || 'Unknown';
  };

  const getRiskColor = (level) => {
    const colors = ['text-green-600 bg-green-50', 'text-yellow-600 bg-yellow-50', 'text-red-600 bg-red-50'];
    return colors[level] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 64px)'}}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading vaults...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
                          <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-800">
                🏦 AntiDump Vaults
              </h1>
            </div>
              <p className="text-gray-600">
                Explore and manage your DeFi vaults
              </p>
            </div>
            <button
              onClick={handleCreateVault}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              + Create New Vault
            </button>
          </div>

          {/* Stats 区域已隐藏
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon="📊"
              label="Total Vaults"
              value={vaultCount}
              color="blue"
            />
            <StatCard
              icon="💰"
              label="Total Value Locked"
              value="Loading..."
              color="green"
            />
            <StatCard
              icon="📈"
              label="Average APY"
              value="Loading..."
              color="purple"
            />
          </div>
          */}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600 text-xl mr-2">⚠️</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Vaults List */}
        {vaults.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Vaults Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to create a vault and start earning!
            </p>
            <button
              onClick={handleCreateVault}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Your First Vault
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <div
                key={vault.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                onClick={() => handleViewVault(vault.id)}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{vault.name}</h3>
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
                      #{vault.id}
                    </span>
                  </div>
                  <p className="text-indigo-100 text-sm">{vault.symbol}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* APY */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-gray-600 text-sm">Target APY</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatApy(vault.targetApy)}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <DetailRow
                      label="Initial Deposit"
                      value={`${formatAmount(vault.initialDeposit)} USDC`}
                    />
                    <DetailRow
                      label="Strategy"
                      value={getStrategyNameById(vault.strategyType)}
                    />
                    <DetailRow
                      label="Risk"
                      value={
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(vault.riskLevel)}`}>
                          {getRiskLabel(vault.riskLevel)}
                        </span>
                      }
                    />
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created by</span>
                      <span className="font-mono">
                        {vault.creator.slice(0, 6)}...{vault.creator.slice(-4)}
                      </span>
                    </div>
                    {vault.createdAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(Number(vault.createdAt)).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="px-6 pb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewVault(vault.id);
                    }}
                    className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadVaults}
            disabled={loading}
            className="px-6 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow disabled:opacity-50"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Utility Components
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
