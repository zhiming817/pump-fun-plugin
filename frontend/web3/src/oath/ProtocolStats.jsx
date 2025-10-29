import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import Navbar from '../layout/Navbar';

const ProtocolStats = () => {
  const { connection } = useConnection();
  const [stats, setStats] = useState({
    totalOaths: 0,
    totalStaked: 0,
    protectedUsers: 0,
    protocolFees: 0,
    successfulOaths: 0,
    failedOaths: 0,
    successRate: 0,
    totalCompensation: 0,
    averageROI: 0,
  });
  const [topCompensatedProjects, setTopCompensatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // TODO: 从后端 API 获取实际数据
      // const response = await fetch('http://localhost:3000/api/oath-events');
      // const data = await response.json();
      
      // 模拟数据
      setStats({
        totalOaths: 127,
        totalStaked: 856,
        protectedUsers: 12453,
        protocolFees: 234.5,
        successfulOaths: 89,
        failedOaths: 38,
        successRate: 70.1,
        totalCompensation: 156.8,
        averageROI: 3.2,
      });

      // 模拟顶级补偿项目数据
      setTopCompensatedProjects([
        {
          id: 1,
          name: 'TrustToken',
          symbol: '$TRUST',
          compensationAmount: 8,
          holdersCount: 156,
        },
        {
          id: 2,
          name: 'MemeLord',
          symbol: '$MLORD',
          compensationAmount: 7,
          holdersCount: 123,
        },
        {
          id: 3,
          name: 'PumpIt',
          symbol: '$PUMP',
          compensationAmount: 6.5,
          holdersCount: 112,
        },
        {
          id: 4,
          name: 'LunaRise',
          symbol: '$LRISE',
          compensationAmount: 5,
          holdersCount: 89,
        },
        {
          id: 5,
          name: 'RugPull',
          symbol: '$RUG',
          compensationAmount: 4,
          holdersCount: 67,
        },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, gradient }) => (
    <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${gradient}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );

  const SuccessRateCard = () => (
    <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300">
      <h3 className="text-gray-300 text-lg font-semibold mb-2">Success Rate</h3>
      <p className="text-gray-500 text-sm mb-6">Percentage of oaths that graduated successfully</p>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Overall Success Rate</span>
          <span className="text-lg font-bold text-emerald-400">{stats.successRate}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.successRate}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-gray-400 text-sm">Successful</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.successfulOaths}</div>
          <div className="text-xs text-emerald-500 mt-1">→ Graduated projects</div>
        </div>
        
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-400 text-sm">Failed</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.failedOaths}</div>
          <div className="text-xs text-red-500 mt-1">→ Did not graduate</div>
        </div>
      </div>
    </div>
  );

  const UserProtectionCard = () => (
    <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300">
      <h3 className="text-gray-300 text-lg font-semibold mb-2">User Protection Impact</h3>
      <p className="text-gray-500 text-sm mb-6">How the protocol protects and rewards investors</p>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Total Compensation Distributed</span>
            <span className="text-lg font-bold text-emerald-400">{stats.totalCompensation} SOL</span>
          </div>
          <p className="text-xs text-gray-600">Failed project stakes redistributed to top holders and successful projects</p>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Average ROI for Protected Users</span>
            <span className="text-lg font-bold text-emerald-400">{stats.averageROI}x</span>
          </div>
          <p className="text-xs text-gray-600">Returns for users who invested in graduated projects</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-semibold text-emerald-400">Community Growth</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.protectedUsers.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Users who benefited from structural safety</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Protocol Statistics</h1>
          <p className="text-gray-400 text-lg">
            Track the impact of AntiDump's commitment protocol on the meme coin ecosystem.
          </p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Oaths"
            value={stats.totalOaths}
            subtitle="All-time commitments"
            gradient="bg-gradient-to-r from-emerald-500/20 to-green-600/20"
            icon={
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          
          <StatCard
            title="Total Staked"
            value={`${stats.totalStaked} SOL`}
            subtitle="Locked in oaths"
            gradient="bg-gradient-to-r from-blue-500/20 to-purple-600/20"
            icon={
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
          
          <StatCard
            title="Protected Users"
            value={stats.protectedUsers.toLocaleString()}
            subtitle="Investors safeguarded"
            gradient="bg-gradient-to-r from-purple-500/20 to-pink-600/20"
            icon={
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
          
          <StatCard
            title="Protocol Fees"
            value={`${stats.protocolFees} SOL`}
            subtitle="Revenue generated"
            gradient="bg-gradient-to-r from-orange-500/20 to-yellow-600/20"
            icon={
              <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Bottom Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SuccessRateCard />
          <UserProtectionCard />
        </div>

        {/* Top Compensated Projects */}
        <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Top Compensated Projects</h3>
            <p className="text-gray-500 text-sm">
              Failed projects whose stakes were redistributed to their top holders and successful projects
            </p>
          </div>

          <div className="space-y-3">
            {topCompensatedProjects.map((project, index) => (
              <div
                key={project.id}
                className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 hover:border-emerald-500/30 transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full text-gray-400 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{project.name}</h4>
                    <p className="text-gray-500 text-sm">{project.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-400">{project.compensationAmount} SOL</div>
                  <p className="text-gray-500 text-xs">
                    Redistributed to top {project.holdersCount} holders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capital Protection Mechanism */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold text-lg mb-2">Capital Protection Mechanism</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                When projects fail to graduate, their staked SOL is distributed to: (1) Top holders of the failed project as compensation, 
                (2) Successful projects in the same group as rewards, (3) Protocol fees for sustainability. 
                This ensures that even in failure, the community is protected and rewarded.
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchStats}
            className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtocolStats;
