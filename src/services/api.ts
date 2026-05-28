import axiosClient from './axiosClient';
import { authService } from './authService';

export const authApi = {
  login: async (username: string, password: string) => {
    const result = await authService.login({ username, password });
    return {
      token: result.tokens.accessToken,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    };
  },

  register: async (username: string, password: string, confirmPassword: string) => {
    const result = await authService.register({ username, password, confirmPassword });
    return {
      token: result.tokens.accessToken,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    };
  },

  googleLogin: authService.googleLogin,
  logout: authService.logout,
  setCredentials: authService.setCredentials,
  linkGoogle: authService.linkGoogle,
};

export default axiosClient;
