import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Bell, Search, Menu, LogOut, Wallet, ArrowUpRight, ArrowDownRight, 
  Activity, Settings, CreditCard, Bitcoin, DollarSign, LineChart, Moon, Sun, MessageSquare, X, CheckCircle, Copy, Bot, Zap, TrendingUp, List, Upload, ArrowDownUp, ChevronDown, AlertCircle
} from 'lucide-react';
import Logo from './Logo';
import { useDB } from '../context/DBContext';

const mockChartData = [
  { time: '00:00', price: 42000 },
  { time: '04:00', price: 42500 },
  { time: '08:00', price: 41800 },
  { time: '12:00', price: 43200 },
  { time: '16:00', price: 44100 },
  { time: '20:00', price: 43800 },
  { time: '24:00', price: 45000 },
];

const recentTransactions = [
  { id: 1, type: 'Buy', asset: 'BTC', amount: '0.05', date: 'Today, 14:30', status: 'Completed' },
  { id: 2, type: 'Deposit', asset: 'NGN', amount: '₦2,000,000', date: 'Yesterday, 09:15', status: 'Completed' },
  { id: 3, type: 'Sell', asset: 'ETH', amount: '1.5', date: 'Mar 12, 16:45', status: 'Completed' },
];

export default function Dashboard({ user, onLogout, darkMode, toggleDarkMode }: { user: FirebaseUser, onLogout: () => void, darkMode?: boolean, toggleDarkMode?: () => void }) {
  const { users, transactions, registerUser, updateUserLogin, addTransaction } = useDB();
  const [activeTab, setActiveTab] = useState('Overview');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Deposit State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositBankName, setDepositBankName] = useState('');
  const [depositReference, setDepositReference] = useState('');
  const [depositProofLink, setDepositProofLink] = useState('');
  
  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBankName, setWithdrawBankName] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const [showBotConfig, setShowBotConfig] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [botActive, setBotActive] = useState(false);
  const [livePrices, setLivePrices] = useState({ 
    BTC: 42500000.00, 
    ETH: 2800000.00, 
    USDT: 1500.00,
    SOL: 250000.00,
    ADA: 800.00,
    DOGE: 250.00,
    XRP: 900.00,
    DOT: 12000.00,
    MATIC: 1500.00,
    SHIB: 0.04
  });
  const [orderBook, setOrderBook] = useState<{price: number, amount: number, type: 'buy'|'sell'}[]>([]);
  const [copied, setCopied] = useState(false);

  // Swap State
  const [swapFromAsset, setSwapFromAsset] = useState('NGN');
  const [swapToAsset, setSwapToAsset] = useState('BTC');
  const [swapFromAmount, setSwapFromAmount] = useState('');
  const [swapToAmount, setSwapToAmount] = useState('');
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSwapSuccessModal, setShowSwapSuccessModal] = useState(false);
  const [jupiterConnected, setJupiterConnected] = useState(false);
  const [isConnectingJupiter, setIsConnectingJupiter] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null);

  const supportedAssets = [
    { symbol: 'NGN', name: 'Naira', icon: '₦' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'USDT', name: 'Tether', icon: '₮' },
    { symbol: 'SOL', name: 'Solana', icon: '◎' },
    { symbol: 'ADA', name: 'Cardano', icon: '₳' },
    { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
    { symbol: 'XRP', name: 'Ripple', icon: '✕' },
    { symbol: 'DOT', name: 'Polkadot', icon: '●' },
    { symbol: 'MATIC', name: 'Polygon', icon: '⬡' },
    { symbol: 'SHIB', name: 'Shiba Inu', icon: '🐕' }
  ];

  const getAssetPriceInNgn = (asset: string) => {
    if (asset === 'NGN') return 1;
    return livePrices[asset as keyof typeof livePrices] || 0;
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,cardano,dogecoin,ripple,polkadot,matic-network,shiba-inu&vs_currencies=ngn');
        const data = await response.json();
        if (data.bitcoin && data.ethereum && data.tether) {
          setLivePrices({
            BTC: data.bitcoin?.ngn || 42500000,
            ETH: data.ethereum?.ngn || 2800000,
            USDT: data.tether?.ngn || 1500,
            SOL: data.solana?.ngn || 250000,
            ADA: data.cardano?.ngn || 800,
            DOGE: data.dogecoin?.ngn || 250,
            XRP: data.ripple?.ngn || 900,
            DOT: data.polkadot?.ngn || 12000,
            MATIC: data['matic-network']?.ngn || 1500,
            SHIB: data['shiba-inu']?.ngn || 0.04
          });
        }
      } catch (error) {
        console.error('Error fetching prices from CoinGecko:', error);
      }
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!swapFromAmount || isNaN(Number(swapFromAmount))) {
      setSwapToAmount('');
      return;
    }
    const fromPrice = getAssetPriceInNgn(swapFromAsset);
    const toPrice = getAssetPriceInNgn(swapToAsset);
    if (fromPrice && toPrice) {
      const amountInNgn = Number(swapFromAmount) * fromPrice;
      const finalAmount = amountInNgn / toPrice;
      // Format to appropriate decimals
      if (swapToAsset === 'NGN') {
        setSwapToAmount(finalAmount.toFixed(2));
      } else {
        setSwapToAmount(finalAmount.toFixed(6));
      }
    }
  }, [swapFromAmount, swapFromAsset, swapToAsset, livePrices]);

  useEffect(() => {
    if (user) {
      registerUser(user.uid, user.email || 'unknown@example.com');
      updateUserLogin(user.uid);
    }
  }, [user]);

  const [depositError, setDepositError] = useState('');

  const currentUserData = users.find(u => u.id === user.uid) || { balance: 0, balances: { BTC: 0, ETH: 0, USDT: 0 } };
  const userTransactions = transactions.filter(t => t.userId === user.uid);

  const totalPortfolioValue = currentUserData.balance + 
    ((currentUserData.balances?.BTC || 0) * (livePrices.BTC || 0)) +
    ((currentUserData.balances?.ETH || 0) * (livePrices.ETH || 0)) +
    ((currentUserData.balances?.USDT || 0) * (livePrices.USDT || 0)) +
    ((currentUserData.balances?.SOL || 0) * (livePrices.SOL || 0)) +
    ((currentUserData.balances?.ADA || 0) * (livePrices.ADA || 0)) +
    ((currentUserData.balances?.DOGE || 0) * (livePrices.DOGE || 0)) +
    ((currentUserData.balances?.XRP || 0) * (livePrices.XRP || 0)) +
    ((currentUserData.balances?.DOT || 0) * (livePrices.DOT || 0)) +
    ((currentUserData.balances?.MATIC || 0) * (livePrices.MATIC || 0)) +
    ((currentUserData.balances?.SHIB || 0) * (livePrices.SHIB || 0));

  const assets = [
    { symbol: 'NGN', name: 'Naira', balance: currentUserData.balance.toLocaleString(), value: `₦${currentUserData.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '0.0%', isPositive: true, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { symbol: 'BTC', name: 'Bitcoin', balance: (currentUserData.balances?.BTC || 0).toLocaleString(undefined, {maximumFractionDigits: 6}), value: `₦${((currentUserData.balances?.BTC || 0) * (livePrices.BTC || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+2.4%', isPositive: true, icon: Bitcoin, color: 'text-orange-500', bg: 'bg-orange-100' },
    { symbol: 'ETH', name: 'Ethereum', balance: (currentUserData.balances?.ETH || 0).toLocaleString(undefined, {maximumFractionDigits: 6}), value: `₦${((currentUserData.balances?.ETH || 0) * (livePrices.ETH || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+1.8%', isPositive: true, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100' },
    { symbol: 'USDT', name: 'Tether', balance: (currentUserData.balances?.USDT || 0).toLocaleString(undefined, {maximumFractionDigits: 2}), value: `₦${((currentUserData.balances?.USDT || 0) * (livePrices.USDT || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '0.0%', isPositive: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { symbol: 'SOL', name: 'Solana', balance: (currentUserData.balances?.SOL || 0).toLocaleString(undefined, {maximumFractionDigits: 4}), value: `₦${((currentUserData.balances?.SOL || 0) * (livePrices.SOL || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+5.2%', isPositive: true, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-100' },
    { symbol: 'ADA', name: 'Cardano', balance: (currentUserData.balances?.ADA || 0).toLocaleString(undefined, {maximumFractionDigits: 2}), value: `₦${((currentUserData.balances?.ADA || 0) * (livePrices.ADA || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '-1.2%', isPositive: false, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-50' },
    { symbol: 'DOGE', name: 'Dogecoin', balance: (currentUserData.balances?.DOGE || 0).toLocaleString(undefined, {maximumFractionDigits: 0}), value: `₦${((currentUserData.balances?.DOGE || 0) * (livePrices.DOGE || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+12.4%', isPositive: true, icon: Bot, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { symbol: 'XRP', name: 'Ripple', balance: (currentUserData.balances?.XRP || 0).toLocaleString(undefined, {maximumFractionDigits: 2}), value: `₦${((currentUserData.balances?.XRP || 0) * (livePrices.XRP || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+0.5%', isPositive: true, icon: Activity, color: 'text-zinc-500', bg: 'bg-zinc-100' },
    { symbol: 'DOT', name: 'Polkadot', balance: (currentUserData.balances?.DOT || 0).toLocaleString(undefined, {maximumFractionDigits: 4}), value: `₦${((currentUserData.balances?.DOT || 0) * (livePrices.DOT || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '-0.8%', isPositive: false, icon: Activity, color: 'text-pink-500', bg: 'bg-pink-100' },
    { symbol: 'MATIC', name: 'Polygon', balance: (currentUserData.balances?.MATIC || 0).toLocaleString(undefined, {maximumFractionDigits: 2}), value: `₦${((currentUserData.balances?.MATIC || 0) * (livePrices.MATIC || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+3.1%', isPositive: true, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { symbol: 'SHIB', name: 'Shiba Inu', balance: (currentUserData.balances?.SHIB || 0).toLocaleString(undefined, {maximumFractionDigits: 0}), value: `₦${((currentUserData.balances?.SHIB || 0) * (livePrices.SHIB || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+8.9%', isPositive: true, icon: Bot, color: 'text-red-500', bg: 'bg-red-100' },
  ];

  const handleSwapSubmit = async () => {
    setSwapError('');
    setSwapSuccess('');
    
    if (!swapFromAmount || isNaN(Number(swapFromAmount)) || Number(swapFromAmount) <= 0) {
      setSwapError('Please enter a valid amount to swap');
      return;
    }
    
    if (swapFromAsset === swapToAsset) {
      setSwapError('Cannot swap the same asset');
      return;
    }

    const currentBalances = currentUserData.balances || { BTC: 0, ETH: 0, USDT: 0 };
    const availableBalance = swapFromAsset === 'NGN' ? currentUserData.balance : (currentBalances[swapFromAsset] || 0);

    if (Number(swapFromAmount) > availableBalance) {
      if (swapFromAsset === 'NGN') {
        setSwapError('INSUFFICIENT_NGN');
      } else {
        setSwapError(`Insufficient ${swapFromAsset} balance`);
      }
      return;
    }

    setIsSwapping(true);
    try {
      // @ts-ignore
      await useDB().swapAssets(user.uid, user.email || 'unknown@example.com', swapFromAsset, swapToAsset, Number(swapFromAmount), Number(swapToAmount));
      setSwapSuccess(`Successfully swapped ${swapFromAmount} ${swapFromAsset} to ${swapToAmount} ${swapToAsset}`);
      setShowSwapSuccessModal(true);
      setSwapFromAmount('');
      setSwapToAmount('');
    } catch (err: any) {
      setSwapError(err.message || 'Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleDepositSubmit = () => {
    setDepositError('');
    if (!depositAmount || isNaN(Number(depositAmount))) {
      setDepositError('Please enter a valid amount');
      return;
    }
    addTransaction({
      userId: user.uid,
      userEmail: user.email || 'unknown@example.com',
      type: 'Deposit',
      amount: Number(depositAmount),
      bankName: depositBankName,
      reference: depositReference,
      proofLink: depositProofLink
    });
    setPaymentDone(true);
  };

  const handleWithdrawSubmit = () => {
    setWithdrawError('');
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      setWithdrawError('Please enter a valid amount');
      return;
    }
    if (Number(withdrawAmount) > currentUserData.balance) {
      setWithdrawError('Insufficient balance');
      return;
    }
    if (!withdrawBankName || !withdrawAccountName || !withdrawAccountNumber) {
      setWithdrawError('Please fill in all bank details');
      return;
    }
    addTransaction({
      userId: user.uid,
      userEmail: user.email || 'unknown@example.com',
      type: 'Withdraw',
      amount: Number(withdrawAmount),
      bankName: withdrawBankName,
      accountName: withdrawAccountName,
      accountNumber: withdrawAccountNumber
    });
    setShowWithdraw(false);
    setWithdrawAmount('');
    setWithdrawBankName('');
    setWithdrawAccountName('');
    setWithdrawAccountNumber('');
  };

  const handleConnectJupiter = () => {
    setIsConnectingJupiter(true);
    setTimeout(() => {
      setJupiterConnected(true);
      setIsConnectingJupiter(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("9136806231");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const generateOrders = () => Array.from({length: 8}).map(() => ({
      price: 42500 + (Math.random() * 100 - 50),
      amount: Number((Math.random() * 2).toFixed(4)),
      type: Math.random() > 0.5 ? 'buy' : 'sell' as 'buy'|'sell'
    })).sort((a, b) => b.price - a.price);
    
    setOrderBook(generateOrders());

    const interval = setInterval(() => {
      setOrderBook(generateOrders());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans ${darkMode ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 border-r hidden md:flex flex-col transition-colors ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shadow-md shadow-brand-500/20">
            <Logo className="w-full h-full" />
          </div>
          <span className="text-xl font-bold tracking-tight">Zyro Exchange</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {['Overview', 'Markets', 'Wallet', 'Swap', 'History'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item 
                  ? (darkMode ? 'bg-brand-500/10 text-brand-500' : 'bg-brand-50 text-brand-600')
                  : (darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900')
              }`}
            >
              {item === 'Overview' && <Activity size={20} />}
              {item === 'Markets' && <LineChart size={20} />}
              {item === 'Wallet' && <Wallet size={20} />}
              {item === 'Swap' && <ArrowUpRight size={20} />}
              {item === 'History' && <CreditCard size={20} />}
              {item}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t transition-colors ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button onClick={() => { window.location.href = '/admin'; }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <Settings size={20} />
            Admin Panel
          </button>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-1 ${darkMode ? 'text-brand-500 hover:bg-brand-500/10' : 'text-brand-600 hover:bg-brand-50'}`}
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className={`backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-colors ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
          <div className="flex items-center gap-4 md:hidden">
            <div className="w-8 h-8 rounded-lg">
              <Logo className="w-full h-full" />
            </div>
            <span className="font-bold">Zyro Exchange</span>
          </div>
          
          <h1 className="text-xl font-semibold hidden md:block">{activeTab}</h1>

          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>BTC/USDT</span>
              <span className={`font-mono font-bold ${livePrices.BTC > 42500 ? 'text-emerald-500' : 'text-red-500'}`}>₦{livePrices.BTC.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>ETH/USDT</span>
              <span className={`font-mono font-bold ${livePrices.ETH > 2800 ? 'text-emerald-500' : 'text-red-500'}`}>₦{livePrices.ETH.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} size={18} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className={`pl-10 pr-4 py-2 border-transparent rounded-full text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none w-64 ${darkMode ? 'bg-zinc-800 text-white focus:bg-zinc-900' : 'bg-zinc-100 text-zinc-900 focus:bg-white'}`}
              />
            </div>
            <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`relative p-2 transition-colors rounded-full ${darkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}>
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={() => setShowProfile(true)} className="w-9 h-9 rounded-full bg-brand-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-brand-600 font-bold cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (user.displayName || user.email || 'U').charAt(0).toUpperCase()
              )}
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-zinc-500">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex justify-end md:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`relative w-64 h-full p-6 flex flex-col shadow-2xl ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold">Menu</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <X size={20} />
                  </button>
                </div>
                
                <nav className="flex-1 space-y-2">
                  {['Overview', 'Markets', 'Wallet', 'Swap', 'History'].map((item) => (
                    <button
                      key={item}
                      onClick={() => { setActiveTab(item); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === item 
                          ? (darkMode ? 'bg-brand-500/10 text-brand-500' : 'bg-brand-50 text-brand-600') 
                          : (darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900')
                      }`}
                    >
                      {item === 'Overview' && <Activity size={20} />}
                      {item === 'Markets' && <LineChart size={20} />}
                      {item === 'Wallet' && <Wallet size={20} />}
                      {item === 'Swap' && <ArrowUpRight size={20} />}
                      {item === 'History' && <CreditCard size={20} />}
                      {item}
                    </button>
                  ))}
                  <div className="my-4 border-t border-zinc-200 dark:border-zinc-800"></div>
                  <button onClick={() => { window.location.href = '/admin'; }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                    <Settings size={20} />
                    Admin Panel
                  </button>
                  <button onClick={() => { setShowDeposit(true); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                    <ArrowDownRight size={20} />
                    Deposit
                  </button>
                  <button onClick={() => { setShowWithdraw(true); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                    <ArrowUpRight size={20} />
                    Withdraw
                  </button>
                </nav>
                
                <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button 
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${darkMode ? 'text-brand-500 hover:bg-brand-500/10' : 'text-brand-600 hover:bg-brand-50'}`}
                  >
                    <LogOut size={20} />
                    Log Out
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'Swap' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto mt-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-purple-500 bg-clip-text text-transparent">Swap Assets</h2>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Instantly trade any crypto at the best rates.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleConnectJupiter}
                    disabled={jupiterConnected || isConnectingJupiter}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                      jupiterConnected 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-none' 
                        : isConnectingJupiter
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                        : 'bg-gradient-to-r from-green-400 to-emerald-500 text-zinc-950 hover:shadow-emerald-500/25 hover:scale-105'
                    }`}
                  >
                    {jupiterConnected ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Jup: 4x9...a1Z
                      </>
                    ) : isConnectingJupiter ? (
                      'Connecting...'
                    ) : (
                      <>
                        <Wallet size={16} />
                        Connect Jupiter
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className={`p-1 rounded-[2rem] bg-gradient-to-b ${darkMode ? 'from-zinc-800 to-zinc-900 shadow-2xl shadow-brand-500/10' : 'from-zinc-200 to-white shadow-xl shadow-zinc-200/50'}`}>
                <div className={`p-6 rounded-[1.85rem] ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
                  {swapError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        {swapError === 'INSUFFICIENT_NGN' ? 'Insufficient NGN balance to complete this swap.' : swapError}
                      </div>
                      {swapError === 'INSUFFICIENT_NGN' && (
                        <div className={`mt-2 p-3 rounded-lg border ${darkMode ? 'bg-zinc-900/50 border-red-500/20' : 'bg-white border-red-200'}`}>
                          <p className="mb-2 text-zinc-500 dark:text-zinc-400">Please deposit funds to the account below, then try swapping again:</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-white">Zyro Bank</p>
                              <p className="font-mono text-lg text-zinc-900 dark:text-white">9136806231</p>
                            </div>
                            <button 
                              onClick={handleCopy}
                              className="p-2 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-colors"
                            >
                              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                            </button>
                          </div>
                          <button 
                            onClick={() => {
                              setShowDeposit(true);
                              setSwapError('');
                            }}
                            className="w-full mt-3 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                          >
                            I have made the deposit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* From Asset */}
                  <div className={`p-5 rounded-3xl border transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 focus-within:border-brand-500/50 focus-within:bg-zinc-800/50' : 'bg-zinc-50 border-zinc-200 focus-within:border-brand-500/50 focus-within:bg-white'}`}>
                    <div className="flex justify-between mb-3">
                      <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>You Pay</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Balance: {swapFromAsset === 'NGN' ? `₦${currentUserData.balance.toLocaleString()}` : `${(currentUserData.balances?.[swapFromAsset] || 0).toLocaleString()} ${swapFromAsset}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        value={swapFromAmount}
                        onChange={(e) => setSwapFromAmount(e.target.value)}
                        placeholder="0.00"
                        className={`flex-1 bg-transparent text-4xl font-bold outline-none w-full ${darkMode ? 'text-white placeholder-zinc-700' : 'text-zinc-900 placeholder-zinc-300'}`}
                      />
                      <button 
                        onClick={() => setShowTokenSelector('from')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200'}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center text-xs">
                          {supportedAssets.find(a => a.symbol === swapFromAsset)?.icon}
                        </span>
                        {swapFromAsset}
                        <ChevronDown size={16} className={darkMode ? 'text-zinc-400' : 'text-zinc-500'} />
                      </button>
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <div className="flex justify-center -my-4 relative z-10">
                    <button 
                      onClick={() => {
                        const tempAsset = swapFromAsset;
                        setSwapFromAsset(swapToAsset);
                        setSwapToAsset(tempAsset);
                        setSwapFromAmount(swapToAmount);
                      }}
                      className={`p-3 rounded-2xl border-4 transition-all hover:rotate-180 hover:scale-110 ${darkMode ? 'bg-zinc-800 border-zinc-950 text-brand-400' : 'bg-white border-white text-brand-600 shadow-sm'}`}
                    >
                      <ArrowDownUp size={20} />
                    </button>
                  </div>

                  {/* To Asset */}
                  <div className={`p-5 rounded-3xl border transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="flex justify-between mb-3">
                      <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>You Receive</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Balance: {swapToAsset === 'NGN' ? `₦${currentUserData.balance.toLocaleString()}` : `${(currentUserData.balances?.[swapToAsset] || 0).toLocaleString()} ${swapToAsset}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="text" 
                        value={swapToAmount}
                        readOnly
                        placeholder="0.00"
                        className={`flex-1 bg-transparent text-4xl font-bold outline-none w-full ${darkMode ? 'text-white placeholder-zinc-700' : 'text-zinc-900 placeholder-zinc-300'}`}
                      />
                      <button 
                        onClick={() => setShowTokenSelector('to')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200'}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center text-xs">
                          {supportedAssets.find(a => a.symbol === swapToAsset)?.icon}
                        </span>
                        {swapToAsset}
                        <ChevronDown size={16} className={darkMode ? 'text-zinc-400' : 'text-zinc-500'} />
                      </button>
                    </div>
                  </div>

                  {/* Exchange Rate Info */}
                  <div className={`mt-6 p-4 rounded-2xl flex justify-between items-center text-sm border ${darkMode ? 'bg-zinc-900/50 border-zinc-800/50 text-zinc-400' : 'bg-zinc-50 border-zinc-100 text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <Activity size={14} className="text-brand-500" />
                      Exchange Rate
                    </span>
                    <span className="font-bold">
                      1 {swapFromAsset} = {getAssetPriceInNgn(swapFromAsset) && getAssetPriceInNgn(swapToAsset) ? (getAssetPriceInNgn(swapFromAsset) / getAssetPriceInNgn(swapToAsset)).toFixed(6) : '0.00'} {swapToAsset}
                    </span>
                  </div>

                  {/* Swap Button */}
                  <button 
                    onClick={handleSwapSubmit}
                    disabled={isSwapping || !swapFromAmount || Number(swapFromAmount) <= 0}
                    className={`w-full mt-6 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                      isSwapping || !swapFromAmount || Number(swapFromAmount) <= 0
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1'
                    }`}
                  >
                    {isSwapping ? 'Swapping...' : 'Swap Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Balance Card - Glass Effect */}
              <div className={`md:col-span-2 backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 relative overflow-hidden transition-colors ${darkMode ? 'bg-zinc-900/70 border-zinc-800/60' : 'bg-white/70 border-zinc-200/60'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <p className="text-zinc-500 font-medium mb-1">Total Portfolio Value</p>
                    <h2 className="text-4xl font-bold tracking-tight">₦{totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <ArrowUpRight size={16} className="mr-1" />
                        +5.2%
                      </span>
                      <span className="text-sm text-zinc-500">vs last week</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => setShowDeposit(true)} className="flex-1 md:flex-none bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/20">
                      Deposit
                    </button>
                    <button onClick={() => setShowWithdraw(true)} className={`flex-1 md:flex-none border px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm ${darkMode ? 'bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-zinc-200' : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700'}`}>
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* Trading Bot Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-zinc-900/10 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Bot className="text-brand-400" size={24} />
                    <h3 className="font-semibold text-zinc-200">AI Trading Bot</h3>
                  </div>
                  {botActive ? (
                    <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Status</span>
                        <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 animate-pulse"><Zap size={14}/> Running</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Pair</span>
                        <span className="font-medium">BTC/USDT</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">24h Profit</span>
                        <span className="text-emerald-400 font-medium">+₦142,500.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Auto-Trades</span>
                        <span className="font-medium">24</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 relative z-10">
                      <p className="text-sm text-zinc-400">Automate your transactions with our high-frequency grid trading bot.</p>
                      <ul className="text-sm text-zinc-300 space-y-1 mt-2">
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-400"/> Buy low, sell high automatically</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-400"/> 24/7 market monitoring</li>
                      </ul>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => botActive ? setBotActive(false) : setShowBotConfig(true)} 
                  className={`w-full py-3 rounded-xl font-medium transition-all relative z-10 mt-4 ${botActive ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-brand-600 hover:bg-brand-500 text-white'}`}
                >
                  {botActive ? 'Stop Bot' : 'Start Auto-Trading'}
                </button>
              </div>
            </div>

            {/* Chart and Assets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className={`lg:col-span-2 backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-zinc-900/70 border-zinc-800/60' : 'bg-white/70 border-zinc-200/60'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">Market Overview</h3>
                    <p className="text-sm text-zinc-500">BTC/USD</p>
                  </div>
                  <div className="flex gap-2">
                    {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                      <button 
                        key={tf}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          tf === '1D' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50'
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
                        tickFormatter={(value) => `₦${value.toLocaleString()}`}
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
              <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-zinc-900/70 border-zinc-800/60' : 'bg-white/70 border-zinc-200/60'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Your Assets</h3>
                  <button className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</button>
                </div>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${asset.bg} ${asset.color} flex items-center justify-center`}>
                          <asset.icon size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">{asset.symbol}</p>
                          <p className="text-xs text-zinc-500">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{asset.balance} {asset.symbol}</p>
                        <p className="text-xs text-zinc-500">{asset.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Market Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Book */}
              <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-zinc-900/70 border-zinc-800/60' : 'bg-white/70 border-zinc-200/60'}`}>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><List size={20}/> Live Order Book (BTC/USDT)</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500 font-medium mb-2 px-2">
                    <span>Price (USDT)</span>
                    <span>Amount (BTC)</span>
                    <span>Total</span>
                  </div>
                  {orderBook.filter(o => o.type === 'sell').slice(0,4).map((order, i) => (
                    <div key={`sell-${i}`} className="flex justify-between text-sm px-2 py-1 rounded hover:bg-brand-500/5 cursor-pointer relative overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 bg-brand-500/10" style={{width: `${(order.amount / 2) * 100}%`}}></div>
                      <span className="text-red-500 font-mono relative z-10">{order.price.toFixed(2)}</span>
                      <span className="font-mono relative z-10">{order.amount.toFixed(4)}</span>
                      <span className="font-mono text-zinc-500 relative z-10">{(order.price * order.amount).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className={`py-2 text-center font-bold text-lg font-mono border-y transition-colors my-2 flex items-center justify-center gap-2 ${darkMode ? 'border-zinc-800 text-white' : 'border-zinc-200 text-zinc-900'}`}>
                    ₦{livePrices.BTC.toFixed(2)} <TrendingUp size={18} className="text-emerald-500" />
                  </div>
                  {orderBook.filter(o => o.type === 'buy').slice(0,4).map((order, i) => (
                    <div key={`buy-${i}`} className="flex justify-between text-sm px-2 py-1 rounded hover:bg-emerald-500/5 cursor-pointer relative overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10" style={{width: `${(order.amount / 2) * 100}%`}}></div>
                      <span className="text-emerald-500 font-mono relative z-10">{order.price.toFixed(2)}</span>
                      <span className="font-mono relative z-10">{order.amount.toFixed(4)}</span>
                      <span className="font-mono text-zinc-500 relative z-10">{(order.price * order.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className={`backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-3xl p-6 transition-colors ${darkMode ? 'bg-zinc-900/70 border-zinc-800/60' : 'bg-white/70 border-zinc-200/60'}`}>
                <h3 className="font-semibold text-lg mb-6">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className={`text-xs uppercase border-b ${darkMode ? 'text-zinc-400 bg-zinc-800/50 border-zinc-800' : 'text-zinc-500 bg-zinc-50/50 border-zinc-100'}`}>
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-tl-xl">Type</th>
                        <th className="px-4 py-3 font-medium">Asset</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium rounded-tr-xl text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className={`border-b last:border-0 transition-colors ${darkMode ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-zinc-50 hover:bg-zinc-50/50'}`}>
                          <td className="px-4 py-4 font-medium">
                            <span className={`inline-flex items-center gap-1.5 ${
                              tx.type === 'Deposit' ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                              {tx.type === 'Deposit' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-medium">NGN</td>
                          <td className="px-4 py-4">₦{tx.amount.toLocaleString()}</td>
                          <td className="px-4 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              tx.status === 'Approved' ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') :
                              tx.status === 'Rejected' ? (darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700') :
                              (darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700')
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {userTransactions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No recent transactions</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
          )}
        </div>
      </main>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Deposit Funds</h3>
              <button onClick={() => { setShowDeposit(false); setPaymentDone(false); }} className={`p-2 rounded-full ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                <X size={20} />
              </button>
            </div>
            
            {paymentDone ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-bold mb-2">Payment Confirmed!</h4>
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Your deposit is being processed and will reflect in your balance shortly.</p>
                <button onClick={() => { setShowDeposit(false); setPaymentDone(false); }} className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium transition-all">
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Please transfer the exact amount you wish to deposit to the bank account below.
                </p>
                
                <div className={`p-4 rounded-2xl space-y-4 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Bank Name</p>
                    <p className="font-semibold text-lg">OPay</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Account Number</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xl font-bold tracking-wider text-brand-500">9136806231</p>
                      <button onClick={handleCopy} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-500'}`} title="Copy Account Number">
                        {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Account Name</p>
                    <p className="font-semibold">Adeniji samuel Temiloluwa</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {depositError && (
                    <div className="bg-brand-500/10 text-brand-500 p-3 rounded-xl text-sm border border-brand-500/20">
                      {depositError}
                    </div>
                  )}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Amount Transferred (NGN)</label>
                    <input 
                      type="number" 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="e.g. 100000"
                      className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Your Bank Name</label>
                    <input 
                      type="text" 
                      value={depositBankName}
                      onChange={(e) => setDepositBankName(e.target.value)}
                      placeholder="e.g. GTBank"
                      className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Transfer Reference</label>
                    <input 
                      type="text" 
                      value={depositReference}
                      onChange={(e) => setDepositReference(e.target.value)}
                      placeholder="e.g. Session ID or Ref"
                      className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Proof Link (Screenshot URL)</label>
                    <div className="relative">
                      <Upload className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} size={18} />
                      <input 
                        type="text" 
                        value={depositProofLink}
                        onChange={(e) => setDepositProofLink(e.target.value)}
                        placeholder="Link to receipt screenshot"
                        className={`w-full pl-10 p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                      />
                    </div>
                  </div>
                </div>

                <button onClick={handleDepositSubmit} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Payment Done
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Withdraw Funds</h3>
              <button onClick={() => setShowWithdraw(false)} className={`p-2 rounded-full ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Available Balance</p>
                <p className="text-2xl font-bold text-emerald-500">₦{currentUserData.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>

              <div className="space-y-4">
                {withdrawError && (
                  <div className="bg-brand-500/10 text-brand-500 p-3 rounded-xl text-sm border border-brand-500/20">
                    {withdrawError}
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Amount to Withdraw (NGN)</label>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Bank Name</label>
                  <input 
                    type="text" 
                    value={withdrawBankName}
                    onChange={(e) => setWithdrawBankName(e.target.value)}
                    placeholder="Enter bank name"
                    className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Account Number</label>
                  <input 
                    type="text" 
                    value={withdrawAccountNumber}
                    onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Account Name</label>
                  <input 
                    type="text" 
                    value={withdrawAccountName}
                    onChange={(e) => setWithdrawAccountName(e.target.value)}
                    placeholder="Enter account name"
                    className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-brand-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-brand-500'}`} 
                  />
                </div>
              </div>

              <button onClick={handleWithdrawSubmit} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/20">
                Submit Withdrawal Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">User Profile</h3>
              <button onClick={() => setShowProfile(false)} className={`p-2 rounded-full ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-brand-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-brand-600 font-bold text-3xl mb-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-2xl font-bold">{user.displayName || 'User'}</h2>
              <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{user.email}</p>
            </div>

            <div className={`p-4 rounded-2xl space-y-4 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Account Status</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">Verified</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>User ID</span>
                <span className="font-mono text-sm">{user.uid.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Joined</span>
                <span className="text-sm">{new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            <button 
              onClick={() => { setShowProfile(false); onLogout(); }}
              className="w-full mt-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </motion.div>
        </div>
      )}

      {/* Trading Bot Config Modal */}
      {showBotConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Bot className="text-brand-500" size={24} />
                <h3 className="text-xl font-bold">Configure Trading Bot</h3>
              </div>
              <button onClick={() => setShowBotConfig(false)} className={`p-2 rounded-full ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Trading Pair</label>
                <select className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}>
                  <option>BTC/USDT</option>
                  <option>ETH/USDT</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Investment Amount (NGN)</label>
                <input type="number" defaultValue={1000000} className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Lower Price</label>
                  <input type="number" defaultValue={40000} className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Upper Price</label>
                  <input type="number" defaultValue={45000} className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Grid Number</label>
                <input type="number" defaultValue={20} className={`w-full p-3 rounded-xl outline-none border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`} />
              </div>
              
              <button 
                onClick={() => { setBotActive(true); setShowBotConfig(false); }} 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/20 mt-4"
              >
                Create Bot
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Token Selector Modal */}
      {showTokenSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Select a token</h3>
              <button onClick={() => setShowTokenSelector(null)} className={`p-2 rounded-full ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {supportedAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    if (showTokenSelector === 'from') {
                      setSwapFromAsset(asset.symbol);
                    } else {
                      setSwapToAsset(asset.symbol);
                    }
                    setShowTokenSelector(null);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    darkMode 
                      ? 'hover:bg-zinc-800' 
                      : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-lg">
                      {asset.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{asset.symbol}</div>
                      <div className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {asset.symbol === 'NGN' 
                        ? `₦${currentUserData.balance.toLocaleString()}` 
                        : (currentUserData.balances?.[asset.symbol] || 0).toLocaleString(undefined, {maximumFractionDigits: 4})}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Swap Success Modal */}
      {showSwapSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-8 rounded-3xl shadow-2xl text-center ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Swap Successful!</h3>
            <p className={`mb-8 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Your assets have been successfully exchanged and are now available in your wallet.
            </p>

            {swapToAsset === 'NGN' && (
              <div className={`p-4 rounded-2xl mb-6 text-left ${darkMode ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Wallet size={16} className="text-brand-500" />
                  Withdraw to Bank
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  You can now withdraw your NGN directly to your bank account.
                </p>
                <button 
                  onClick={() => {
                    setShowSwapSuccessModal(false);
                    setShowWithdraw(true);
                  }}
                  className="w-full py-3 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all"
                >
                  Withdraw Now
                </button>
              </div>
            )}

            <button 
              onClick={() => setShowSwapSuccessModal(false)}
              className={`w-full py-3 rounded-xl font-bold transition-all ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
