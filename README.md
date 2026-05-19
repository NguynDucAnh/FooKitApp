# FooKitApp

App thương mại điện tử đơn giản, xây dựng bằng **Expo + React Native + TypeScript**.

## Cách chạy

```bash
npm install
npx expo start
```
Bấm `a` để mở Android Emulator.

## Kết nối API

Sửa file `src/constants/index.ts`:
```ts
export const API_URL = 'https://your-api.com/api';
```
App tự dùng mock data nếu API chưa có.

## Cấu trúc

```
app/
  _layout.tsx            # Root layout (Redux Provider)
  index.tsx              # Tự redirect login/home
  (auth)/
    login.tsx            # Đăng nhập
    register.tsx         # Đăng ký
  (tabs)/
    home.tsx             # Danh sách sản phẩm
    cart.tsx             # Giỏ hàng & đặt hàng
    orders.tsx           # Lịch sử đơn hàng
    profile.tsx          # Tài khoản & đăng xuất
  product/
    [id].tsx             # Chi tiết sản phẩm

src/
  components/            # Button, Input, ProductCard
  constants/             # Màu sắc, API URL, mock data
  services/api.ts        # Axios client
  store/                 # Redux: auth + cart
  types/                 # TypeScript interfaces
```
