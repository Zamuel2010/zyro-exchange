import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MockDBProvider } from './context/MockDBContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <MockDBProvider>
      <Router>
        <div className={`min-h-screen font-sans selection:bg-red-500/30 transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
          <Routes>
            <Route path="/" element={
              user ? (
                <Dashboard user={user} onLogout={() => auth.signOut()} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
              ) : (
                <Auth onLogin={() => {}} />
              )
            } />
            <Route path="/admin" element={
              user ? (
                <AdminDashboard user={user} onLogout={() => auth.signOut()} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
              ) : (
                <Navigate to="/" replace />
              )
            } />
          </Routes>
        </div>
      </Router>
    </MockDBProvider>
  );
}
