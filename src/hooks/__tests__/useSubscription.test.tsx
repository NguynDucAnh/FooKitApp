import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useSubscriptionStore } from '../../context/SubscriptionContext';
import { subscriptionService } from '../../services/subscriptionService';
import { useSubscription } from '../useSubscription';

jest.mock('../../context/SubscriptionContext', () => ({
  useSubscriptionStore: jest.fn(),
}));

jest.mock('../../services/subscriptionService', () => ({
  subscriptionService: {
    cancelSubscription: jest.fn(),
  },
}));

const mockedUseSubscriptionStore = useSubscriptionStore as jest.MockedFunction<
  typeof useSubscriptionStore
>;
const mockedCancelSubscription = subscriptionService.cancelSubscription as jest.MockedFunction<
  typeof subscriptionService.cancelSubscription
>;

type SubscriptionController = ReturnType<typeof useSubscription>;

function HookHarness({ onRender }: { onRender: (controller: SubscriptionController) => void }) {
  onRender(useSubscription());
  return null;
}

describe('useSubscription', () => {
  it('forces a server-authoritative refresh after cancellation succeeds', async () => {
    const refreshSubscription = jest.fn().mockResolvedValue(undefined);
    mockedCancelSubscription.mockResolvedValue({ data: null });
    mockedUseSubscriptionStore.mockReturnValue({
      subscription: null,
      isPremium: false,
      loading: false,
      error: null,
      refreshSubscription,
      setSubscription: jest.fn(),
    });
    let controller!: SubscriptionController;
    const renderer = TestRenderer.create(
      <HookHarness onRender={value => {
        controller = value;
      }} />,
    );

    await act(async () => {
      await controller.cancelSubscription();
    });

    expect(mockedCancelSubscription).toHaveBeenCalledTimes(1);
    expect(refreshSubscription).toHaveBeenCalledWith({ force: true });
    expect(mockedCancelSubscription.mock.invocationCallOrder[0]).toBeLessThan(
      refreshSubscription.mock.invocationCallOrder[0],
    );

    renderer.unmount();
  });
});
