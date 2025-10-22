import React, { useState, useEffect } from 'react';

// Mock data for testing
const mockData = {
  allMarkets: [
    {
      name: 'Market 1',
      protocol: 'navi',
      symbol: 'MKT1',
      supplyApy: '5.2%',
      utilization: '45%',
      lltv: '70%',
      tvl: 1000000,
    },
    {
      name: 'Market 2',
      protocol: 'scallop',
      symbol: 'MKT2',
      supplyApy: '6.8%',
      utilization: '50%',
      lltv: '65%',
      tvl: 2000000,
    },
    {
      name: 'Market 3',
      protocol: 'navi',
      symbol: 'MKT3',
      supplyApy: '4.5%',
      utilization: '40%',
      lltv: '75%',
      tvl: 1500000,
    },
    {
      name: 'Market 4',
      protocol: 'scallop',
      symbol: 'MKT4',
      supplyApy: '7.1%',
      utilization: '60%',
      lltv: '80%',
      tvl: 2500000,
    },
    {
      name: 'Market 5',
      protocol: 'navi',
      symbol: 'MKT5',
      supplyApy: '5.9%',
      utilization: '55%',
      lltv: '68%',
      tvl: 1800000,
    },
  ],
};

// Replace the API call with mock data for testing
const data = mockData;

export default function MarketsStep({ formData, updateFormData }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('tvl'); // 'apy', 'tvl', 'utilization'
  const [filterProtocol, setFilterProtocol] = useState('all'); // 'all', 'navi', 'scallop'
  
  // 加载市场数据
  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        // const data = await getAllProtocolsMarketData({
        //   protocols: ['navi', 'scallop'],
        //   network: 'testnet'
        // });
        
        // 添加唯一ID和选中状态
        // 使用协议名、symbol和索引组合确保唯一性
        const marketsWithId = data.allMarkets.map((market, index) => ({
          ...market,
          uniqueId: `${market.protocol.toLowerCase()}-${market.symbol.toLowerCase()}-${index}`,
          selected: false
        }));
        
        setMarkets(marketsWithId);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch markets:', err);
        setError('Failed to load market data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMarkets();
  }, []);
  
  const toggleMarket = (marketId) => {
    const updatedMarkets = markets.map(market => 
      market.uniqueId === marketId ? { ...market, selected: !market.selected } : market
    );
    setMarkets(updatedMarkets);
    
    const selectedMarkets = updatedMarkets.filter(m => m.selected);
    updateFormData('selectedMarkets', selectedMarkets);
  };
  
  // 筛选和排序市场
  const getFilteredAndSortedMarkets = () => {
    let filtered = markets;
    
    // 按协议筛选
    if (filterProtocol !== 'all') {
      filtered = filtered.filter(m => m.protocol.toLowerCase() === filterProtocol);
    }
    
    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'apy':
          return parseFloat(b.supplyApy) - parseFloat(a.supplyApy);
        case 'tvl':
          return b.tvlValue - a.tvlValue;
        case 'utilization':
          return parseFloat(b.utilization) - parseFloat(a.utilization);
        default:
          return 0;
      }
    });
    
    return sorted;
  };
  
  const displayMarkets = getFilteredAndSortedMarkets();
  const selectedCount = markets.filter(m => m.selected).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Select Lending Markets</h2>
        {selectedCount > 0 && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {selectedCount} selected
          </span>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-blue-900 mb-2">Market Selection Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose markets that align with your strategy&apos;s risk profile</li>
          <li>• Diversify across different collateral types to reduce risk</li>
          <li>• Consider market liquidity and utilization rates</li>
        </ul>
      </div>
      
      {/* 筛选和排序控件 */}
      {!loading && !error && markets.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Protocol:</label>
              <select
                value={filterProtocol}
                onChange={(e) => setFilterProtocol(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Protocols</option>
                <option value="navi">Navi Only</option>
                <option value="scallop">Scallop Only</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tvl">TVL (High to Low)</option>
                <option value="apy">APY (High to Low)</option>
                <option value="utilization">Utilization (High to Low)</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {displayMarkets.length} of {markets.length} markets
          </div>
        </div>
      )}
      
      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading markets data...</span>
        </div>
      )}
      
      {/* 错误状态 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Markets</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 市场列表 */}
      {!loading && !error && markets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No markets available at the moment.
        </div>
      )}
      
      <div className="space-y-3">
        {!loading && !error && displayMarkets.map((market) => (
          <div
            key={market.uniqueId}
            onClick={() => toggleMarket(market.uniqueId)}
            className={'border rounded-lg p-4 cursor-pointer transition-colors ' + (market.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={'w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ' + (market.selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300')}>
                  {market.selected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{market.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{market.protocol}</span>
                </div>
              </div>
              
              <div className="flex space-x-8 text-sm">
                <div>
                  <div className="text-gray-500">Supply APY:</div>
                  <div className="font-semibold">{market.supplyApy}</div>
                </div>
                <div>
                  <div className="text-gray-500">Utilization:</div>
                  <div className="font-semibold">{market.utilization}</div>
                </div>
                <div>
                  <div className="text-gray-500">LLTV:</div>
                  <div className="font-semibold">{market.lltv}</div>
                </div>
                <div>
                  <div className="text-gray-500">TVL:</div>
                  <div className="font-semibold">{market.tvl}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}