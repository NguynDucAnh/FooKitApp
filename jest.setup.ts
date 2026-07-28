jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn(async () => true),
  createURL: jest.fn((path = '') => `fookitapp://${path}`),
  openURL: jest.fn(async () => true),
}));

jest.mock('expo-web-browser', () => ({
  coolDownAsync: jest.fn(async () => undefined),
  dismissBrowser: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
  warmUpAsync: jest.fn(async () => undefined),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
