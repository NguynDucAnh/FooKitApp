# AGENT_CONTEXT.md — FooKitApp
> Đọc file này trước khi làm bất kỳ việc gì trong project.  
> Đây là nguồn sự thật duy nhất (single source of truth) về cấu trúc, quy tắc và cách hoạt động của project.

---

## 1. Tổng Quan Project

| Thuộc tính | Giá trị |
|------------|---------|
| Tên app | FooKitApp |
| Loại | Mobile App — Thương mại thực phẩm (FoodTech) |
| Framework | Expo SDK 52 + Expo Router 4 (file-based routing) |
| Ngôn ngữ | TypeScript (TSX) — **bắt buộc**, không dùng JS thuần |
| State | Redux Toolkit |
| HTTP | Axios + expo-secure-store (token) |
| Backend | REST API — repo: `https://github.com/Truong-LS/FooKit` |
| API base URL | `process.env.EXPO_PUBLIC_API_URL` (mặc định `http://10.0.2.2:8080`) |
| Môi trường | Android Emulator (`10.0.2.2` = localhost máy thật) |

---

## 2. Cấu Trúc Thư Mục

```
FooKitApp2/
├── app/                          # Expo Router — mỗi file = 1 route
│   ├── _layout.tsx               # Root layout: bọc Redux Provider + StatusBar
│   ├── index.tsx                 # Redirect: có token → /(tabs)/home, không → /(auth)/login
│   ├── (auth)/
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx             # Màn hình đăng nhập
│   │   └── register.tsx          # Màn hình đăng ký
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab navigator (4 tabs)
│   │   ├── home.tsx              # Tab 1: Thực đơn hôm nay (Skill 1)
│   │   ├── suggestion.tsx        # Tab 2: Gợi ý món ăn AI (Skill 2)
│   │   ├── cart.tsx              # Tab 3: Giỏ hàng
│   │   ├── orders.tsx            # Tab 4: Đơn hàng
│   │   └── profile.tsx           # Tab 5: Tài khoản
│   └── product/
│       └── [id].tsx              # Chi tiết sản phẩm (dynamic route)
│
├── src/
│   ├── types/
│   │   ├── index.ts              # User, Product, CartItem, Order
│   │   └── food.ts               # HomepageResponse, SuggestDishesPayload, Dish, Ingredient, AffiliateProduct
│   ├── services/
│   │   ├── api.ts                # Axios instance chung (auth, cart, orders)
│   │   └── foodApi.ts            # Axios instance cho Food endpoints (dùng expo-secure-store)
│   ├── store/
│   │   ├── index.ts              # configureStore + useAppDispatch + useAppSelector
│   │   └── slices/
│   │       ├── authSlice.ts      # login, register, logout
│   │       ├── cartSlice.ts      # addItem, removeItem, changeQty, clearCart
│   │       ├── homepageSlice.ts  # loadHomepage (Skill 1)
│   │       └── suggestionSlice.ts # requestSuggestion (Skill 2)
│   ├── components/
│   │   ├── Button.tsx            # Props: title, onPress, loading, disabled, outline, style
│   │   ├── Input.tsx             # Props: label, error, + tất cả TextInputProps
│   │   └── ProductCard.tsx       # Props: product, onPress, onAddToCart
│   └── constants/
│       ├── index.ts              # API_URL, COLORS, STORAGE_KEYS
│       └── mockData.ts           # MOCK_PRODUCTS[] dùng khi chưa có API
│
├── .env                          # EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
├── app.json                      # Expo config: name=FooKitApp, scheme=fookitapp
├── tsconfig.json                 # strict: true, extends expo/tsconfig.base
└── babel.config.js               # babel-preset-expo
```

---

## 3. Redux Store

```typescript
// src/store/index.ts
{
  auth:       authReducer,       // { user, token, loading, error }
  cart:       cartReducer,       // { items: CartItem[] }
  homepage:   homepageReducer,   // { data: HomepageData, loading, error }
  suggestion: suggestionReducer, // { dishes: Dish[], loading, error, errorCode }
}
```

