import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import AdminDashboardScreen from '../../../../app/(tabs)/admin';
import { useAuth } from '../../../hooks/useAuth';
import { adminService } from '../../../services/adminService';

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../services/adminService', () => ({
  adminService: {
    getOverview: jest.fn(),
    getUsers: jest.fn(),
    getPlans: jest.fn(),
    getAffiliateLinks: jest.fn(),
    getApiUsage: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('AdminDashboardScreen data effects', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      currentUser: {
        id: 'admin-1',
        username: 'admin',
        name: 'Admin',
        email: 'admin@example.com',
        isAdmin: true,
      },
      accessToken: 'access-token',
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      googleLogin: jest.fn(),
      logout: jest.fn(),
      setCredentials: jest.fn(),
      linkGoogle: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      updateLocalUser: jest.fn(),
    });
    mockedAdminService.getOverview.mockResolvedValue({
      totalUsers: 0,
      totalPremiumUsers: 0,
      totalRevenue: 0,
      totalSuggestionsGenerated: 0,
      newUsersToday: 0,
      totalActiveAffiliateLinks: 0,
      isWorkerRunning: undefined,
      lastAffiliateSync: undefined,
    });
    mockedAdminService.getUsers.mockResolvedValue({ items: [], totalCount: 0 });
    mockedAdminService.getPlans.mockResolvedValue({ items: [], totalCount: 0 });
    mockedAdminService.getAffiliateLinks.mockResolvedValue({ items: [], totalCount: 0 });
    mockedAdminService.getApiUsage.mockResolvedValue([]);
  });

  it('loads each section once and does not reload all sections when a filter changes', async () => {
    let renderer!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(<AdminDashboardScreen />);
      await flushPromises();
    });

    expect(mockedAdminService.getOverview).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getUsers).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getPlans).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getAffiliateLinks).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getApiUsage).toHaveBeenCalledTimes(1);

    const usersTab = renderer.root.findAllByType(TouchableOpacity).find(
      node => node.props.accessibilityRole === 'tab'
        && node.props.accessibilityLabel === 'Người dùng',
    );

    expect(usersTab).toBeDefined();

    await act(async () => {
      usersTab?.props.onPress();
      await flushPromises();
    });

    const searchInput = renderer.root.findAllByType(TextInput).find(
      node => node.props.accessibilityLabel === 'Từ khóa',
    );

    expect(searchInput).toBeDefined();

    await act(async () => {
      searchInput?.props.onChangeText('an');
      await flushPromises();
    });

    expect(mockedAdminService.getOverview).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getUsers).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getPlans).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getAffiliateLinks).toHaveBeenCalledTimes(1);
    expect(mockedAdminService.getApiUsage).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });
});
