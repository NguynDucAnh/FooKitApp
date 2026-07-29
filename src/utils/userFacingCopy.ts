export const RECIPE_DETAIL_COPY = {
  missingReference: 'Chưa thể tải công thức đầy đủ cho món này. Hãy tải lại danh sách gợi ý rồi thử lại.',
  notFound: 'Công thức này không còn khả dụng. Hãy tải lại danh sách gợi ý để chọn món khác.',
  expiredSession: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tải công thức.',
  unavailable: 'Chưa thể tải công thức chi tiết. Dữ liệu gợi ý ban đầu vẫn đang được hiển thị.',
} as const;

export const ADMIN_COPY = {
  missingUserTitle: 'Thiếu thông tin tài khoản',
  missingUserMessage: 'Không thể xác định tài khoản này. Hãy tải lại danh sách rồi thử lại.',
  missingPlanTitle: 'Thiếu thông tin gói cước',
  missingPlanMessage: 'Không thể xác định gói cước này. Hãy tải lại danh sách rồi thử lại.',
  missingAffiliateTitle: 'Thiếu thông tin liên kết',
  missingAffiliateMessage: 'Không thể xác định liên kết tiếp thị này. Hãy tải lại danh sách rồi thử lại.',
} as const;

export function getGrantPremiumNotFoundMessage(accountLabel: string) {
  return `Không tìm thấy tài khoản ${accountLabel}. Hãy tải lại danh sách người dùng rồi thử lại.`;
}

export function getBanMismatchTitle(nextIsActive: boolean) {
  return nextIsActive ? 'Chưa thể bỏ cấm tài khoản' : 'Chưa thể cấm tài khoản';
}

export function getBanMismatchMessage(accountLabel: string) {
  return `Trạng thái của ${accountLabel} chưa được cập nhật. Hãy tải lại danh sách rồi thử lại.`;
}
