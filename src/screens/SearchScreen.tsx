import React from 'react';
import { View, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card } from '../components/ui';
import { Colors, Spacing, BorderRadius, FontFamily, FontSize, ComponentSize } from '../theme';
import { useSearch } from '../hooks/useSearch';
import { useAppNavigation } from '../navigation/RootNavigator';
import type { Container } from '../types/Container';
import type { Item } from '../types/Item';
import { CONTAINER_TYPE_LABELS } from '../types/common';

export default function SearchScreen() {
  const { goBack, navigate } = useAppNavigation();
  const { query, setQuery, results, isSearching, clearSearch } = useSearch();

  const hasResults = results.containers.length > 0 || results.items.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.searchBar}>
        <View style={styles.inputContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.input}
            placeholder="Buscar contenedores e ítems..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {hasQuery && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={goBack} style={styles.cancelButton} activeOpacity={0.7}>
          <Text variant="labelMedium" color={Colors.primary}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {!hasQuery && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={56} color={Colors.textTertiary} />
          <Text variant="bodyMedium" color={Colors.textTertiary} align="center" style={styles.emptyText}>
            Escribe para buscar contenedores e ítems
          </Text>
        </View>
      )}

      {hasQuery && !isSearching && !hasResults && (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={56} color={Colors.textTertiary} />
          <Text variant="bodyMedium" color={Colors.textTertiary} align="center" style={styles.emptyText}>
            Sin resultados para "{query}"
          </Text>
        </View>
      )}

      {hasResults && (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {results.containers.length > 0 && (
                <>
                  <Text variant="labelMedium" color={Colors.textTertiary} style={styles.sectionLabel}>
                    CONTENEDORES ({results.containers.length})
                  </Text>
                  {results.containers.map((c) => (
                    <ContainerResult key={c.id} container={c} onPress={() => navigate('ContainerDetail', { containerId: c.id })} />
                  ))}
                </>
              )}
              {results.items.length > 0 && (
                <>
                  <Text variant="labelMedium" color={Colors.textTertiary} style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                    ÍTEMS ({results.items.length})
                  </Text>
                  {results.items.map((item) => <ItemResult key={item.id} item={item} />)}
                </>
              )}
            </>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

function ContainerResult({ container, onPress }: { container: Container; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.resultCard}>
      <View style={styles.resultContent}>
        <View style={styles.resultIcon}>
          <Ionicons name="cube-outline" size={20} color={Colors.primary} />
        </View>
        <View style={styles.resultInfo}>
          <Text variant="labelLarge" color={Colors.textPrimary} numberOfLines={1}>{container.name}</Text>
          <Text variant="caption" color={Colors.textTertiary} style={styles.resultSubtext}>{CONTAINER_TYPE_LABELS[container.type]}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      </View>
    </Card>
  );
}

function ItemResult({ item }: { item: Item }) {
  return (
    <Card style={styles.resultCard}>
      <View style={styles.resultContent}>
        <View style={[styles.resultIcon, styles.itemIcon]}>
          <Ionicons name="pricetag-outline" size={18} color={Colors.accent} />
        </View>
        <View style={styles.resultInfo}>
          <Text variant="labelLarge" color={Colors.textPrimary} numberOfLines={1}>{item.name}</Text>
          {item.description ? (
            <Text variant="caption" color={Colors.textTertiary} numberOfLines={1} style={styles.resultSubtext}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.quantityBadge}>
          <Text variant="labelSmall" color={Colors.accent}>×{item.quantity}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingTop: Spacing[3], paddingBottom: Spacing[4] },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing[3], height: ComponentSize.inputHeight, marginRight: Spacing[3] },
  input: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textPrimary, marginLeft: Spacing[2] },
  cancelButton: { paddingVertical: Spacing[2] },
  sectionLabel: { letterSpacing: 2, marginBottom: Spacing[2] },
  sectionLabelSpaced: { marginTop: Spacing[5] },
  listContent: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[20] },
  resultCard: { marginBottom: Spacing[2] },
  resultContent: { flexDirection: 'row', alignItems: 'center' },
  resultIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[3] },
  itemIcon: { backgroundColor: '#0D3D30' },
  resultInfo: { flex: 1 },
  resultSubtext: { marginTop: 2 },
  quantityBadge: { backgroundColor: '#0D3D30', paddingHorizontal: Spacing[2], paddingVertical: 4, borderRadius: BorderRadius.xs, borderWidth: 1, borderColor: Colors.accent, marginLeft: Spacing[2] },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: Spacing[20] },
  emptyText: { marginTop: Spacing[3] },
});
