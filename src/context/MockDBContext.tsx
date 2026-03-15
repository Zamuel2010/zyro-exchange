import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'Deposit' | 'Withdraw';
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  proof?: string;
  reference?: string;
  notes?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface UserData {
  id: string;
  email: string;
  balance: number;
  regDate: string;
  lastLogin: string;
}

export interface Activity {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  date: string;
}

interface MockDBContextType {
  users: UserData[];
  transactions: Transaction[];
  activities: Activity[];
  registerUser: (id: string, email: string) => void;
  updateUserLogin: (id: string) => void;
  updateUserBalance: (id: string, amount: number) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  updateTransactionStatus: (id: string, status: 'Approved' | 'Rejected', notes?: string) => void;
  logActivity: (userId: string, userEmail: string, action: string) => void;
}

const MockDBContext = createContext<MockDBContextType | undefined>(undefined);

export function MockDBProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserData[]>(() => {
    const saved = localStorage.getItem('zyro_users');
    return saved ? JSON.parse(saved) : [
      { id: 'admin1', email: 'samadeniji852@gmail.com', balance: 334700.00, regDate: new Date().toISOString(), lastLogin: new Date().toISOString() },
      { id: 'user2', email: 'testuser@example.com', balance: 5000.00, regDate: new Date(Date.now() - 86400000 * 5).toISOString(), lastLogin: new Date().toISOString() }
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('zyro_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 'tx1', userId: 'user2', userEmail: 'testuser@example.com', type: 'Deposit', amount: 2000, date: new Date(Date.now() - 3600000).toISOString(), status: 'Pending', reference: 'REF123456' }
    ];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('zyro_activities');
    return saved ? JSON.parse(saved) : [
      { id: 'act1', userId: 'user2', userEmail: 'testuser@example.com', action: 'Logged in', date: new Date().toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem('zyro_users', JSON.stringify(users));
    localStorage.setItem('zyro_transactions', JSON.stringify(transactions));
    localStorage.setItem('zyro_activities', JSON.stringify(activities));
  }, [users, transactions, activities]);

  const registerUser = (id: string, email: string) => {
    if (!users.find(u => u.id === id)) {
      setUsers(prev => [...prev, { id, email, balance: 0, regDate: new Date().toISOString(), lastLogin: new Date().toISOString() }]);
      logActivity(id, email, 'Registered new account');
    }
  };

  const updateUserLogin = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, lastLogin: new Date().toISOString() } : u));
  };

  const updateUserBalance = (id: string, amount: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, balance: amount } : u));
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'Pending'
    };
    setTransactions(prev => [newTx, ...prev]);
    logActivity(tx.userId, tx.userEmail, `Submitted ${tx.type} request for $${tx.amount}`);
  };

  const updateTransactionStatus = (id: string, status: 'Approved' | 'Rejected', notes?: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        // If approving a deposit, add to balance
        if (status === 'Approved' && t.status === 'Pending' && t.type === 'Deposit') {
          setUsers(users => users.map(u => u.id === t.userId ? { ...u, balance: u.balance + t.amount } : u));
        }
        // If approving a withdrawal, subtract from balance (assuming balance was already checked)
        if (status === 'Approved' && t.status === 'Pending' && t.type === 'Withdraw') {
          setUsers(users => users.map(u => u.id === t.userId ? { ...u, balance: u.balance - t.amount } : u));
        }
        return { ...t, status, notes };
      }
      return t;
    }));
  };

  const logActivity = (userId: string, userEmail: string, action: string) => {
    const newAct: Activity = {
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      userId,
      userEmail,
      action,
      date: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);
  };

  return (
    <MockDBContext.Provider value={{ users, transactions, activities, registerUser, updateUserLogin, updateUserBalance, addTransaction, updateTransactionStatus, logActivity }}>
      {children}
    </MockDBContext.Provider>
  );
}

export const useMockDB = () => {
  const context = useContext(MockDBContext);
  if (!context) throw new Error('useMockDB must be used within MockDBProvider');
  return context;
};
