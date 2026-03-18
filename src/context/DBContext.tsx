import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, query, orderBy, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
  displayName?: string;
  balance: number;
  balances?: { [asset: string]: number };
  role: 'user' | 'admin';
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

interface DBContextType {
  users: UserData[];
  transactions: Transaction[];
  activities: Activity[];
  registerUser: (id: string, email: string) => Promise<void>;
  updateUserLogin: (id: string) => Promise<void>;
  updateUserBalance: (id: string, amount: number) => Promise<void>;
  swapAssets: (userId: string, userEmail: string, fromAsset: string, toAsset: string, fromAmount: number, toAmount: number) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => Promise<void>;
  updateTransactionStatus: (id: string, status: 'Approved' | 'Rejected', notes?: string) => Promise<void>;
  logActivity: (userId: string, userEmail: string, action: string) => Promise<void>;
}

const DBContext = createContext<DBContextType | undefined>(undefined);

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: UserData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          balance: data.balance || 0,
          balances: data.balances || { BTC: 0, ETH: 0, USDT: 0 },
          role: data.role || 'user',
          regDate: data.createdAt || new Date().toISOString(),
          lastLogin: data.lastLogin || new Date().toISOString(),
        });
      });
      setUsers(usersData);
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    // Listen to transactions
    const qTx = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubTx = onSnapshot(qTx, (snapshot) => {
      const txData: Transaction[] = [];
      snapshot.forEach((doc) => {
        txData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(txData);
    }, (error) => {
      console.error('Error fetching transactions:', error);
    });

    // Listen to activities
    const qAct = query(collection(db, 'activities'), orderBy('date', 'desc'));
    const unsubAct = onSnapshot(qAct, (snapshot) => {
      const actData: Activity[] = [];
      snapshot.forEach((doc) => {
        actData.push({ id: doc.id, ...doc.data() } as Activity);
      });
      setActivities(actData);
    }, (error) => {
      console.error('Error fetching activities:', error);
    });

    return () => {
      unsubUsers();
      unsubTx();
      unsubAct();
    };
  }, [currentUser]);

  const registerUser = async (id: string, email: string) => {
    try {
      const userRef = doc(db, 'users', id);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: id,
          email,
          balance: 0,
          balances: { BTC: 0, ETH: 0, USDT: 0 },
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        await logActivity(id, email, 'Registered new account');
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const updateUserLogin = async (id: string) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user login:', error);
    }
  };

  const updateUserBalance = async (id: string, amount: number) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        balance: amount
      });
    } catch (error) {
      console.error('Error updating user balance:', error);
    }
  };

  const swapAssets = async (userId: string, userEmail: string, fromAsset: string, toAsset: string, fromAmount: number, toAmount: number) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentBalances = userData.balances || { BTC: 0, ETH: 0, USDT: 0 };
        const currentNgnBalance = userData.balance || 0;

        const updates: any = {};
        
        // Deduct fromAsset
        if (fromAsset === 'NGN') {
          updates.balance = currentNgnBalance - fromAmount;
        } else {
          updates.balances = {
            ...currentBalances,
            [fromAsset]: (currentBalances[fromAsset] || 0) - fromAmount
          };
        }

        // Add toAsset
        if (toAsset === 'NGN') {
          updates.balance = (updates.balance !== undefined ? updates.balance : currentNgnBalance) + toAmount;
        } else {
          updates.balances = {
            ...(updates.balances || currentBalances),
            [toAsset]: ((updates.balances || currentBalances)[toAsset] || 0) + toAmount
          };
        }

        await updateDoc(userRef, updates);
        await logActivity(userId, userEmail, `Swapped ${fromAmount} ${fromAsset} for ${toAmount} ${toAsset}`);
      }
    } catch (error) {
      console.error('Error swapping assets:', error);
      throw error;
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    try {
      const txRef = doc(collection(db, 'transactions'));
      const newTx = {
        ...tx,
        status: 'Pending',
        date: new Date().toISOString()
      };
      await setDoc(txRef, newTx);
      await logActivity(tx.userId, tx.userEmail, `Submitted ${tx.type} request for $${tx.amount}`);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransactionStatus = async (id: string, status: 'Approved' | 'Rejected', notes?: string) => {
    try {
      const txRef = doc(db, 'transactions', id);
      const txSnap = await getDoc(txRef);
      if (txSnap.exists()) {
        const txData = txSnap.data() as Transaction;
        
        if (status === 'Approved' && txData.status === 'Pending') {
          const userRef = doc(db, 'users', txData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (txData.type === 'Deposit') {
              await updateDoc(userRef, { balance: (userData.balance || 0) + txData.amount });
            } else if (txData.type === 'Withdraw') {
              await updateDoc(userRef, { balance: (userData.balance || 0) - txData.amount });
            }
          }
        }
        
        await updateDoc(txRef, { status, notes: notes || '' });
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const logActivity = async (userId: string, userEmail: string, action: string) => {
    try {
      const actRef = doc(collection(db, 'activities'));
      await setDoc(actRef, {
        userId,
        userEmail,
        action,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return (
    <DBContext.Provider value={{ users, transactions, activities, registerUser, updateUserLogin, updateUserBalance, swapAssets, addTransaction, updateTransactionStatus, logActivity }}>
      {children}
    </DBContext.Provider>
  );
}

export const useDB = () => {
  const context = useContext(DBContext);
  if (!context) throw new Error('useDB must be used within DBProvider');
  return context;
};