### Cách dùng trong component:
```typescript
const dispatch = useAppDispatch();
const data = useAppSelector(s => s.homepage.data);
```

---

## 4. TypeScript Types Quan Trọng

### Từ `src/types/food.ts`:
```typescript
interface AffiliateProduct { productId, productName, productUrl, price, platform }
interface Ingredient { rawEnglishName, standardIngredientName, isMapped, affiliateProduct: AffiliateProduct | null }
interface Dish { dishName, imageUrl, instructions, totalCost, ingredients: Ingredient[] }
interface HomepageData { isPremiumExpired: boolean, breakfast: Dish[], lunch: Dish[], dinner: Dish[] }
interface HomepageResponse { success: boolean, message: string, data: HomepageData }
enum DietType { Vegan = 1, Keto = 2 }
interface SuggestDishesPayload { equipment: string, diet: DietType, budget: number }
interface SuggestDishesResponse { success, message, data: { suggestedDishes: Dish[] } }
```

### Từ `src/types/index.ts`:
```typescript
interface User { id, name, email }
interface Product { id, name, price, image, description, stock }
interface CartItem { product: Product, quantity: number }
interface Order { id, total, status: 'pending'|'confirmed'|'shipping'|'delivered'|'cancelled', createdAt }
```

---

## 5. API Endpoints

### Authentication
| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/login` | `{ email, password }` | Đăng nhập → trả về `{ token, user }` |
| POST | `/auth/register` | `{ name, email, password }` | Đăng ký |

### Food (dùng `foodApi.ts` — token từ expo-secure-store)
| Method | Endpoint | Body/Params | Mô tả |
|--------|----------|-------------|-------|
| GET | `/api/Homepage/suggestions` | — | Thực đơn hôm nay (Skill 1) |
| POST | `/api/Dishes/suggest` | `SuggestDishesPayload` | Gợi ý AI (Skill 2) |

### Shop
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/products` | Danh sách sản phẩm |
| GET | `/products/:id` | Chi tiết sản phẩm |
| POST | `/orders` | Tạo đơn hàng |
| GET | `/orders/me` | Đơn hàng của tôi |

### Authentication Header:
```
Authorization: Bearer <token>
```
Token lưu tại: `expo-secure-store` key `"token"` (foodApi) hoặc `AsyncStorage` key `"token"` (api.ts)

---

## 6. Quy Tắc Xử Lý Lỗi (Error Handling)

| HTTP Status | Hành động UI |
|-------------|--------------|
| 401 | `router.replace('/(auth)/login')` — redirect về login |
| 403 | Hiện Modal "Nâng cấp Premium" |
| 500 | `Alert.alert('Hệ thống quá tải', '...')` |
| Network error | Hiện nút "Thử lại" + retry action |

### Pattern chuẩn trong Redux slice:
```typescript
} catch (e: unknown) {
  const err = e as { response?: { status?: number; data?: { message?: string } } };
  const status = err.response?.status ?? 500;
  return rejectWithValue({ message: '...', code: status });
}
```

---

## 7. Màu Sắc (COLORS)

```typescript
// src/constants/index.ts
primary:    '#6C63FF'   // Tím — màu chính của app
background: '#FFFFFF'
surface:    '#F5F5F5'
text:       '#212121'
textGray:   '#757575'
border:     '#E0E0E0'
error:      '#F44336'
white:      '#FFFFFF'
shopee:     '#EE4D2D'   // Màu cam Shopee (dùng cho affiliate tag)
```

---

## 8. Quy Tắc Viết Code

### ✅ LUÔN làm:
- Dùng `SafeAreaView` từ `react-native-safe-area-context` (không phải từ `react-native`)
- Import `useAppDispatch`, `useAppSelector` từ `../../src/store` (không từ `react-redux` trực tiếp)
- Dùng `router.replace()` để redirect (không push) khi chuyển giữa auth ↔ app
- Xử lý 3 trạng thái: `loading`, `error`, `data` cho mọi API call
- Dùng `Linking.openURL()` để mở link Affiliate (Shopee)
- Validate form trước khi gọi API (`budget > 0`, field không rỗng)

