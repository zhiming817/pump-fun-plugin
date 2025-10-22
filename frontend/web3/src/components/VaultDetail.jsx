import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVault, getVaultEvents } from '../utils/contractUtils.ts';
import { getStrategyNameById } from '../utils/strategyUtils.js';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

export default function VaultDetail() {
  const { vaultId } = useParams();
  const navigate = useNavigate();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'strategy', 'markets', 'performance'

  useEffect(() => {
    loadVaultDetails();
  }, [vaultId]);

  const loadVaultDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading vault details for ID:', vaultId);
      const result = await getVault(Number(vaultId));
      
      if (result.success && result.vault) {
        setVault(result.vault);
        console.log('Vault loaded:', result.vault);
      } else {
        setError(result.error || 'Failed to load vault details');
      }
    } catch (err) {
      console.error('Error loading vault:', err);
      setError(err.message || 'Failed to load vault details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading vault details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Vault</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <span className="mr-2">←</span>
            Back
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Vault #{vaultId}
                  </h1>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <p className="text-gray-600">
                  View detailed information about this vault
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Total Value Locked</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {vault?.state?.totalAssetsUsdFormatted || vault?.state?.totalAssetsFormatted || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'strategy', label: 'Strategy', icon: '🎯' },
                { id: 'markets', label: 'Markets', icon: '🏦' },
                { id: 'performance', label: 'Performance', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab vault={vault} vaultId={vaultId} />
            )}
            {activeTab === 'strategy' && (
              <StrategyTab vault={vault} />
            )}
            {activeTab === 'markets' && (
              <MarketsTab vault={vault} />
            )}
            {activeTab === 'performance' && (
              <PerformanceTab vault={vault} />
            )}
          </div>
        </div>

        {/* Raw Data (for debugging) */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Raw Data (Debug)</h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
            <pre className="text-xs text-gray-600">
              {JSON.stringify(vault, null, 2)}
            </pre>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ vault, vaultId }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const eventData = await getVaultEvents(10);
      // Filter events for this vault
      const vaultEvents = eventData.filter(e => e.id === Number(vaultId));
      setEvents(vaultEvents);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Target APY"
          value={vault?.state?.apyPercent || 'N/A'}
          icon="🎯"
          color="blue"
        />
        <MetricCard
          label="Current APY"
          value={vault?.state?.currentApyPercent || 'N/A'}
          icon="📈"
          color="green"
        />
        <MetricCard
          label="Total Assets"
          value={vault?.state?.totalAssetsUsdFormatted || vault?.state?.totalAssetsFormatted || 'N/A'}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Vault Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vault Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Vault ID" value={vaultId} />
          <InfoRow label="Vault Name" value={vault?.configuration?.name || 'N/A'} />
          <InfoRow label="Symbol" value={vault?.configuration?.symbol || 'N/A'} />
          <InfoRow label="Status" value="Active" />
          <InfoRow label="Curator" value={vault?.configuration?.curator || 'N/A'} />
          <InfoRow label="Timelock" value={vault?.configuration?.timelockDays ? `${vault.configuration.timelockDays} days` : 'N/A'} />
          <InfoRow label="Management Fee" value={vault?.configuration?.feeRatePercent || 'N/A'} />
          <InfoRow label="Performance Fee" value={vault?.configuration?.performanceFeePercent || 'N/A'} />
          <InfoRow label="Creator" value={vault?.creator ? `${vault.creator.slice(0, 8)}...${vault.creator.slice(-6)}` : 'N/A'} />
          <InfoRow label="Share Price" value={vault?.state?.sharePriceFormatted || 'N/A'} />
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Events</h3>
        {loadingEvents ? (
          <div className="text-center py-4 text-gray-500">Loading events...</div>
        ) : events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="bg-white rounded p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{event.name}</span>
                  <span className="text-gray-500">
                    {new Date(Number(event.createdAt)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No events found</div>
        )}
      </div>
    </div>
  );
}

