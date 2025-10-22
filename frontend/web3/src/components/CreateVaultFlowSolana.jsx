import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { GUARDIAN_OPTIONS } from '../config.js';
import { createVault } from '../utils/solanaContractUtils.js';
import BasicInfoStep from './steps/BasicInfoStep.jsx';
import StrategyStep from './steps/StrategyStep.jsx';
import MarketsStep from './steps/MarketsStep.jsx';
import ConfigureStep from './steps/ConfigureStep.jsx';
import GovernanceStep from './steps/GovernanceStep.jsx';
import DeployStep from './steps/DeployStep.jsx';
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
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  
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
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      setVisible(true);
      return;
    }

    setIsCreating(true);
    try {
      // 创建钱包对象（用于 getProgram）
      const wallet = {
        publicKey,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
      };
      
      const result = await createVault(
        wallet,
        sendTransaction,
        formData,
        publicKey.toBase58()
      );
      
      alert(`Vault created successfully!\nVault ID: ${result.vaultId}\nTransaction: ${result.signature}`);
      console.log('Vault creation result:', result);
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
            {!connected && (
              <button
                onClick={() => setVisible(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Connect Wallet
              </button>
            )}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                        ${step.id <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {step.id}
                    </div>
                    <span className="mt-2 text-xs text-gray-600">{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 w-16 mx-2
                        ${step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 2 && (
            <BasicInfoStep
              data={formData.basicInfo}
              onUpdate={(data) => updateFormData('basicInfo', data)}
              onNext={nextStep}
            />
          )}
          {currentStep === 3 && (
            <StrategyStep
              data={formData.strategy}
              onUpdate={(data) => updateFormData('strategy', data)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 4 && (
            <MarketsStep
              selectedMarkets={formData.selectedMarkets}
              onUpdate={(data) => updateFormData('selectedMarkets', data)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 5 && (
            <ConfigureStep
              data={formData.configuration}
              onUpdate={(data) => updateFormData('configuration', data)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 6 && (
            <GovernanceStep
              data={formData.governance}
              onUpdate={(data) => updateFormData('governance', data)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 7 && (
            <DeployStep
              formData={formData}
              onDeploy={handleCreateVault}
              onPrev={prevStep}
              isDeploying={isCreating}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
