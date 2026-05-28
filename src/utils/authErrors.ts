import { AxiosError } from 'axios';

export function getAuthErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const status = axiosError.response?.status;
  const message = axiosError.response?.data?.message;

  if (message) return message;

  if (axiosError.response?.data?.errors) {
    return Object.values(axiosError.response.data.errors).flat().join('\n');
  }

  switch (status) {
    case 400:
      return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
    case 401:
      return 'Tài khoản hoặc mật khẩu không đúng.';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 409:
      return 'Thông tin đã tồn tại hoặc tài khoản đã được liên kết.';
    case 500:
      return 'Máy chủ đang gặp lỗi. Vui lòng thử lại sau.';
    default:
      return axiosError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }
}
