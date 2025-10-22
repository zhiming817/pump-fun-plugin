import React from 'react';
import { STRATEGY_OPTIONS } from '../../config.js';

export default function StrategyStep({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Choose Investment Strategy</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STRATEGY_OPTIONS.map((strategy) => (
          <div
            key={strategy.id}
            onClick={() => updateFormData('strategy', strategy)}
            className={'border rounded-lg p-4 cursor-pointer transition-colors ' + (formData.strategy?.id === strategy.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300')}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{strategy.name}</h3>
              <span className="text-blue-600 font-semibold">{strategy.expectedApy}</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">Expected APY</div>
            <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <span className={'px-2 py-1 rounded ' + (strategy.risk === 'Low Risk' ? 'bg-green-100 text-green-800' : strategy.risk === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}>
                {strategy.risk}
              </span>
              <span className="text-gray-500">Min: {strategy.minInvestment}</span>
            </div>
            
            <div className="mt-3 space-y-1">
              {strategy.features.map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-green-600">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}