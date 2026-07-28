type AuthSessionExpiredListener = () => void;

const authSessionExpiredListeners = new Set<AuthSessionExpiredListener>();

export function subscribeToAuthSessionExpired(listener: AuthSessionExpiredListener) {
  authSessionExpiredListeners.add(listener);
  return () => {
    authSessionExpiredListeners.delete(listener);
  };
}

export function notifyAuthSessionExpired() {
  authSessionExpiredListeners.forEach(listener => listener());
}
