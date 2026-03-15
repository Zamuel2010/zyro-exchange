import { useState } from 'react';
import { motion } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Users, Activity, CreditCard, BarChart2, LogOut, Search, CheckCircle, XCircle, Edit, Download, Moon, Sun, ShieldAlert
} from 'lucide-react';
import { useMockDB, Transaction, UserData } from '../context/MockDBContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ user, onLogout, darkMode, toggleDarkMode }: { user: FirebaseUser, onLogout: () => void, darkMode?: boolean, toggleDarkMode?: () => void }) {
  const [activeTab, setActiveTab] = useState('Users');
  const { users, transactions, activities, updateTransactionStatus, updateUserBalance } = useMockDB();
  const navigate = useNavigate();

  // Redirect if not admin (using the provided email)
  if (user.email !== 'samadeniji852@gmail.com') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You do not have permission to view this page.</p>
        <button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition-all">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleApprove = (id: string) => {
    updateTransactionStatus(id, 'Approved');
  };

  const handleReject = (id: string) => {
    updateTransactionStatus(id, 'Rejected');
  };

  const handleEditBalance = (id: string) => {
    const userToEdit = users.find(u => u.id === id);
    if (!userToEdit) return;
    const newBalance = prompt(`Enter new balance for ${userToEdit.email}:`, userToEdit.balance.toString());
    if (newBalance !== null && !isNaN(Number(newBalance))) {
      updateUserBalance(id, Number(newBalance));
    }
  };

  const exportCSV = () => {
    const headers = ['ID,User,Type,Amount,Status,Date'];
    const rows = transactions.map(t => `${t.id},${t.userEmail},${t.type},${t.amount},${t.status},${t.date}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const analyticsData = [
    { name: 'Mon', users: 12, txns: 4000 },
    { name: 'Tue', users: 19, txns: 3000 },
    { name: 'Wed', users: 15, txns: 2000 },
    { name: 'Thu', users: 22, txns: 2780 },
    { name: 'Fri', users: 28, txns: 1890 },
    { name: 'Sat', users: 34, txns: 2390 },
    { name: 'Sun', users: 40, txns: 3490 },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans ${darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 border-r hidden md:flex flex-col transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shadow-md shadow-red-500/20">
            <Logo className="w-full h-full" />
          </div>
          <span className="text-xl font-bold tracking-tight">Admin Panel</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {['Users', 'Transactions', 'Activity', 'Analytics'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item 
                  ? (darkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600')
                  : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
              }`}
            >
              {item === 'Users' && <Users size={20} />}
              {item === 'Transactions' && <CreditCard size={20} />}
              {item === 'Activity' && <Activity size={20} />}
              {item === 'Analytics' && <BarChart2 size={20} />}
              {item}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t transition-colors ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Logo className="w-5 h-5" />
            User Dashboard
          </button>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-1 ${darkMode ? 'text-red-500 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className={`backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-colors ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-4 md:hidden">
            <div className="w-8 h-8 rounded-lg">
              <Logo className="w-full h-full" />
            </div>
            <span className="font-bold">Admin Panel</span>
          </div>
          
          <h1 className="text-xl font-semibold hidden md:block">{activeTab} Management</h1>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className={`pl-10 pr-4 py-2 border-transparent rounded-full text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none w-64 ${darkMode ? 'bg-slate-800 text-white focus:bg-slate-900' : 'bg-slate-100 text-slate-900 focus:bg-white'}`}
              />
            </div>
            <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-9 h-9 rounded-full bg-red-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-red-600 font-bold">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Admin'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                'A'
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            
            {activeTab === 'Users' && (
              <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white/70 border-slate-200/60'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Registered Users</h3>
                  <span className="text-sm font-medium text-slate-500">Total: {users.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-800/50 border-slate-800' : 'text-slate-500 bg-slate-50/50 border-slate-100'}`}>
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-tl-xl">User ID</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Balance (USD)</th>
                        <th className="px-4 py-3 font-medium">Reg. Date</th>
                        <th className="px-4 py-3 font-medium">Last Login</th>
                        <th className="px-4 py-3 font-medium rounded-tr-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className={`border-b last:border-0 transition-colors ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                          <td className="px-4 py-4 font-mono text-xs">{u.id}</td>
                          <td className="px-4 py-4 font-medium">{u.email}</td>
                          <td className="px-4 py-4 font-mono font-bold text-emerald-500">${u.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          <td className="px-4 py-4 text-slate-500">{new Date(u.regDate).toLocaleDateString()}</td>
                          <td className="px-4 py-4 text-slate-500">{new Date(u.lastLogin).toLocaleString()}</td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => handleEditBalance(u.id)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Edit Balance">
                              <Edit size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Transactions' && (
              <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white/70 border-slate-200/60'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Transaction Tracking</h3>
                  <button onClick={exportCSV} className="flex items-center gap-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Download size={16} /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-800/50 border-slate-800' : 'text-slate-500 bg-slate-50/50 border-slate-100'}`}>
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-tl-xl">Txn ID</th>
                        <th className="px-4 py-3 font-medium">User Email</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Proof/Ref</th>
                        <th className="px-4 py-3 font-medium rounded-tr-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className={`border-b last:border-0 transition-colors ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                          <td className="px-4 py-4 font-mono text-xs">{t.id}</td>
                          <td className="px-4 py-4">{t.userEmail}</td>
                          <td className="px-4 py-4 font-medium">
                            <span className={t.type === 'Deposit' ? 'text-emerald-500' : 'text-red-500'}>{t.type}</span>
                          </td>
                          <td className="px-4 py-4 font-mono font-bold">${t.amount.toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              t.status === 'Approved' ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') :
                              t.status === 'Rejected' ? (darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700') :
                              (darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700')
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-mono text-slate-500">{t.reference || 'N/A'}</td>
                          <td className="px-4 py-4 text-right">
                            {t.status === 'Pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleApprove(t.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors dark:hover:bg-emerald-500/10" title="Approve">
                                  <CheckCircle size={18} />
                                </button>
                                <button onClick={() => handleReject(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-500/10" title="Reject">
                                  <XCircle size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Activity' && (
              <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white/70 border-slate-200/60'}`}>
                <h3 className="font-semibold text-lg mb-6">Activity Log</h3>
                <div className="space-y-4">
                  {activities.map((act) => (
                    <div key={act.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Activity size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{act.userEmail}</p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{act.action}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(act.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white/70 border-slate-200/60'}`}>
                    <p className="text-sm text-slate-500 mb-1">Total Users</p>
                    <h3 className="text-3xl font-bold">{users.length}</h3>
                  </div>
                  <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white/70 border-slate-200/60'}`}>
                    <p className="text-sm text-slate-500 mb-1">Total Funds Managed</p>
                    <h3 className="text-3xl font-bold text-emerald-500">${users.reduce((acc, u) => acc + u.balance, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                  </div>
                  <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white/70 border-slate-200/60'}`}>
                    <p className="text-sm text-slate-500 mb-1">Pending Transactions</p>
                    <h3 className="text-3xl font-bold text-amber-500">{transactions.filter(t => t.status === 'Pending').length}</h3>
                  </div>
                </div>

                <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white/70 border-slate-200/60'}`}>
                  <h3 className="font-semibold text-lg mb-6">User Growth & Activity</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#f8fafc' : '#0f172a' }} />
                        <Bar yAxisId="left" dataKey="users" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="txns" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </main>
    </div>
  );
}
