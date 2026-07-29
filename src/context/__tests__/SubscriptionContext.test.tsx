import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TestRenderer, { act } from 'react-test-renderer';
import { unmountWithAct } from '../../test-utils/reactTestRenderer';
import { useAuth } from '../../hooks/useAuth';
import { subscriptionService } from '../../services/subscriptionService';
import { MySubscription } from '../../types/subscription';
import {
  SubscriptionProvider,
  useSubscriptionStore,
} from '../SubscriptionContext';

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../services/subscriptionService', () => ({
  subscriptionService: {
    getMySubscription: jest.fn(),
  },
}));

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedGetMySubscription = subscriptionService.getMySubscription as jest.MockedFunction<
  typeof subscriptionService.getMySubscription
>;

type SubscriptionState = ReturnType<typeof useSubscriptionStore>;

let latestState: SubscriptionState | null = null;

function SubscriptionProbe() {
  const state = useSubscriptionStore();

  useEffect(() => {
    latestState = state;
  }, [state]);

  return null;
}

function setAuthSession(accessToken: string | null) {
  mockedUseAuth.mockReturnValue({
    accessToken,
    currentUser: null,
    isAuthenticated: !!accessToken,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    googleLogin: jest.fn(),
    logout: jest.fn(),
    setCredentials: jest.fn(),
    linkGoogle: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    updateLocalUser: jest.fn(),
  });
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

async function renderProvider() {
  let renderer: TestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = TestRenderer.create(
      <SubscriptionProvider>
        <SubscriptionProbe />
      </SubscriptionProvider>,
    );
    await Promise.resolve();
  });

  return renderer!;
}

describe('SubscriptionProvider session ownership', () => {
  beforeEach(() => {
    latestState = null;
  });

  it('does not request or expose subscription state without an authenticated session', async () => {
    setAuthSession(null);

    const renderer = await renderProvider();

    expect(mockedGetMySubscription).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('premiumStatus');
    expect(latestState).toMatchObject({
      subscription: null,
      isPremium: false,
      loading: false,
      error: null,
    });

    unmountWithAct(renderer);
  });

  it('loads the server-authoritative subscription for the active session', async () => {
    setAuthSession('session-a');
    mockedGetMySubscription.mockResolvedValue({
      isPremium: true,
      planName: 'Premium',
    });

    const renderer = await renderProvider();

    expect(mockedGetMySubscription).toHaveBeenCalledTimes(1);
    expect(latestState).toMatchObject({
      subscription: {
        isPremium: true,
        planName: 'Premium',
      },
      isPremium: true,
      loading: false,
      error: null,
    });

    unmountWithAct(renderer);
  });

  it('reuses one in-flight refresh for concurrent calls in the same session', async () => {
    const request = createDeferred<MySubscription>();
    setAuthSession('session-a');
    mockedGetMySubscription.mockReturnValue(request.promise);

    const renderer = await renderProvider();
    let firstRefresh!: Promise<void>;
    let secondRefresh!: Promise<void>;

    act(() => {
      firstRefresh = latestState!.refreshSubscription();
      secondRefresh = latestState!.refreshSubscription();
    });

    expect(firstRefresh).toBe(secondRefresh);
    expect(mockedGetMySubscription).toHaveBeenCalledTimes(1);

    await act(async () => {
      request.resolve({
        isPremium: true,
        planName: 'Premium',
      });
      await firstRefresh;
    });

    expect(latestState).toMatchObject({
      subscription: {
        isPremium: true,
        planName: 'Premium',
      },
      loading: false,
      error: null,
    });

    unmountWithAct(renderer);
  });

  it('releases the single-flight slot after a failed refresh', async () => {
    const firstRequest = createDeferred<MySubscription>();
    setAuthSession('session-a');
    mockedGetMySubscription
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce({
        isPremium: false,
        planName: 'Free',
      });

    const renderer = await renderProvider();
    let failedRefresh!: Promise<void>;

    act(() => {
      failedRefresh = latestState!.refreshSubscription();
    });

    await act(async () => {
      firstRequest.reject(new Error('network unavailable'));
      await failedRefresh;
    });

    expect(latestState).toMatchObject({
      loading: false,
      error: 'network unavailable',
    });

    await act(async () => {
      await latestState!.refreshSubscription();
    });

    expect(mockedGetMySubscription).toHaveBeenCalledTimes(2);
    expect(latestState).toMatchObject({
      subscription: {
        isPremium: false,
        planName: 'Free',
      },
      loading: false,
      error: null,
    });

    unmountWithAct(renderer);
  });

  it('starts a new authoritative refresh after a subscription mutation', async () => {
    const beforeMutation = createDeferred<MySubscription>();
    const afterMutation = createDeferred<MySubscription>();
    setAuthSession('session-a');
    mockedGetMySubscription
      .mockReturnValueOnce(beforeMutation.promise)
      .mockReturnValueOnce(afterMutation.promise);

    const renderer = await renderProvider();
    let forcedRefresh!: Promise<void>;

    await act(async () => {
      forcedRefresh = latestState!.refreshSubscription({ force: true });
      await Promise.resolve();
    });

    expect(mockedGetMySubscription).toHaveBeenCalledTimes(2);

    await act(async () => {
      beforeMutation.resolve({
        isPremium: true,
        planName: 'Old plan',
      });
      await beforeMutation.promise;
    });

    expect(latestState).toMatchObject({
      subscription: null,
      loading: true,
    });

    await act(async () => {
      afterMutation.resolve({
        isPremium: false,
        planName: 'Free',
      });
      await forcedRefresh;
    });

    expect(latestState).toMatchObject({
      subscription: {
        isPremium: false,
        planName: 'Free',
      },
      loading: false,
      error: null,
    });

    unmountWithAct(renderer);
  });

  it('ignores an older response after the authenticated session changes', async () => {
    const firstRequest = createDeferred<MySubscription>();
    const secondRequest = createDeferred<MySubscription>();
    setAuthSession('session-a');
    mockedGetMySubscription
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);

    const renderer = await renderProvider();

    setAuthSession('session-b');
    await act(async () => {
      renderer.update(
        <SubscriptionProvider>
          <SubscriptionProbe />
        </SubscriptionProvider>,
      );
      await Promise.resolve();
    });

    expect(latestState).toMatchObject({
      subscription: null,
      isPremium: false,
      loading: true,
    });

    await act(async () => {
      firstRequest.resolve({
        isPremium: true,
        planName: 'Premium',
      });
      await firstRequest.promise;
    });

    expect(latestState).toMatchObject({
      subscription: null,
      isPremium: false,
      loading: true,
    });

    await act(async () => {
      secondRequest.resolve({
        isPremium: false,
        planName: 'Free',
      });
      await secondRequest.promise;
    });

    expect(latestState).toMatchObject({
      subscription: {
        isPremium: false,
        planName: 'Free',
      },
      isPremium: false,
      loading: false,
      error: null,
    });

    unmountWithAct(renderer);
  });
});
