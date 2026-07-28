import React, { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Leaf, ShieldCheck, Utensils, Wallet } from 'lucide-react-native';
import { COLORS } from '../../constants';

const coverImage = require('../../../img/auth-cover.png');
const logoImage = require('../../../img/fookit-logo.jpg');

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const BRAND_POINTS = [
  { label: 'Tiết kiệm', Icon: Wallet },
  { label: 'Ăn ngon', Icon: Utensils },
  { label: 'Sống khỏe', Icon: Leaf },
];

export default function AuthBrandLayout({ title, subtitle, children }: Props) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground source={coverImage} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        <View style={styles.logoBadge}>
          <Image source={logoImage} style={styles.logo} />
        </View>
      </ImageBackground>

      <View style={styles.panel}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandName}>fookit</Text>
            <Text style={styles.brandLine}>Ăn ngon - Tiết kiệm - Sống khỏe</Text>
          </View>
          <View style={styles.trustBadge}>
            <ShieldCheck size={15} color={COLORS.primary} />
            <Text style={styles.trustText}>Bảo mật</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.brandPoints}>
          {BRAND_POINTS.map(({ label, Icon }) => (
            <View key={label} style={styles.brandPoint}>
              <Icon size={15} color={COLORS.primary} />
              <Text style={styles.brandPointText}>{label}</Text>
            </View>
          ))}
        </View>

        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  hero: {
    height: 250,
    justifyContent: 'flex-end',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 232, 0.2)',
  },
  logoBadge: {
    width: 106,
    height: 106,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 24,
    marginBottom: -34,
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 23,
  },
  panel: {
    marginTop: 18,
    marginHorizontal: 18,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandName: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  brandLine: {
    color: COLORS.textGray,
    fontSize: 12,
    marginTop: 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#DDEED0',
    backgroundColor: '#F7FBF2',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trustText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 7,
  },
  subtitle: {
    color: COLORS.textGray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  brandPoints: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  brandPoint: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: '#F7FBF2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E5F3DA',
  },
  brandPointText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
