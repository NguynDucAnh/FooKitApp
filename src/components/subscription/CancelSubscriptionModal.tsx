import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../Button';
import { COLORS } from '../../constants';

interface Props {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelSubscriptionModal({ visible, loading, onClose, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>!</Text>
          <Text style={styles.title}>Hủy gia hạn Premium?</Text>
          <Text style={styles.body}>
            Bạn sẽ vẫn giữ quyền truy cập Premium cho đến hết chu kỳ thanh toán hiện tại. Sau đó tài khoản sẽ quay về gói miễn phí.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.secondary}>
              <Text style={styles.secondaryText}>Giữ gói hiện tại</Text>
            </TouchableOpacity>
            <Button title="Xác nhận hủy" onPress={onConfirm} loading={loading} style={styles.danger} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    padding: 20,
  },
  modal: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  body: {
    color: COLORS.textGray,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: 10,
    marginTop: 20,
  },
  secondary: {
    alignItems: 'center',
    padding: 14,
  },
  secondaryText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  danger: {
    backgroundColor: COLORS.error,
  },
});
