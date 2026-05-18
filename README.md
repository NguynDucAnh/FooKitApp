# MyMobileApp

A production-ready React Native mobile application with a clean, scalable architecture.

## 📱 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native 0.73 |
| Language | TypeScript |
| Navigation | React Navigation 6 |
| State | Redux Toolkit + Redux Persist |
| HTTP | Axios |
| Forms | React Hook Form + Zod |
| i18n | i18next |
| Testing | Jest + React Testing Library |
| CI/CD | GitHub Actions |

## 🏗️ Project Structure

```
MyMobileApp/
├── src/
│   ├── assets/          # Fonts, images, icons, animations
│   ├── components/
│   │   ├── common/      # Button, Input, etc.
│   │   ├── layout/      # Header, Footer, Container
│   │   ├── forms/       # Form-specific components
│   │   └── feedback/    # Toast, Modal, Loading
│   ├── screens/
│   │   ├── Auth/        # Login, Register, ForgotPassword
│   │   ├── Home/
│   │   ├── Profile/
│   │   ├── Settings/
│   │   └── Onboarding/
│   ├── navigation/      # Root, Auth, Main navigators
│   ├── store/           # Redux store, slices, middleware
│   ├── hooks/           # Custom React hooks
│   ├── services/
│   │   ├── api/         # Axios client + API modules
│   │   └── storage/     # AsyncStorage service
│   ├── utils/           # Helpers, formatters, validators
│   ├── types/           # TypeScript types & interfaces
│   ├── constants/       # App-wide constants
│   ├── i18n/            # Translations (EN, VI)
│   ├── theme/           # Colors, typography, spacing
│   └── config/          # Environment config
├── __tests__/           # Unit, integration, e2e tests
├── .github/
│   ├── workflows/       # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE/
└── docs/
```

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `develop` | Active development, feature branches merge here |
| `deploy` | Production-ready code, triggers release builds |

### Workflow
```
feature/your-feature → develop → deploy
```

## 👥 Team

This project is set up for a team of 3 members. Suggested roles:
- **Member 1**: Feature development & UI
- **Member 2**: Backend integration & API services
- **Member 3**: Testing, CI/CD & DevOps

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Ruby >= 3 (iOS)
- Xcode (iOS)
- Android Studio (Android)
- CocoaPods (iOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/MyMobileApp.git
cd MyMobileApp

# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..

# Copy environment file
cp .env.example .env
```

### Running

```bash
# Start Metro bundler
npm start

# iOS
npm run ios

# Android
npm run android
```

### Testing

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run type-check    # TypeScript check
npm run lint          # ESLint
```

## 🔧 Environment Setup

Copy `.env.example` to `.env` and configure:

```env
API_BASE_URL=https://api.example.com/v1
APP_ENV=development
```

## 📦 Building for Production

### Android
```bash
cd android && ./gradlew assembleRelease
```

### iOS
Open Xcode → Product → Archive

## 🔄 CI/CD

- **Push to `develop`**: Runs lint, type-check, and tests
- **Push to `deploy`**: Runs full CI + Android build
- **Tag `v*`**: Creates a GitHub Release

## 📝 Contributing

1. Create a feature branch from `develop`: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "feat: add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Open a PR to `develop`
5. After review & merge to `develop`, create PR from `develop` → `deploy` for releases

### Commit Convention
```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting, missing semi-colons
refactor: Code change that's not a fix or feature
test:     Adding or updating tests
chore:    Build process or auxiliary tools
```
