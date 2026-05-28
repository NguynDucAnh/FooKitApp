import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function LoadingSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.line, styles.long]} />
      <View style={[styles.line, styles.medium]} />
      <View style={[styles.block]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  line: {
    height: 14,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  long: {
    width: '76%',
  },
  medium: {
    width: '48%',
  },
  block: {
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
});
