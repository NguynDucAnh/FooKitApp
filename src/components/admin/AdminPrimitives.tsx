import { ElementType } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants';
import Button from '../Button';

interface MetricProps {
  icon: ElementType;
  label: string;
  value: string;
}

export function AdminMetric({ icon: Icon, label, value }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Icon size={20} color={COLORS.primary} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function AdminStatusPill({ active }: { active: boolean }) {
  return (
    <View style={[styles.statusPill, active ? styles.statusActive : styles.statusInactive]}>
      <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextInactive]}>
        {active ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
}

interface PagerProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function AdminPager({ page, totalPages, onPrev, onNext }: PagerProps) {
  return (
    <View style={styles.pager}>
      <Button title="Trước" onPress={onPrev} disabled={page <= 1} outline style={styles.pagerButton} />
      <Text style={styles.pagerText}>{page}/{totalPages}</Text>
      <Button title="Sau" onPress={onNext} disabled={page >= totalPages} outline style={styles.pagerButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  metricLabel: {
    color: COLORS.textGray,
    fontSize: 12,
    marginTop: 3,
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusActive: {
    backgroundColor: COLORS.surface,
  },
  statusInactive: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  statusTextActive: {
    color: COLORS.primary,
  },
  statusTextInactive: {
    color: COLORS.error,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  pagerButton: {
    minWidth: 92,
  },
  pagerText: {
    color: COLORS.textGray,
    fontWeight: '800',
  },
});
