import axiosClient from '../axiosClient';
import { authService } from '../authService';
import { saveStoredUser, saveTokens } from '../../utils/tokenStorage';

jest.mock('../axiosClient');
jest.mock('../../utils/tokenStorage', () => ({
  clearAuthStorage: jest.fn(),
  saveStoredUser: jest.fn(),
  saveTokens: jest.fn(),
}));

const mockedAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;
const mockedSaveStoredUser = saveStoredUser as jest.MockedFunction<typeof saveStoredUser>;
const mockedSaveTokens = saveTokens as jest.MockedFunction<typeof saveTokens>;

describe('authService login contract', () => {
  it('persists a successful login only when an access token is present', async () => {
    mockedAxiosClient.post.mockResolvedValueOnce({
      data: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          username: 'test-user',
          fullName: 'Người dùng thử',
          email: 'test@example.test',
        },
      },
    });

    const result = await authService.login({
      username: ' test-user ',
      password: 'test-password',
    });

    expect(mockedAxiosClient.post).toHaveBeenCalledWith('/api/Auth/login', {
      username: 'test-user',
      password: 'test-password',
    });
    expect(result.tokens.accessToken).toBe('test-access-token');
    expect(mockedSaveTokens).toHaveBeenCalledWith({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    });
    expect(mockedSaveStoredUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'test-user' }),
    );
  });

  it('rejects a nominally successful response that has no access token', async () => {
    mockedAxiosClient.post.mockResolvedValueOnce({
      data: {
        user: {
          username: 'test-user',
          fullName: 'Người dùng thử',
          email: 'test@example.test',
        },
      },
    });

    await expect(authService.login({
      username: 'test-user',
      password: 'test-password',
    })).rejects.toThrow('Phản hồi đăng nhập không có access token');

    expect(mockedSaveTokens).not.toHaveBeenCalled();
    expect(mockedSaveStoredUser).not.toHaveBeenCalled();
  });

  it('rejects a nominally successful response that has no refresh token', async () => {
    mockedAxiosClient.post.mockResolvedValueOnce({
      data: {
        accessToken: 'test-access-token',
        user: {
          username: 'test-user',
          fullName: 'Người dùng thử',
          email: 'test@example.test',
        },
      },
    });

    await expect(authService.login({
      username: 'test-user',
      password: 'test-password',
    })).rejects.toThrow('Phản hồi đăng nhập không có refresh token');

    expect(mockedSaveTokens).not.toHaveBeenCalled();
    expect(mockedSaveStoredUser).not.toHaveBeenCalled();
  });
});
