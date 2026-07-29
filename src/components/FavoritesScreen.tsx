import { Heart, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { Recipe } from '../types/recipe';
import { getFavoriteIdentity } from '../utils/favoriteIdentity';
import { RecipeCard } from './RecipeCard';

interface Props {
  onRecipeClick: (recipe: Recipe) => void;
  onExplore: () => void;
}

export function FavoritesScreen({ onRecipeClick, onExplore }: Props) {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi');
    return keyword ? favorites.filter(item => item.name.toLocaleLowerCase('vi').includes(keyword)) : favorites;
  }, [favorites, query]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerIcon}><Heart size={23} color="#FFFFFF" fill="#FFFFFF" /></View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>BỘ SƯU TẬP CỦA BẠN</Text>
          <Text style={styles.title}>Món ăn yêu thích</Text>
          <Text style={styles.subtitle}>{favorites.length} công thức đã lưu để nấu lại bất cứ lúc nào.</Text>
        </View>
      </View>

      {favorites.length > 0 && (
        <View style={styles.searchBox}>
          <Search size={19} color="#64748B" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm trong món đã lưu..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            accessibilityLabel="Tìm trong món đã lưu"
          />
        </View>
      )}

      {favorites.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Heart size={34} color="#16A34A" /></View>
          <Text style={styles.emptyTitle}>Chưa có món yêu thích</Text>
          <Text style={styles.emptyText}>Chạm vào biểu tượng trái tim trên món ăn bạn thích để lưu vào đây.</Text>
          <Pressable
            style={styles.exploreButton}
            onPress={onExplore}
            accessibilityRole="button"
            accessibilityLabel="Khám phá món ăn"
          >
            <Text style={styles.exploreButtonText}>Khám phá món ăn</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.noResult}><Text style={styles.noResultTitle}>Không tìm thấy món phù hợp</Text><Text style={styles.noResultText}>Thử tìm bằng một tên món khác nhé.</Text></View>
      ) : (
        <View style={styles.list}>
          {filtered.map(recipe => (
            <RecipeCard key={getFavoriteIdentity(recipe)} recipe={{ ...recipe, isFavorite: isFavorite(recipe) }} onFavoriteToggle={() => void toggleFavorite(recipe)} onClick={() => onRecipeClick(recipe)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 130 },
  header: { flexDirection: 'row', backgroundColor: '#064E3B', borderRadius: 28, padding: 22, marginBottom: 18 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  headerCopy: { flex: 1 },
  eyebrow: { color: '#A7F3D0', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#D1FAE5', fontSize: 13, lineHeight: 19 },
  searchBox: { height: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, color: '#0F172A', fontSize: 15 },
  list: { paddingTop: 2 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, paddingHorizontal: 28, paddingVertical: 42, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { color: '#0F172A', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptyText: { color: '#64748B', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 22 },
  exploreButton: { minHeight: 44, backgroundColor: '#10B981', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 24, justifyContent: 'center' },
  exploreButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  noResult: { alignItems: 'center', paddingVertical: 42 },
  noResultTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800', marginBottom: 7 },
  noResultText: { color: '#64748B', fontSize: 14 },
});
