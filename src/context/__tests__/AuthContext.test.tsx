import React, { useContext } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AuthContext, AuthProvider } from '../AuthContext';
import {
  getAccessToken,
  getStoredUser,
} from '../../utils/tokenStorage';

jest.mock('../../utils/tokenStorage', () => ({
  getAccessToken: jest.fn(),
  getStoredUser: jest.fn(),
  saveStoredUser: jest.fn(),
}));

const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedGetStoredUser = getStoredUser as jest.MockedFunction<typeof getStoredUser>;

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

describe('AuthProvider hydration', () => {
  beforeEach(() => {
    latestAuthState = null;
  });

  it('hydrates a stored session and exits loading', async () => {
    mockedGetAccessToken.mockResolvedValue('stored-access-token');
    mockedGetStoredUser.mockResolvedValue({
      username: 'test-user',
      name: 'Người dùng thử',
      email: 'test@example.test',
      roles: ['User'],
    });

    const renderer = await renderAuthProvider();

    expect(getLatestAuthState()).toMatchObject({
      accessToken: 'stored-access-token',
      isAuthenticated: true,
      loading: false,
      currentUser: {
        username: 'test-user',
        role: 'User',
        roles: ['User'],
      },
    });

    renderer.unmount();
  });

  it('clears in-memory auth state and exits loading when storage hydration fails', async () => {
    mockedGetAccessToken.mockRejectedValue(new Error('storage unavailable'));
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

    renderer.unmount();
  });
});
