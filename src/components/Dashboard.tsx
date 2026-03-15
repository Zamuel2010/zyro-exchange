import { useState } from 'react';
import { motion } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Bell, Search, Menu, LogOut, Wallet, ArrowUpRight, ArrowDownRight, 
  Activity, Settings, CreditCard, Bitcoin, DollarSign, LineChart
} from 'lucide-react';
import Logo from './Logo';

const mockChartData = [
  { time: '00:00', price: 42000 },
  { time: '04:00', price: 42500 },
  { time: '08:00', price: 41800 },
  { time: '12:00', price: 43200 },
  { time: '16:00', price: 44100 },
  { time: '20:00', price: 43800 },
  { time: '24:00', price: 45000 },
];

const assets = [
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.45', value: '$20,250.00', change: '+2.4%', isPositive: true, icon: Bitcoin, color: 'text-orange-500', bg: 'bg-orange-100' },
  { symbol: 'ETH', name: 'Ethereum', balance: '4.2', value: '$9,450.00', change: '+1.8%', isPositive: true, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100' },
  { symbol: 'USDT', name: 'Tether', balance: '5,000', value: '$5,000.00', change: '0.0%', isPositive: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100' },
];

const recentTransactions = [
  { id: 1, type: 'Buy', asset: 'BTC', amount: '0.05', date: 'Today, 14:30', status: 'Completed' },
  { id: 2, type: 'Deposit', asset: 'USD', amount: '$2,000', date: 'Yesterday, 09:15', status: 'Completed' },
  { id: 3, type: 'Sell', asset: 'ETH', amount: '1.5', date: 'Mar 12, 16:45', status: 'Completed' },
];

export default function Dashboard({ user, onLogout }: { user: FirebaseUser, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shadow-md shadow-red-500/20">
            <Logo className="w-full h-full" />
          </div>
          <span className="text-xl font-bold tracking-tight">Zyro Exchange</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {['Overview', 'Markets', 'Wallet', 'Trade', 'History'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item === 'Overview' && <Activity size={20} />}
              {item === 'Markets' && <LineChart size={20} />}
              {item === 'Wallet' && <Wallet size={20} />}
              {item === 'Trade' && <ArrowUpRight size={20} />}
              {item === 'History' && <CreditCard size={20} />}
              {item}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Settings size={20} />
            Settings
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-1"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 md:hidden">
            <div className="w-8 h-8 rounded-lg">
              <Logo className="w-full h-full" />
            </div>
            <span className="font-bold">Zyro Exchange</span>
          </div>
          
          <h1 className="text-xl font-semibold hidden md:block">{activeTab}</h1>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none w-64"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-red-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-red-600 font-bold">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (user.displayName || user.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <button className="md:hidden p-2 text-slate-500">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Balance Card - Glass Effect */}
              <div className="md:col-span-2 bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Total Portfolio Value</p>
                    <h2 className="text-4xl font-bold tracking-tight">$34,700.00</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <ArrowUpRight size={16} className="mr-1" />
                        +5.2%
                      </span>
                      <span className="text-sm text-slate-500">vs last week</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-red-600/20">
                      Deposit
                    </button>
                    <button className="flex-1 md:flex-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm">
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Action Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="font-semibold mb-4 text-slate-200 relative z-10">Quick Buy</h3>
                <div className="space-y-4 relative z-10">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-slate-400">Pay</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">1,000</span>
                      <span className="text-slate-400 text-sm">USD</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-slate-400">Receive</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">0.022</span>
                      <span className="text-slate-400 text-sm">BTC</span>
                    </div>
                  </div>
                  <button className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-medium transition-all">
                    Buy BTC
                  </button>
                </div>
              </div>
            </div>

            {/* Chart and Assets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">Market Overview</h3>
                    <p className="text-sm text-slate-500">BTC/USD</p>
                  </div>
                  <div className="flex gap-2">
                    {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                      <button 
                        key={tf}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          tf === '1D' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        domain={['dataMin - 1000', 'dataMax + 1000']} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Assets List */}
              <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Your Assets</h3>
                  <button className="text-sm text-red-600 font-medium hover:text-red-700">View All</button>
                </div>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${asset.bg} ${asset.color} flex items-center justify-center`}>
                          <asset.icon size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">{asset.symbol}</p>
                          <p className="text-xs text-slate-500">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{asset.value}</p>
                        <p className={`text-xs font-medium ${asset.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {asset.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6">
              <h3 className="font-semibold text-lg mb-6">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-tl-xl">Type</th>
                      <th className="px-4 py-3 font-medium">Asset</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium rounded-tr-xl text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 font-medium">
                          <span className={`inline-flex items-center gap-1.5 ${
                            tx.type === 'Buy' ? 'text-emerald-600' : 
                            tx.type === 'Sell' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {tx.type === 'Buy' ? <ArrowDownRight size={16} /> : 
                             tx.type === 'Sell' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium">{tx.asset}</td>
                        <td className="px-4 py-4">{tx.amount}</td>
                        <td className="px-4 py-4 text-slate-500">{tx.date}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
