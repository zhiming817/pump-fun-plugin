import React, { useState } from 'react';
import { GUARDIAN_OPTIONS } from '../config.js';
import { createVault } from '../utils/contractUtils.ts';
import { useWallet } from '@solana/wallet-adapter-react';
import BasicInfoStep from './steps/BasicInfoStep.jsx';
import StrategyStep from './steps/StrategyStep.jsx';
import MarketsStep from './steps/MarketsStep.jsx';
import ConfigureStep from './steps/ConfigureStep.jsx';
import GovernanceStep from './steps/GovernanceStep.jsx';
import DeployStep from './steps/DeployStep.jsx';
import InitializeContract from './InitializeContract.jsx';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

const STEPS = [
  { id: 1, name: 'Connect', title: 'Connect wallet', status: 'completed' },
  { id: 2, name: 'Basic Info', title: 'Name & description', status: 'current' },
  { id: 3, name: 'Strategy', title: 'Choose strategy', status: 'upcoming' },
  { id: 4, name: 'Markets', title: 'Select markets', status: 'upcoming' },
  { id: 5, name: 'Configure', title: 'Set allocations', status: 'upcoming' },
  { id: 6, name: 'Governance', title: 'Guardian setup', status: 'upcoming' },
  { id: 7, name: 'Deploy', title: 'Review & deploy', status: 'upcoming' }
];

export default function CreateVaultFlow() {
  const [currentStep, setCurrentStep] = useState(2);
  const [isCreating, setIsCreating] = useState(false);
  const wallet = useWallet();
  const { publicKey } = wallet;
  
  const [formData, setFormData] = useState({
    basicInfo: {
      name: '',
      symbol: '',
      description: ''
    },
    strategy: null,
    selectedMarkets: [],
    configuration: {
      timelock: 3,
      managementFee: 0,
      performanceFee: 0,
      initialDeposit: 0
    },
    governance: null
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: typeof value === 'object' && value !== null && !Array.isArray(value)
        ? { ...prev[key], ...value }
        : value
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateVault = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setIsCreating(true);
    try {
      // 使用当前连接的钱包地址作为 curator
      await createVault(wallet, formData, publicKey.toString());
      alert('Vault created successfully!');
    } catch (error) {
      console.error('Error creating vault:', error);
      alert('Failed to create vault: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Create AntiDump Vault
            </h1>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ' + (step.id < currentStep ? 'bg-green-500 text-white' : step.id === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600')}>
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={'flex-1 h-0.5 mx-2 ' + (step.id < currentStep ? 'bg-green-500' : 'bg-gray-200')} />
                  )}
                  <div className="ml-2 text-sm">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-gray-500 text-xs">{step.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 合约初始化组件 */}
        {publicKey && currentStep === 2 && (
          <InitializeContract />
        )}

        {/* 钱包连接状态 */}
        {!publicKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Wallet not connected</h3>
                <p className="text-sm text-yellow-600">Please connect your Solana wallet to continue creating a vault.</p>
              </div>
            </div>
          </div>
        )}

        {/* 表单内容 */}
        <div className="bg-white rounded-lg shadow p-6">
          {currentStep === 2 && <BasicInfoStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <StrategyStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <MarketsStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 5 && <ConfigureStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 6 && <GovernanceStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 7 && <DeployStep formData={formData} handleCreateVault={handleCreateVault} isCreating={isCreating} publicKey={publicKey} />}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between mt-6">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          {currentStep < STEPS.length ? (
            <button 
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={handleCreateVault}
              disabled={isCreating}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Deploy Vault'
              )}
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}