import React, { useState } from 'react';

export default function DeployStep({ formData, handleCreateVault, isCreating, publicKey }) {
  const [accepted, setAccepted] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Review & Deploy Vault</h2>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Vault Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <span className="ml-2 font-medium">{formData.basicInfo.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Management Fee:</span>
            <span className="ml-2 font-medium">{formData.configuration.managementFee}%</span>
          </div>
          <div>
            <span className="text-gray-600">Symbol:</span>
            <span className="ml-2 font-medium">{formData.basicInfo.symbol}</span>
          </div>
          <div>
            <span className="text-gray-600">Performance Fee:</span>
            <span className="ml-2 font-medium">{formData.configuration.performanceFee}%</span>
          </div>
          <div>
            <span className="text-gray-600">Strategy:</span>
            <span className="ml-2 font-medium">{formData.strategy?.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Timelock:</span>
            <span className="ml-2 font-medium">{formData.configuration.timelock} days</span>
          </div>
          <div>
            <span className="text-gray-600">Markets:</span>
            <span className="ml-2 font-medium">{formData.selectedMarkets?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Initial Deposit:</span>
            <span className="ml-2 font-medium">${formData.configuration.initialDeposit.toLocaleString()}</span>
          </div>
        </div>

        {/* 显示已选市场详细信息 */}
        {formData.selectedMarkets && formData.selectedMarkets.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Selected Markets</h4>
            <ul className="space-y-2">
              {formData.selectedMarkets.map((market, idx) => (
                <li key={market.id || idx} className="bg-white rounded shadow p-3 text-xs flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{market.name || `${market.protocol}-${market.symbol}`}</span>
                    {market.symbol && <span className="ml-2 text-gray-500">({market.symbol})</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
                    {market.supplyApy && (
                      <span className="text-green-600">APY: {market.supplyApy}</span>
                    )}
                    {market.utilization && (
                      <span className="text-blue-600">Utilization: {market.utilization}</span>
                    )}
                    {market.lltv && (
                      <span className="text-purple-600">LLTV: {market.lltv}</span>
                    )}
                    {market.tvl && (
                      <span className="text-gray-600">TVL: {market.tvl}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* 钱包状态 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Wallet Status</h4>
        {publicKey ? (
          <div className="text-green-600">
            ✅ Connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
          </div>
        ) : (
          <div className="text-red-600">
            ❌ Wallet not connected
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input type="checkbox" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span className="text-sm">I understand and accept the terms and conditions of creating a AntiDump Vault, including the responsibilities of vault management and fee structures.</span>
        </label>
        
        <label className="flex items-start space-x-3 cursor-pointer">
          <input type="checkbox" className="mt-1" checked={riskAccepted} onChange={(e) => setRiskAccepted(e.target.checked)} />
          <span className="text-sm">I acknowledge the risks associated with DeFi lending, including but not limited to smart contract risks, market volatility, and potential loss of funds.</span>
        </label>
      </div>
    </div>
  );
}