// Strategy Tab Component
function StrategyTab({ vault }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Strategy Details</h3>
        <div className="space-y-4">
          <InfoRow label="Strategy Name" value={vault?.strategy?.name || 'N/A'} />
          <InfoRow label="Strategy Type" value={getStrategyNameById(vault?.strategy?.strategyType) || 'N/A'} />
          <InfoRow 
            label="Risk Level" 
            value={
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                vault?.strategy?.riskLevel === 0 ? 'bg-green-100 text-green-800' :
                vault?.strategy?.riskLevel === 1 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {vault?.strategy?.riskLevelText || 'N/A'}
              </span>
            } 
          />
          <InfoRow label="Min Duration" value={vault?.strategy?.minDuration ? `${vault.strategy.minDuration} days` : 'N/A'} />
          <InfoRow label="Max Duration" value={vault?.strategy?.maxDuration ? `${vault.strategy.maxDuration} days` : 'N/A'} />
          <InfoRow label="Auto Compound" value={vault?.strategy?.autoCompound ? '✅ Yes' : '❌ No'} />
          <InfoRow label="Emergency Exit" value={vault?.strategy?.emergencyExit ? '✅ Enabled' : '❌ Disabled'} />
          {vault?.strategy?.supportedTokens && vault.strategy.supportedTokens.length > 0 && (
            <InfoRow 
              label="Supported Tokens" 
              value={vault.strategy.supportedTokens.join(', ')} 
            />
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ Strategy Description</h4>
        <p className="text-blue-800 text-sm">
          {vault?.strategy?.description || 'No description available.'}
        </p>
      </div>
      
      {vault?.configuration?.description && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">📝 Vault Description</h4>
          <p className="text-purple-800 text-sm">
            {vault.configuration.description}
          </p>
        </div>
      )}
    </div>
  );
}

// Markets Tab Component
function MarketsTab({ vault }) {
  const allocations = vault?.configuration?.allocations || [];
  const markets = vault?.configuration?.markets || [];
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Allocations</h3>
        
        {allocations.length > 0 ? (
          <div className="space-y-4">
            {allocations.map((allocation, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">
                    {markets[index] || allocation.marketAddress}
                  </h4>
                  <span className="text-lg font-bold text-indigo-600">
                    {allocation.allocationPercent}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between py-1">
                    <span>Market Address:</span>
                    <span className="font-mono text-xs">
                      {allocation.marketAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Allocation (basis points):</span>
                    <span>{allocation.allocationPercentage}</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(allocation.allocationPercentage / 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No market allocations configured yet.
          </div>
        )}
      </div>
      
      {/* Active Allocations */}
      {vault?.allocations && vault.allocations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Allocations</h3>
          <div className="space-y-4">
            {vault.allocations.map((alloc, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Market Address" value={alloc.marketAddress} />
                  <InfoRow label="Supply Assets" value={alloc.supplyAssetsFormatted} />
                  <InfoRow label="Supply Assets (USD)" value={alloc.supplyAssetsUsdFormatted} />
                  <InfoRow label="Expected APY" value={alloc.expectedApyPercent} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Performance Tab Component
function PerformanceTab({ vault }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow 
            label="Target APY" 
            value={vault?.state?.apyPercent || 'N/A'} 
          />
          <InfoRow 
            label="Current APY" 
            value={vault?.state?.currentApyPercent || 'N/A'} 
          />
          <InfoRow 
            label="Total Assets" 
            value={vault?.state?.totalAssetsFormatted || 'N/A'} 
          />
          <InfoRow 
            label="Total Assets (USD)" 
            value={vault?.state?.totalAssetsUsdFormatted || 'N/A'} 
          />
          <InfoRow 
            label="Total Supply" 
            value={vault?.state?.totalSupplyFormatted || 'N/A'} 
          />
          <InfoRow 
            label="Share Price" 
            value={vault?.state?.sharePriceFormatted || 'N/A'} 
          />
          <InfoRow 
            label="Performance Fees Collected" 
            value={vault?.state?.performanceFeeCollectedFormatted || 'N/A'} 
          />
        </div>
      </div>

      {/* APY Comparison */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">APY Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Target APY</span>
              <span className="font-medium">{vault?.state?.apyPercent || 'N/A'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((vault?.state?.apy || 0) / 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current APY</span>
              <span className="font-medium">{vault?.state?.currentApyPercent || 'N/A'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((vault?.state?.currentApy || 0) / 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Chart</h3>
        <div className="text-center py-8 text-gray-500">
          📊 Performance chart will be displayed here in the future.
        </div>
      </div>
    </div>
  );
}

// Utility Components
function MetricCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
