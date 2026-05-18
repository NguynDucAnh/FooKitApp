import {useAppSelector, useAppDispatch} from './useRedux';
import {login, logout, register} from '@store/slices/authSlice';
import {LoginPayload, RegisterPayload} from '@services/api/auth.api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {user, isAuthenticated, isLoading, error} = useAppSelector(state => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: (payload: LoginPayload) => dispatch(login(payload)),
    register: (payload: RegisterPayload) => dispatch(register(payload)),
    logout: () => dispatch(logout()),
  };
};
