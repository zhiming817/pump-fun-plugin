import React from 'react';
import { GUARDIAN_OPTIONS } from '../../config.js';

export default function GovernanceStep({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Governance & Guardian Setup</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Guardian Type</h3>
        
        <div className="space-y-3">
          {GUARDIAN_OPTIONS.map((option) => (
            <div
              key={option.id}
              onClick={() => updateFormData('governance', option)}
              className={'border rounded-lg p-4 cursor-pointer transition-colors ' + (formData.governance?.id === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300')}
            >
              <div className="flex items-start">
                <div className={'w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ' + (formData.governance?.id === option.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300')}>
                  {formData.governance?.id === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{option.name}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}