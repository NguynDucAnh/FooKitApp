# FooKitApp

FooKitApp là ứng dụng di động **gợi ý món ăn theo ngân sách, chế độ ăn và thiết bị nấu**. Ứng dụng giúp người dùng khám phá món phù hợp cho từng bữa, xem công thức, lưu món yêu thích và nâng cấp gói Premium để sử dụng các tùy chọn nâng cao.

Ứng dụng được xây dựng bằng Expo, React Native và TypeScript; backend hiện được triển khai trên Azure App Service.

## Tính năng chính

- Đăng ký, đăng nhập bằng tài khoản nội bộ hoặc Google.
- Gợi ý món cho bữa sáng, bữa trưa và bữa tối.
- Tìm món theo ngân sách (VND), chế độ ăn và thiết bị nấu.
- Xem công thức cùng danh sách nguyên liệu của từng món.
- Lưu và quản lý món ăn yêu thích trên thiết bị.
- Hiển thị liên kết mua nguyên liệu qua affiliate khi dữ liệu món có hỗ trợ.
- Quản lý hồ sơ cá nhân, ảnh đại diện, mật khẩu và liên kết tài khoản Google.
- Đăng ký gói Premium và thanh toán qua PayOS.
- Trang quản trị dành cho admin: người dùng, gói dịch vụ, affiliate link và mức sử dụng API.

> Tab **Kế hoạch bữa ăn** hiện mới là màn hình placeholder, chưa có luồng nghiệp vụ hoàn chỉnh.

## Công nghệ và kiến trúc

| Thành phần | Công nghệ |
|---|---|
| Mobile framework | Expo 52, React Native 0.76, React 18, TypeScript |
| Điều hướng | Expo Router 4 |
| Quản lý state | React Context API |
| Gọi API | Axios |
| Lưu trữ cục bộ | AsyncStorage |
| Xác thực | JWT, refresh token, Google OAuth |
| Backend | ASP.NET Core / .NET Identity |
| Thanh toán | PayOS |
| Hosting API | Azure App Service |

Ứng dụng không sử dụng Redux. State dùng chung được quản lý bởi:

- `AuthContext`: phiên đăng nhập và thông tin người dùng.
- `SubscriptionContext`: trạng thái gói dịch vụ và Premium.
- `FavoritesContext`: danh sách món yêu thích.

`src/services/axiosClient.ts` là HTTP client dùng chung. Client tự gắn access token vào request, thử refresh token khi nhận `401`, và đưa người dùng về màn hình đăng nhập nếu không thể làm mới phiên.

## Luồng chính

1. Khi khởi động, app khôi phục phiên đăng nhập từ AsyncStorage.
2. Người chưa đăng nhập được chuyển tới màn hình đăng nhập; người đã đăng nhập được chuyển tới trang chủ.
3. Trang chủ lấy gợi ý cho ba bữa qua các API Homepage.
4. Người dùng có thể yêu cầu gợi ý chi tiết theo ngân sách, chế độ ăn và thiết bị nấu.
5. Khi chọn một món, app tải công thức đầy đủ từ backend.
6. Các chế độ ăn nâng cao yêu cầu gói Premium.
7. Thanh toán Premium mở trang PayOS và quay lại app bằng deep link `fookitapp://` để xác minh kết quả.

## Cấu trúc thư mục

```text
app/
  _layout.tsx                 # Auth, Subscription và Favorites providers
  index.tsx                   # Điều hướng theo trạng thái đăng nhập
  (auth)/
    login.tsx                 # Đăng nhập nội bộ và Google
    register.tsx              # Đăng ký tài khoản
    set-credentials.tsx       # Bổ sung thông tin cho tài khoản Google
  (tabs)/
    _layout.tsx               # AuthGuard cho khu vực đã đăng nhập
    home.tsx                  # Home, gói cước, yêu thích và planner
    profile.tsx               # Hồ sơ và thiết lập tài khoản
    admin.tsx                 # Dashboard quản trị
  payment/
    result.tsx                # Xác minh kết quả thanh toán PayOS
  expo-auth-session.tsx       # Nhận redirect từ Google OAuth

src/
  components/                 # UI và các màn hình thành phần
  context/                    # Auth, Subscription, Favorites contexts
  hooks/                      # Hooks cho auth, gói cước và thanh toán
  mappers/                    # Chuyển response API thành model UI
  services/                   # Axios client và các API service
  types/                      # Kiểu dữ liệu TypeScript
  utils/                      # JWT, token storage và xử lý lỗi auth
  constants/                  # API URL, OAuth config và theme
```

## Cài đặt và chạy

Yêu cầu:

- Node.js và npm.
- Expo CLI thông qua `npx`.
- Android Studio/Android Emulator, thiết bị thật có Expo Go, hoặc môi trường iOS phù hợp.

```bash
npm install
npx expo start
```

Trong Expo CLI:

- Nhấn `a` để mở Android.
- Quét QR bằng Expo Go để chạy trên thiết bị thật.

Các script có sẵn:

```bash
npm start
npm run android
npm run ios
```

## Cấu hình API và OAuth

Cấu hình frontend hiện nằm trong `src/constants/index.ts`:

```ts
export const API_URL = 'https://fookit-be-gpfhhchcceeyhah3.southeastasia-01.azurewebsites.net';
export const GOOGLE_WEB_CLIENT_ID = 'your-public-client-id';
export const GOOGLE_REDIRECT_URI = 'your-google-redirect-uri';
```

`API_URL` là địa chỉ gốc production của backend và không chứa `/api`; các service tự nối thêm
route `/api/...`. Không thêm dấu `/` ở cuối domain để tránh tạo URL có `//`.

Google Client ID là định danh public phía client, nhưng không được đưa Google Client Secret, JWT secret, database connection string hoặc API key của backend vào mã nguồn mobile.

Scheme deep link của app được khai báo là `fookitapp` trong `app.json`. Nếu đổi scheme, package name hoặc OAuth redirect URI, cần cập nhật đồng bộ cấu hình Google OAuth, PayOS callback và backend.

## API service chính

- `homepageService`: gợi ý món theo từng bữa.
- `dishService`: gợi ý món theo tiêu chí và lấy công thức.
- `authService`, `googleAuth`: đăng nhập, đăng ký và Google OAuth.
- `userService`: thông tin và hồ sơ người dùng.
- `subscriptionService`: gói dịch vụ và trạng thái Premium.
- `paymentService`: tạo và xác minh thanh toán PayOS.
- `adminService`: chức năng quản trị.

Backend có một số response chưa đồng nhất về cách đặt tên field. Vì vậy các service chuẩn hóa response và hỗ trợ nhiều biến thể casing trước khi trả dữ liệu cho UI.

## Lịch sử chuyển đổi domain

Dự án từng có các màn hình e-commerce như giỏ hàng, đơn hàng và sản phẩm. Những route, mock data
và component cũ này đã được loại bỏ; source hiện chỉ tập trung vào domain gợi ý món ăn.

## Bảo mật

- Không commit file `.env`, token hoặc secret.
- Không hardcode secret backend trong `src/constants/index.ts`.
- Nếu một secret từng xuất hiện trong Git hoặc trong file được chia sẻ ra ngoài, hãy rotate secret đó; chỉ xóa file là chưa đủ.
- Phân quyền admin ở UI chỉ giúp ẩn giao diện. Backend vẫn phải kiểm tra quyền trên mọi endpoint quản trị.
