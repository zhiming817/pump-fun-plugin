import React from 'react';

export default function BasicInfoStep({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Basic Vault Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vault Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Stable Yield Strategy"
            value={formData.basicInfo.name}
            onChange={(e) => updateFormData('basicInfo', { name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symbol *
          </label>
          <input
            type="text"
            placeholder="e.g., SYS-VAULT"
            value={formData.basicInfo.symbol}
            onChange={(e) => updateFormData('basicInfo', { symbol: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            placeholder="Describe your vault's investment strategy, target returns, and risk profile..."
            value={formData.basicInfo.description}
            onChange={(e) => updateFormData('basicInfo', { description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}