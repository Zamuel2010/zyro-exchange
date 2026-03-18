import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Lock, Mail, User, Moon, Sun } from 'lucide-react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import Logo from './Logo';

export default function Auth({ onLogin, darkMode, toggleDarkMode }: { onLogin: () => void, darkMode?: boolean, toggleDarkMode?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Note: We could also update the user's profile with their name here
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors ${darkMode ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Theme Toggle */}
      {toggleDarkMode && (
        <button 
          onClick={toggleDarkMode} 
          className={`absolute top-6 right-6 p-3 rounded-full transition-colors z-20 shadow-lg ${darkMode ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800' : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}

      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20 rounded-2xl ${darkMode ? 'bg-zinc-900/50' : 'bg-white'}`}>
            <Logo className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Zyro Exchange</h1>
          <p className={`mt-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Trade Crypto Instantly & Securely</p>
        </div>

        {/* Glass Container */}
        <div className={`backdrop-blur-xl border shadow-2xl rounded-3xl p-8 relative z-10 transition-colors ${darkMode ? 'bg-zinc-900/50 border-white/10' : 'bg-white/80 border-zinc-200/60'}`}>
          <div className={`flex p-1 rounded-xl mb-8 ${darkMode ? 'bg-zinc-800/50' : 'bg-zinc-100'}`}>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? (darkMode ? 'bg-zinc-700 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm') : (darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-900')}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? (darkMode ? 'bg-zinc-700 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm') : (darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-900')}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
                {error}
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Full Name</label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} size={20} />
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all ${darkMode ? 'bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all ${darkMode ? 'bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Password</label>
                {isLogin && <a href="#" className="text-xs text-brand-600 hover:text-brand-500 font-medium">Forgot password?</a>}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all ${darkMode ? 'bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'}`}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6 shadow-lg shadow-brand-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative flex items-center py-2">
              <div className={`flex-grow border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
              <span className={`flex-shrink-0 mx-4 text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Or continue with</span>
              <div className={`flex-grow border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border ${darkMode ? 'bg-zinc-800/50 hover:bg-zinc-800 text-white border-zinc-700' : 'bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
