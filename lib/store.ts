import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BalanceState {
  balance: number;
  isProcessing: boolean;
  addFunds: (amount: number, sessionId?: string) => void;
  deductFunds: (amount: number, sessionId?: string) => boolean;
  resetBalance: () => void;
  lastTransaction: {
    id: string | null;
    sessionId: string | null;
    amount: number;
    timestamp: number;
  };
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set, get) => ({
      balance: 0,
      isProcessing: false,
      lastTransaction: {
        id: null,
        sessionId: null,
        amount: 0,
        timestamp: 0
      },
      
      addFunds: (amount: number, sessionId?: string) => {
        // 処理中や金額の検証
        if (get().isProcessing) {
          return;
        }
        
        // 同一セッションIDの取引チェック
        const lastTx = get().lastTransaction;
        if (sessionId && lastTx.sessionId === sessionId) {
          return;
        }
        
        // 金額の検証
        if (!amount || isNaN(amount) || amount <= 0) {
          return;
        }
        
        // 処理開始
        set({ isProcessing: true });
        
        try {
          const oldBalance = get().balance;
          const newBalance = oldBalance + amount;
          
          // 残高と取引情報を更新
          set({ 
            balance: newBalance,
            lastTransaction: {
              id: `add-${Date.now()}`,
              sessionId: sessionId || null,
              amount: amount,
              timestamp: Date.now()
            }
          });
        } finally {
          // 処理完了フラグをリセット
          setTimeout(() => {
            set({ isProcessing: false });
          }, 50);
        }
      },
      
      deductFunds: (amount: number, sessionId?: string) => {
        // 処理中や金額の検証
        if (get().isProcessing) {
          return false;
        }
        
        // 同一セッションIDの取引チェック
        const lastTx = get().lastTransaction;
        if (sessionId && lastTx.sessionId === sessionId) {
          return false;
        }
        
        let success = false;
        
        // 金額の検証
        if (!amount || isNaN(amount) || amount <= 0) {
          return false;
        }
        
        // 処理開始
        set({ isProcessing: true });
        
        try {
          const currentBalance = get().balance;
          
          // 残高チェック
          if (currentBalance >= amount) {
            const newBalance = currentBalance - amount;
            
            // 残高と取引情報を更新
            set({ 
              balance: newBalance,
              lastTransaction: {
                id: `deduct-${Date.now()}`,
                sessionId: sessionId || null,
                amount: -amount,
                timestamp: Date.now()
              }
            });
            
            success = true;
          }
        } finally {
          // 処理完了フラグをリセット
          setTimeout(() => {
            set({ isProcessing: false });
          }, 50);
        }
        
        return success;
      },
      
      resetBalance: () => {
        set({ 
          balance: 0,
          lastTransaction: {
            id: `reset-${Date.now()}`,
            sessionId: null,
            amount: 0,
            timestamp: Date.now()
          }
        });
      },
    }),
    {
      name: 'balance-storage',
    }
  )
); 