### ❌ KHÔNG làm:
- Không dùng `@/` path alias — dùng relative path (`../../src/...`)
- Không import trực tiếp từ `react-redux` — luôn qua `src/store`
- Không hardcode URL API — luôn dùng `process.env.EXPO_PUBLIC_API_URL`
- Không dùng `StyleSheet` inline style — luôn khai báo `const styles = StyleSheet.create({...})`
- Không bỏ qua lỗi 401/403 — luôn xử lý đúng case

---

## 9. Skill 1 — Tải Thực Đơn Trang Chủ

**File:** `app/(tabs)/home.tsx` → dùng `src/screens/HomeScreen.tsx`  
**Trigger:** `useEffect` khi component mount  
**Luồng:**
1. Dispatch `loadHomepage()` 
2. Gọi `GET /api/Homepage/suggestions` kèm Bearer Token
3. Nếu `isPremiumExpired === true` → hiện Banner vàng nhắc gia hạn
4. Render 3 FlatList ngang: Bữa sáng 🌅 / Bữa trưa ☀️ / Bữa tối 🌙
5. Mỗi card hiện: ảnh món, tên, tổng chi phí

---

## 10. Skill 2 — Gợi Ý Món Ăn Theo Yêu Cầu

**File:** `app/(tabs)/suggestion.tsx` → dùng `src/screens/SuggestionScreen.tsx`  
**Trigger:** Nút "Gợi ý cho tôi" sau khi user điền form  
**Luồng:**
1. Validate: `equipment` không rỗng, `budget > 0`
2. Dispatch `requestSuggestion({ equipment, diet, budget })`
3. Gọi `POST /api/Dishes/suggest`
4. Xử lý response:
   - `200` → Render danh sách món, mỗi nguyên liệu có thể click mở Shopee
   - `401` → Redirect login
   - `403` → Modal "Nâng cấp Premium"
   - `500` → Alert "Hệ thống quá tải"
5. Click nguyên liệu có Affiliate → `Linking.openURL(affiliateProduct.productUrl)`

---

## 11. Cách Thêm Feature Mới

Khi cần thêm một tính năng mới, làm theo thứ tự:

```
1. Thêm interface vào src/types/         (nếu có type mới)
2. Thêm API call vào src/services/       (foodApi.ts hoặc api.ts)
3. Tạo slice mới trong src/store/slices/ (nếu cần Redux state)
4. Đăng ký slice vào src/store/index.ts  (thêm vào reducer)
5. Tạo màn hình trong app/(tabs)/        hoặc app/[feature]/
6. Xử lý đủ 3 trạng thái: loading / error / success
```

---

## 12. Cài Đặt & Chạy

```bash
npm install
npx expo install expo-secure-store   # nếu chưa cài
npx expo start --android
```

### Biến môi trường (`.env`):
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

> `10.0.2.2` là địa chỉ đặc biệt để Android Emulator kết nối vào localhost máy thật.

---

## 13. Git Workflow

| Branch | Mục đích |
|--------|---------|
| `develop` | Branch làm việc chính, mọi feature merge vào đây |
| `deploy` | Production, chỉ merge từ develop khi release |
| `feature/ten-tinh-nang` | Branch cho từng tính năng mới |

```bash
# Bắt đầu feature mới
git checkout develop && git pull origin develop
git checkout -b feature/ten-tinh-nang

# Sau khi code xong
git add . && git commit -m "feat: mô tả tính năng"
git push origin feature/ten-tinh-nang
# → Tạo Pull Request trên GitHub: feature/... → develop
```

### Commit convention:
```
feat:     Tính năng mới
fix:      Sửa lỗi
chore:    Config, dependency
refactor: Tái cấu trúc code
style:    Chỉnh UI/style
```
