import axios from 'axios';
import { router } from 'expo-router';
import axiosClient from '../axiosClient';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../../utils/tokenStorage';

jest.mock('axios', () => {
  const client = Object.assign(jest.fn(), {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  });

  return {
    __esModule: true,
    default: {
      __client: client,
      create: jest.fn(() => client),
      post: jest.fn(),
    },
  };
});

jest.mock('../../utils/tokenStorage', () => ({
  clearAuthStorage: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  saveTokens: jest.fn(),
}));

type RejectedInterceptor = (error: {
  response: { status: number };
  config: { headers: Record<string, string>; _retry?: boolean };
}) => Promise<unknown>;

const mockedAxios = axios as unknown as {
  __client: jest.Mock & {
    interceptors: {
      response: { use: jest.Mock };
    };
  };
  post: jest.Mock;
};
const mockedClient = axiosClient as unknown as jest.Mock;
const responseRejected = mockedAxios.__client.interceptors.response.use
  .mock.calls[0][1] as RejectedInterceptor;
const mockedClearAuthStorage = clearAuthStorage as jest.MockedFunction<typeof clearAuthStorage>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedGetRefreshToken = getRefreshToken as jest.MockedFunction<typeof getRefreshToken>;
const mockedSaveTokens = saveTokens as jest.MockedFunction<typeof saveTokens>;
const mockedRouterReplace = router.replace as jest.Mock;

function unauthorizedError() {
  return {
    response: { status: 401 },
    config: { headers: {} as Record<string, string> },
  };
}

describe('axiosClient refresh coordination', () => {
  beforeEach(() => {
    mockedGetAccessToken.mockResolvedValue('old-access-token');
    mockedGetRefreshToken.mockResolvedValue('old-refresh-token');
    mockedSaveTokens.mockResolvedValue();
    mockedClearAuthStorage.mockResolvedValue();
    mockedClient.mockImplementation(async config => config);
  });

  it('uses one bounded refresh request for concurrent 401 responses and retries with Bearer', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    });

    const firstRequest = unauthorizedError();
    const secondRequest = unauthorizedError();
    await Promise.all([
      responseRejected(firstRequest),
      responseRejected(secondRequest),
    ]);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/Auth/refresh-token'),
      {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      },
      { timeout: 10_000 },
    );
    expect(mockedSaveTokens).toHaveBeenCalledTimes(1);
    expect(firstRequest.config.headers.Authorization).toBe('Bearer new-access-token');
    expect(secondRequest.config.headers.Authorization).toBe('Bearer new-access-token');
    expect(mockedClient).toHaveBeenCalledTimes(2);
  });

  it('clears storage and redirects only once when a shared refresh fails', async () => {
    const refreshError = new Error('refresh failed');
    mockedAxios.post.mockRejectedValue(refreshError);

    const results = await Promise.allSettled([
      responseRejected(unauthorizedError()),
      responseRejected(unauthorizedError()),
    ]);

    expect(results).toEqual([
      { status: 'rejected', reason: refreshError },
      { status: 'rejected', reason: refreshError },
    ]);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedClearAuthStorage).toHaveBeenCalledTimes(1);
    expect(mockedRouterReplace).toHaveBeenCalledTimes(1);
    expect(mockedRouterReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
