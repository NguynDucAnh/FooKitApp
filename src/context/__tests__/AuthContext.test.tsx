import React, { useContext } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { unmountWithAct } from '../../test-utils/reactTestRenderer';
import { AuthContext, AuthProvider } from '../AuthContext';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
} from '../../utils/tokenStorage';
import { refreshAccessToken } from '../../services/axiosClient';

jest.mock('../../services/axiosClient', () => ({
  __esModule: true,
  default: {},
  refreshAccessToken: jest.fn(),
}));

jest.mock('../../utils/tokenStorage', () => ({
  clearAuthStorage: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  getStoredUser: jest.fn(),
  saveStoredUser: jest.fn(),
}));

const mockedClearAuthStorage = clearAuthStorage as jest.MockedFunction<typeof clearAuthStorage>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedGetRefreshToken = getRefreshToken as jest.MockedFunction<typeof getRefreshToken>;
const mockedGetStoredUser = getStoredUser as jest.MockedFunction<typeof getStoredUser>;
const mockedRefreshAccessToken = refreshAccessToken as jest.MockedFunction<typeof refreshAccessToken>;

type AuthState = NonNullable<React.ContextType<typeof AuthContext>>;

let latestAuthState: AuthState | null = null;

function AuthProbe() {
  latestAuthState = useContext(AuthContext);
  return null;
}

async function renderAuthProvider() {
  let renderer: TestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = TestRenderer.create(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  return renderer!;
}

function getLatestAuthState() {
  if (!latestAuthState) throw new Error('AuthProvider chưa cung cấp state');
  return latestAuthState;
}

function createUnsignedJwt(payload: Record<string, unknown>) {
  const encode = (value: object) => Buffer
    .from(JSON.stringify(value), 'utf8')
    .toString('base64url');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`;
}

describe('AuthProvider hydration', () => {
  beforeEach(() => {
    latestAuthState = null;
    mockedClearAuthStorage.mockResolvedValue();
    mockedRefreshAccessToken.mockReset();
  });

  it('hydrates a stored session and exits loading', async () => {
    mockedGetAccessToken.mockResolvedValue(createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3_600,
    }));
    mockedGetRefreshToken.mockResolvedValue('stored-refresh-token');
    mockedGetStoredUser.mockResolvedValue({
      username: 'test-user',
      name: 'Người dùng thử',
      email: 'test@example.test',
      roles: ['User'],
    });

    const renderer = await renderAuthProvider();

    expect(getLatestAuthState()).toMatchObject({
      isAuthenticated: true,
      loading: false,
      currentUser: {
        username: 'test-user',
        role: 'User',
        roles: ['User'],
      },
    });

    unmountWithAct(renderer);
  });

  it('clears in-memory auth state and exits loading when storage hydration fails', async () => {
    mockedGetAccessToken.mockRejectedValue(new Error('storage unavailable'));
    mockedGetRefreshToken.mockResolvedValue('stored-refresh-token');
    mockedGetStoredUser.mockResolvedValue({
      username: 'stale-user',
      name: 'Dữ liệu cũ',
      email: 'stale@example.test',
    });

    const renderer = await renderAuthProvider();

    expect(getLatestAuthState()).toMatchObject({
      accessToken: null,
      currentUser: null,
      isAuthenticated: false,
      loading: false,
    });

    unmountWithAct(renderer);
  });

  it('refreshes an expired persisted session before exposing auth state', async () => {
    mockedGetAccessToken.mockResolvedValue(createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) - 60,
    }));
    mockedGetRefreshToken.mockResolvedValue('stored-refresh-token');
    mockedGetStoredUser.mockResolvedValue({
      username: 'expired-user',
      name: 'Người dùng hết hạn',
      email: 'expired@example.test',
    });
    mockedRefreshAccessToken.mockResolvedValue(createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3_600,
    }));

    const renderer = await renderAuthProvider();

    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mockedClearAuthStorage).not.toHaveBeenCalled();
    expect(getLatestAuthState()).toMatchObject({
      currentUser: { username: 'expired-user' },
      isAuthenticated: true,
      loading: false,
    });

    unmountWithAct(renderer);
  });

  it('clears an incomplete persisted session without a refresh token', async () => {
    mockedGetAccessToken.mockResolvedValue(createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3_600,
    }));
    mockedGetRefreshToken.mockResolvedValue(null);
    mockedGetStoredUser.mockResolvedValue({
      username: 'incomplete-user',
      name: 'Người dùng thiếu token',
      email: 'incomplete@example.test',
    });

    const renderer = await renderAuthProvider();

    expect(mockedClearAuthStorage).toHaveBeenCalledTimes(1);
    expect(getLatestAuthState()).toMatchObject({
      accessToken: null,
      currentUser: null,
      isAuthenticated: false,
      loading: false,
    });

    unmountWithAct(renderer);
  });
});
