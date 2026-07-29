import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import Button from '../Button';
import { BudgetSelector } from '../BudgetSelector';
import { CategoryChip } from '../CategoryChip';
import { TimeFilter } from '../TimeFilter';
import { ToolSelector } from '../ToolSelector';

describe('shared control accessibility', () => {
  it('announces button loading and disabled state', () => {
    const renderer = TestRenderer.create(
      <Button title="Lưu thay đổi" onPress={jest.fn()} loading />,
    );
    const button = renderer.root.findByType(TouchableOpacity);

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Lưu thay đổi');
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(StyleSheet.flatten(button.props.style).minHeight).toBeGreaterThanOrEqual(44);

    renderer.unmount();
  });

  it('announces selected budget and preserves its action', () => {
    const onSelect = jest.fn();
    const renderer = TestRenderer.create(
      <BudgetSelector
        options={[
          { label: 'Dưới 50.000đ', value: 50000 },
          { label: 'Dưới 100.000đ', value: 100000 },
        ]}
        selectedBudget={50000}
        onSelect={onSelect}
      />,
    );
    const options = renderer.root.findAllByType(Pressable);

    expect(options[0].props.accessibilityState).toEqual({ selected: true });
    expect(options[1].props.accessibilityState).toEqual({ selected: false });

    act(() => {
      options[1].props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith(100000);
    renderer.unmount();
  });

  it('announces category and time selection with 44-point targets', () => {
    const categoryRenderer = TestRenderer.create(
      <CategoryChip label="Món chay" isActive onClick={jest.fn()} />,
    );
    const timeRenderer = TestRenderer.create(
      <TimeFilter
        filters={[{ label: 'Dưới 30 phút', value: 30 }]}
        selectedTime={30}
        onSelect={jest.fn()}
      />,
    );
    const controls = [
      categoryRenderer.root.findByType(Pressable),
      timeRenderer.root.findByType(Pressable),
    ];

    controls.forEach(control => {
      expect(control.props.accessibilityRole).toBe('button');
      expect(control.props.accessibilityState).toEqual({ selected: true });
      expect(StyleSheet.flatten(control.props.style).minHeight).toBeGreaterThanOrEqual(44);
    });

    categoryRenderer.unmount();
    timeRenderer.unmount();
  });

  it('exposes multi-select tools as checked checkboxes', () => {
    const renderer = TestRenderer.create(
      <ToolSelector
        tools={[
          { name: 'Nồi chiên', icon: '🍳' },
          { name: 'Lò nướng', icon: '♨️' },
        ]}
        selectedTools={['Nồi chiên']}
        onToggle={jest.fn()}
      />,
    );
    const tools = renderer.root.findAllByType(Pressable);

    expect(tools[0].props.accessibilityRole).toBe('checkbox');
    expect(tools[0].props.accessibilityState).toEqual({ checked: true });
    expect(tools[1].props.accessibilityState).toEqual({ checked: false });
    expect(StyleSheet.flatten(tools[0].props.style).minHeight).toBeGreaterThanOrEqual(44);

    renderer.unmount();
  });
});
