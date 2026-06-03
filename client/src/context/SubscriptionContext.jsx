import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../apis/api';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'free',
    subscription: null,
    limits: { maxPortfolios: 1, hostingDuration: '7 days' },
    usage: { activePortfolios: 0, archivedPortfolios: 0 },
    canCreatePortfolio: true,
    canExportCode: false,
  });
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/subscription/status');
      setSubscriptionData(data);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStatus();
    } else {
      // Reset when logged out
      setSubscriptionData({
        plan: 'free',
        subscription: null,
        limits: { maxPortfolios: 1, hostingDuration: '7 days' },
        usage: { activePortfolios: 0, archivedPortfolios: 0 },
        canCreatePortfolio: true,
        canExportCode: false,
      });
    }
  }, [user, fetchStatus]);

  return (
    <SubscriptionContext.Provider value={{ ...subscriptionData, loading, refreshSubscription: fetchStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
export default SubscriptionContext;
