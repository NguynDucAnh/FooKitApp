import axiosClient from '../axiosClient';
import { adminService } from '../adminService';
import { homepageService } from '../homepageService';
import { userService } from '../userService';
import { getJsonRequestFieldNames, getRequestFieldNames } from './openapiContract';

jest.mock('../axiosClient');

const mockedAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;

describe('service request serialization', () => {
  beforeEach(() => {
    mockedAxiosClient.put.mockResolvedValue({ data: null });
    mockedAxiosClient.post.mockResolvedValue({ data: null });
  });

  test('serializes toggle-ban using the exact OpenAPI field names', async () => {
    await adminService.toggleBan('user-1', {
      isActive: false,
      reason: 'Vi phạm điều khoản',
    });

    const expectedBody = {
      is_active: false,
      reason: 'Vi phạm điều khoản',
    };
    expect(mockedAxiosClient.put).toHaveBeenCalledWith(
      '/api/Admin/users/user-1/toggle-ban',
      expectedBody
    );
    expect(Object.keys(expectedBody).sort()).toEqual(
      getJsonRequestFieldNames('/api/Admin/users/{userId}/toggle-ban', 'put')
    );
  });

  test('serializes affiliate status using is_active', async () => {
    await adminService.toggleAffiliateLink('affiliate-1', { isActive: true });

    const expectedBody = { is_active: true };
    expect(mockedAxiosClient.put).toHaveBeenCalledWith(
      '/api/AffiliateLinks/affiliate-1/toggle-status',
      expectedBody
    );
    expect(Object.keys(expectedBody)).toEqual(
      getJsonRequestFieldNames('/api/AffiliateLinks/{id}/toggle-status', 'put')
    );
  });

  test('serializes affiliate sync using the exact snake_case fields', async () => {
    await adminService.syncAffiliateLinks({
      forceSyncAll: true,
      targetIngredientId: ' ingredient-1 ',
    });

    const expectedBody = {
      target_ingredient_id: 'ingredient-1',
      force_sync_all: true,
    };
    expect(mockedAxiosClient.post).toHaveBeenCalledWith(
      '/api/AffiliateLinks/sync',
      expectedBody
    );
    expect(Object.keys(expectedBody).sort()).toEqual(
      getJsonRequestFieldNames('/api/AffiliateLinks/sync', 'post')
    );
  });

  test('serializes homepage clear-cache using target_user_id', async () => {
    await homepageService.clearCache(' user-1 ');

    const expectedBody = { target_user_id: 'user-1' };
    expect(mockedAxiosClient.post).toHaveBeenCalledWith(
      '/api/Homepage/clear-cache',
      expectedBody
    );
    expect(Object.keys(expectedBody)).toEqual(
      getJsonRequestFieldNames('/api/Homepage/clear-cache', 'post')
    );
  });

  test('serializes profile updates without an unsupported phone field', async () => {
    mockedAxiosClient.put.mockResolvedValueOnce({
      data: {
        id: 'user-1',
        username: 'test-user',
        email: 'test@example.test',
        fullName: 'Người dùng thử',
      },
    });

    await userService.updateProfile({
      fullName: 'Người dùng thử',
      avatarUri: 'file:///data/user/0/app/avatar.png',
    });

    const [route, requestBody, config] = mockedAxiosClient.put.mock.calls.at(-1)!;
    const formData = requestBody as FormData & {
      _parts?: [string, unknown][];
    };
    const serializedFields: string[] = [];
    if (formData._parts) {
      serializedFields.push(...formData._parts.map(([field]) => field));
    } else {
      formData.forEach((_value, field) => serializedFields.push(field));
    }
    serializedFields.sort();
    const contractFields = getRequestFieldNames(
      '/api/Users/profile',
      'put',
      'application/x-www-form-urlencoded',
    );

    expect(route).toBe('/api/Users/profile');
    expect(serializedFields).toEqual(contractFields);
    expect(serializedFields).not.toContain('phone');
    expect(config).toMatchObject({
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});
