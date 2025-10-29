import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';

const BrowseProjects = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    activeOaths: 0,
    graduatedProjects: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, graduated
  const [sortBy, setSortBy] = useState('volume'); // volume, holders, recent

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // TODO: 从后端 API 获取实际数据
      // const response = await fetch('http://localhost:3000/api/oath-events');
      // const data = await response.json();
      
      // 模拟数据
      setStats({
        activeOaths: 10,
        graduatedProjects: 5,
        totalVolume: 413000,
      });

      const mockProjects = [
        {
          id: 1,
          name: 'GigaChad',
          symbol: '$GIGA',
          status: 'graduated',
          volume24h: 51200,
          holders: 823,
          image: '🦍',
          creator: 'Creator1...',
          stakeAmount: 5,
          graduationDate: '2025-01-15',
        },
        {
          id: 2,
          name: 'DiamondHands',
          symbol: '$DHAND',
          status: 'graduated',
          volume24h: 45600,
          holders: 678,
          image: '💎',
          creator: 'Creator2...',
          stakeAmount: 4.5,
          graduationDate: '2025-01-18',
        },
        {
          id: 3,
          name: 'MegaDoge',
          symbol: '$MEGA',
          status: 'graduated',
          volume24h: 42100,
          holders: 712,
          image: '🐕',
          creator: 'Creator3...',
          stakeAmount: 4,
          graduationDate: '2025-01-20',
        },
        {
          id: 4,
          name: 'MoonShot',
          symbol: '$MOON',
          status: 'active',
          volume24h: 38500,
          holders: 589,
          image: '🚀',
          creator: 'Creator4...',
          stakeAmount: 3.5,
          daysRemaining: 12,
        },
        {
          id: 5,
          name: 'PepeKing',
          symbol: '$PEPE',
          status: 'active',
          volume24h: 35200,
          holders: 645,
          image: '🐸',
          creator: 'Creator5...',
          stakeAmount: 3.2,
          daysRemaining: 8,
        },
        {
          id: 6,
          name: 'ShibaRise',
          symbol: '$SHIB',
          status: 'active',
          volume24h: 32800,
          holders: 598,
          image: '🐶',
          creator: 'Creator6...',
          stakeAmount: 3,
          daysRemaining: 15,
        },
        {
          id: 7,
          name: 'CryptoWolf',
          symbol: '$WOLF',
          status: 'active',
          volume24h: 29400,
          holders: 534,
          image: '🐺',
          creator: 'Creator7...',
          stakeAmount: 2.8,
          daysRemaining: 10,
        },
        {
          id: 8,
          name: 'LunaForce',
          symbol: '$LUNA',
          status: 'active',
          volume24h: 27600,
          holders: 512,
          image: '🌙',
          creator: 'Creator8...',
          stakeAmount: 2.5,
          daysRemaining: 18,
        },
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects
    .filter(project => {
      // 状态过滤
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.name.toLowerCase().includes(query) ||
          project.symbol.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // 排序
      switch (sortBy) {
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'holders':
          return b.holders - a.holders;
        case 'recent':
          return b.id - a.id;
        default:
          return 0;
      }
    });

  const handleBuyToken = (project) => {
    // TODO: 实现购买代币功能
    console.log('Buy token:', project);
  };

  const handleViewProject = (projectId) => {
    navigate(`/oaths/${projectId}`);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume}`;
  };

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
          <h1 className="text-4xl font-bold text-white mb-4">Browse Projects</h1>
          <p className="text-gray-400 text-lg">
            Discover and invest in meme coins protected by creator oaths. All projects shown have committed stakes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#141414] border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Active Oaths</h3>
            <div className="text-4xl font-bold text-blue-400 mb-2">{stats.activeOaths}</div>
            <p className="text-gray-500 text-sm">Currently competing</p>
          </div>
          
          <div className="bg-[#141414] border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Graduated Projects</h3>
            <div className="text-4xl font-bold text-emerald-400 mb-2">{stats.graduatedProjects}</div>
            <p className="text-gray-500 text-sm">Successfully completed</p>
          </div>
          
          <div className="bg-[#141414] border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Volume</h3>
            <div className="text-4xl font-bold text-white mb-2">${(stats.totalVolume / 1000).toFixed(0)}K</div>
            <p className="text-gray-500 text-sm">24h trading volume</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or tokens..."
                className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="volume">Volume</option>
                <option value="holders">Holders</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No projects found</div>
            <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleViewProject(project.id)}
              >
                {/* Project Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{project.image}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{project.name}</h3>
                        <p className="text-gray-500 text-sm">{project.symbol}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'graduated'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {project.status === 'graduated' ? 'Graduated' : 'Active'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-gray-400 text-xs mb-1">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        24h Volume
                      </div>
                      <div className="text-white font-bold text-lg">{formatVolume(project.volume24h)}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-400 text-xs mb-1">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Holders
                      </div>
                      <div className="text-white font-bold text-lg">{project.holders}</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-[#0a0a0a] rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Creator Stake</span>
                      <span className="text-emerald-400 font-semibold">{project.stakeAmount} SOL</span>
                    </div>
                    {project.status === 'active' && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-400">Days Remaining</span>
                        <span className="text-blue-400 font-semibold">{project.daysRemaining} days</span>
                      </div>
                    )}
                    {project.status === 'graduated' && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-400">Graduated</span>
                        <span className="text-emerald-400 font-semibold">{project.graduationDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buy Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyToken(project);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Buy Token</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-12 text-center">
          <button
            onClick={fetchProjects}
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Projects
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrowseProjects;
