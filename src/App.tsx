import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DBProvider } from './context/DBContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DBProvider>
      <Router>
        <div className={`min-h-screen font-sans selection:bg-brand-500/30 transition-colors duration-200 ${darkMode ? 'dark bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'}`}>
          <Routes>
            <Route path="/" element={
              user ? (
                <Dashboard user={user} onLogout={() => auth.signOut()} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              ) : (
                <Auth onLogin={() => {}} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              )
            } />
            <Route path="/admin" element={
              user ? (
                <AdminDashboard user={user} onLogout={() => auth.signOut()} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              ) : (
                <Navigate to="/" replace />
              )
            } />
          </Routes>
        </div>
      </Router>
    </DBProvider>
  );
}
