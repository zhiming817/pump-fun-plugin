import React from 'react';

export default function ConfigureStep({ formData, updateFormData }) {
  const selectedMarkets = Array.isArray(formData.selectedMarkets) ? formData.selectedMarkets : [];
  const totalAllocation = selectedMarkets.reduce((sum, market) => sum + (market.allocation || 0), 0);
  
  const updateMarketAllocation = (marketId, allocation) => {
    const updatedMarkets = selectedMarkets.map(market => 
      market.id === marketId ? { ...market, allocation: parseFloat(allocation) || 0 } : market
    );
    updateFormData('selectedMarkets', updatedMarkets);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Vault Configuration</h2>
      
      {/* 市场分配 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Market Allocations</h3>
        
        {selectedMarkets.map((market) => (
          <div key={market.id} className="flex items-center justify-between py-3 border-b">
            <div>
              <div className="font-medium">{market.name}</div>
              <div className="text-sm text-gray-500">{market.supplyApy} APY</div>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                placeholder="50"
                value={market.allocation || ''}
                onChange={(e) => updateMarketAllocation(market.id, e.target.value)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center mr-2"
              />
              <span>%</span>
            </div>
          </div>
        ))}
        
        <div className="mt-4 text-right">
          <span className={'text-lg font-semibold ' + (Math.abs(totalAllocation - 100) < 0.01 ? 'text-green-600' : 'text-red-600')}>
            Total Allocation: {totalAllocation.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Vault 参数 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Vault Parameters</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timelock (days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.configuration.timelock}
              onChange={(e) => updateFormData('configuration', { timelock: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="text-xs text-gray-500 mt-1">Time delay for parameter changes</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Management Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.configuration.managementFee}
              onChange={(e) => updateFormData('configuration', { managementFee: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="text-xs text-gray-500 mt-1">Annual fee on assets under management</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Performance Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={formData.configuration.performanceFee}
              onChange={(e) => updateFormData('configuration', { performanceFee: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="text-xs text-gray-500 mt-1">Fee on profits above benchmark</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Deposit (USDC)
            </label>
            <input
              type="number"
              min="1000"
              value={formData.configuration.initialDeposit}
              onChange={(e) => updateFormData('configuration', { initialDeposit: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="text-xs text-gray-500 mt-1">Your initial deposit to bootstrap the vault</div>
          </div>
        </div>
      </div>
    </div>
  );
}