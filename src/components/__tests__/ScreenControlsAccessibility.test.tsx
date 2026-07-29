import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { router } from 'expo-router';
import PaymentResultScreen from '../../../app/payment/result';
import CancelSubscriptionModal from '../subscription/CancelSubscriptionModal';
import PaymentHistoryTable from '../subscription/PaymentHistoryTable';

describe('screen control accessibility', () => {
  it('announces the cancel-subscription modal secondary action state', () => {
    const renderer = TestRenderer.create(
      <CancelSubscriptionModal
        visible
        loading
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    const keepPlanButton = renderer.root.findAllByType(TouchableOpacity).find(
      node => node.props.accessibilityLabel === 'Giữ gói hiện tại',
    );

    expect(keepPlanButton).toBeDefined();
    expect(keepPlanButton?.props.accessibilityRole).toBe('button');
    expect(keepPlanButton?.props.accessibilityState).toEqual({ disabled: true });
    expect(StyleSheet.flatten(keepPlanButton?.props.style).minHeight).toBeGreaterThanOrEqual(44);

    renderer.unmount();
  });

  it('exposes payment history retry and selected sort controls', () => {
    const retryRenderer = TestRenderer.create(
      <PaymentHistoryTable
        items={[]}
        loading={false}
        error="Không thể tải lịch sử thanh toán."
        sortKey="date"
        onSortChange={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    const retryButton = retryRenderer.root.findByProps({
      accessibilityLabel: 'Thử tải lại lịch sử thanh toán',
    });

    expect(retryButton.props.accessibilityRole).toBe('button');
    expect(StyleSheet.flatten(retryButton.props.style).minHeight).toBeGreaterThanOrEqual(44);
    retryRenderer.unmount();

    const sortRenderer = TestRenderer.create(
      <PaymentHistoryTable
        items={[]}
        loading={false}
        error={null}
        sortKey="amount"
        onSortChange={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    const sortButtons = sortRenderer.root.findAllByType(TouchableOpacity);
    const amountSort = sortButtons.find(
      node => node.props.accessibilityLabel === 'Sắp xếp theo số tiền',
    );

    expect(sortButtons).toHaveLength(3);
    expect(amountSort?.props.accessibilityState).toEqual({ selected: true });
    expect(StyleSheet.flatten(amountSort?.props.style).minHeight).toBeGreaterThanOrEqual(44);
    sortRenderer.unmount();
  });

  it('announces payment result updates and preserves navigation', () => {
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<PaymentResultScreen />);
    });

    const message = renderer.root.findAllByType(Text).find(
      node => node.props.accessibilityLiveRegion === 'polite',
    );
    const premiumButton = renderer.root.findByType(Pressable);

    expect(message).toBeDefined();
    expect(premiumButton.props.accessibilityRole).toBe('button');
    expect(premiumButton.props.accessibilityLabel).toBe('Về gói Premium');
    expect(StyleSheet.flatten(premiumButton.props.style).minHeight).toBeGreaterThanOrEqual(44);

    act(() => {
      premiumButton.props.onPress();
    });

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/(tabs)/home',
      params: { tab: 'discover' },
    });
    renderer.unmount();
  });
});
