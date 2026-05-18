import {useState, useEffect} from 'react';
import {AppState, AppStateStatus, Platform} from 'react-native';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>('active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return {isConnected, appState};
};
