import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ScreenContainer, Text, Card } from '../components/ui';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useContainerStore } from '../store/containerStore';
import { useItemStore } from '../store/itemStore';
import type { RootStackParamList } from '../navigation/types';
import type { Item } from '../types/Item';
import { formatRelativeDate } from '../utils/dateUtils';

type DetailRouteProp = RouteProp<RootStackParamList, 'ContainerDetail'>;
type DetailNavProp = StackNavigationProp<RootStackParamList>;

export default function ContainerDetailScreen() {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { containerId } = route.params;

  const { selectedContainer, loadContainerById } = useContainerStore();
  const { itemsByContainer, isLoading, loadItemsByContainer } = useItemStore();
  const items = itemsByContainer[containerId] ?? [];

  useEffect(() => {
    loadContainerById(containerId);
    loadItemsByContainer(containerId);
  }, [containerId, loadContainerById, loadItemsByContainer]);

  const container = selectedContainer?.id === containerId ? selectedContainer : null;

  const renderItem = useCallback(({ item }: { item: Item }) => <ItemRow item={item} />, []);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text variant="headingMedium" color={Colors.textPrimary} numberOfLines={1}>
            {container?.name ?? '...'}
          </Text>
          {container?.description ? (
            <Text variant="bodySmall" color={Colors.textTertiary} numberOfLines={2} style={styles.descText}>
              {container.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditContainer', { containerId })}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text variant="labelMedium" color={Colors.textTertiary} style={styles.sectionLabel}>
            ÍTEMS ({items.length})
          </Text>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="archive-outline" size={48} color={Colors.textTertiary} />
              <Text variant="bodyMedium" color={Colors.textTertiary} align="center" style={styles.emptyText}>
                Este contenedor está vacío
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreateItem', { containerId })}
      >
        <LinearGradient colors={Colors.gradients.primary} style={styles.fabGradient}>
          <Ionicons name="add" size={26} color={Colors.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

function ItemRow({ item }: { item: Item }) {
  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View style={styles.itemIcon}>
          <Ionicons name="cube-outline" size={20} color={Colors.textSecondary} />
        </View>
        <View style={styles.itemInfo}>
          <Text variant="labelLarge" color={Colors.textPrimary} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text variant="bodySmall" color={Colors.textTertiary} numberOfLines={1} style={styles.itemDesc}>
              {item.description}
            </Text>
          ) : null}
          <Text variant="caption" color={Colors.textTertiary} style={styles.itemDate}>
            {formatRelativeDate(item.updated_at)}
          </Text>
        </View>
        <View style={styles.quantityBadge}>
          <Text variant="labelMedium" color={Colors.primary}>
            ×{item.quantity}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  headerInfo: {
    flex: 1,
  },
  descText: {
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing[3],
  },
  sectionLabel: {
    letterSpacing: 2,
    marginBottom: Spacing[3],
  },
  listContent: {
    paddingHorizontal: Spacing[4],
    paddingBottom: 120,
  },
  itemCard: {
    marginBottom: Spacing[2],
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  itemInfo: {
    flex: 1,
  },
  itemDesc: {
    marginTop: 2,
  },
  itemDate: {
    marginTop: 2,
  },
  quantityBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginLeft: Spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing[16],
  },
  emptyText: {
    marginTop: Spacing[3],
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: Spacing[5],
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
