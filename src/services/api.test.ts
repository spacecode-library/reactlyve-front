import { adminApi } from './api'; // Assuming api is the default export from './api'
import { adminApi } from './api';
import api from './api'; // Import the default export axios instance, which adminApi uses

describe('adminApi.updateUserRole', () => {
  let putSpy: jest.SpyInstance;

  // We are testing adminApi.updateUserRole, which internally calls api.put.
  // We need to spy on api.put.

  beforeEach(() => {
    // Spy on the 'put' method of the imported 'api' (axios instance)
    // This instance is used by adminApi.
    putSpy = jest.spyOn(api, 'put').mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    // Restore the spy to its original state and clear mock history
    putSpy.mockRestore();
  });

  test('should call api.put with role and last_usage_reset_date when provided', async () => {
    const userId = 'test-user-1';
    const role = 'user';
    const lastUsageResetDate = '2023-01-01T00:00:00.000Z';

    await adminApi.updateUserRole(userId, role, lastUsageResetDate);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(
      `/admin/users/${userId}/role`,
      { role: role, last_usage_reset_date: lastUsageResetDate }
    );
  });

  test('should call api.put with only role when last_usage_reset_date is not provided', async () => {
    const userId = 'test-user-2';
    const role = 'admin';

    await adminApi.updateUserRole(userId, role); // No lastUsageResetDate

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(
      `/admin/users/${userId}/role`,
      { role: role } // last_usage_reset_date should be absent
    );
  });

  test('should call api.put with role and a valid ISO string for last_usage_reset_date when a dynamic date is provided', async () => {
    const userId = 'guest-to-user-id';
    const role = 'user';
    const dynamicISODate = new Date().toISOString();

    await adminApi.updateUserRole(userId, role, dynamicISODate);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(
      `/admin/users/${userId}/role`,
      {
        role: role,
        last_usage_reset_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      }
    );
  });

  test('should not include last_usage_reset_date in payload if it is undefined', async () => {
    const userId = 'test-user-3';
    const role = 'user';

    // Explicitly pass undefined, which is the default if the param is omitted
    await adminApi.updateUserRole(userId, role, undefined);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(
      `/admin/users/${userId}/role`,
      { role: role } // last_usage_reset_date should be absent
    );
  });
});
