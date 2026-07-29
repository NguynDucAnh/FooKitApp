import {
  ADMIN_COPY,
  RECIPE_DETAIL_COPY,
  getBanMismatchMessage,
  getBanMismatchTitle,
  getGrantPremiumNotFoundMessage,
} from '../userFacingCopy';

const INTERNAL_TERMS = /\b(?:API|BE|backend|dishCacheId|cache|userId|plan_id|Active|Inactive|affiliate|username|worker|diet)\b/i;

describe('user-facing copy', () => {
  it('keeps recipe detail messages free of internal implementation terms', () => {
    expect(Object.values(RECIPE_DETAIL_COPY)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('tải lại danh sách gợi ý'),
        expect.stringContaining('đăng nhập lại'),
      ])
    );

    Object.values(RECIPE_DETAIL_COPY).forEach(message => {
      expect(message).not.toMatch(INTERNAL_TERMS);
    });
  });

  it('keeps admin recovery messages actionable and free of internal terms', () => {
    const messages = [
      ...Object.values(ADMIN_COPY),
      getGrantPremiumNotFoundMessage('người dùng thử nghiệm'),
      getBanMismatchTitle(true),
      getBanMismatchTitle(false),
      getBanMismatchMessage('người dùng thử nghiệm'),
    ];

    messages.forEach(message => {
      expect(message).not.toMatch(INTERNAL_TERMS);
    });
    expect(messages.filter(message => message.includes('Hãy tải lại')).length).toBeGreaterThanOrEqual(4);
  });
});
