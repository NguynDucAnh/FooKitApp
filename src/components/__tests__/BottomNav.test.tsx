import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { BottomNav } from '../BottomNav';

describe('BottomNav accessibility', () => {
  it('exposes every destination as a tab and announces the selected tab', () => {
    const onTabChange = jest.fn();
    const renderer = TestRenderer.create(
      <BottomNav activeTab="favorites" onTabChange={onTabChange} />,
    );
    const tabs = renderer.root.findAllByType(Pressable);
    const favoritesTab = tabs.find(
      tab => tab.props.accessibilityLabel === 'Yêu thích',
    );
    const subscriptionTab = tabs.find(
      tab => tab.props.accessibilityLabel === 'Gói cước',
    );

    expect(tabs).toHaveLength(5);
    expect(tabs.every(tab => tab.props.accessibilityRole === 'tab')).toBe(true);
    expect(favoritesTab?.props.accessibilityState).toEqual({ selected: true });
    expect(subscriptionTab?.props.accessibilityState).toEqual({ selected: false });

    act(() => {
      subscriptionTab?.props.onPress();
    });

    expect(onTabChange).toHaveBeenCalledWith('discover');
    renderer.unmount();
  });

  it('keeps every tab touch target at least 44 points tall', () => {
    const renderer = TestRenderer.create(
      <BottomNav activeTab="home" onTabChange={jest.fn()} />,
    );

    renderer.root.findAllByType(Pressable).forEach(tab => {
      expect(StyleSheet.flatten(tab.props.style).minHeight).toBeGreaterThanOrEqual(44);
    });

    renderer.unmount();
  });
});
