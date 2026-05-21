import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text, FloatingActionButton } from '../components/ui';
import { Colors, Spacing, BorderRadius, Shadows, FontFamily, FontSize } from '../theme';
import { useContainerStore } from '../store/containerStore';
import { useItemStore } from '../store/itemStore';
import { useAppNavigation } from '../navigation/RootNavigator';
import type { Item } from '../types/Item';
import { CONTAINER_TYPE_LABELS, CONTAINER_TYPE_ICONS } from '../types/common';
import { formatRelativeDate } from '../utils/dateUtils';

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, index, onDelete }: { item: Item; index: number; onDelete: (id: string) => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      item.name,
      '¿Qué deseas hacer con este ítem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  return (
    <Animated.View
      style={[
        styles.itemCardWrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.itemCard}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        delayLongPress={400}
      >
        <View style={styles.itemIconWrapper}>
          <Ionicons name="pricetag" size={18} color={Colors.accent} />
        </View>
        <View style={styles.itemInfo}>
          <Text variant="labelLarge" color={Colors.textPrimary} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text variant="bodySmall" color={Colors.textTertiary} numberOfLines={2} style={styles.itemDesc}>
              {item.description}
            </Text>
          ) : null}
          <Text variant="caption" color={Colors.textTertiary} style={styles.itemDate}>
            {formatRelativeDate(item.updated_at)}
          </Text>
        </View>
        <View style={styles.itemRight}>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityValue}>{item.quantity}</Text>
            <Text style={styles.quantityUnit}>uds</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── ContainerDetailScreen ────────────────────────────────────────────────────
export default function ContainerDetailScreen() {
  const { goBack, navigate, params } = useAppNavigation();
  const containerId = params?.containerId ?? '';
  const insets = useSafeAreaInsets();

  const { selectedContainer, loadContainerById } = useContainerStore();
  const { itemsByContainer, isLoading, loadItemsByContainer, deleteItem } = useItemStore();
  const items = itemsByContainer[containerId] ?? [];

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (containerId) {
      loadContainerById(containerId);
      loadItemsByContainer(containerId);
    }
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [containerId, loadContainerById, loadItemsByContainer, headerFade, headerSlide]);

  const container = selectedContainer?.id === containerId ? selectedContainer : null;
  const accentColor = container?.color_tag ?? Colors.primary;
  const iconName = container
    ? (CONTAINER_TYPE_ICONS[container.type] as React.ComponentProps<typeof Ionicons>['name'])
    : 'cube-outline';

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        await deleteItem(itemId, containerId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        Alert.alert('Error', 'No se pudo eliminar el ítem.');
      }
    },
    [deleteItem, containerId]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Item; index: number }) => (
      <ItemCard item={item} index={index} onDelete={handleDeleteItem} />
    ),
    [handleDeleteItem]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Hero header */}
      <Animated.View
        style={[
          styles.heroHeader,
          { opacity: headerFade, transform: [{ translateY: headerSlide }] },
        ]}
      >
        <LinearGradient
          colors={[`${accentColor}28`, Colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Nav row */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.navSpacer} />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigate('EditContainer', { containerId })}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Container identity */}
        <View style={styles.heroContent}>
          <View style={[styles.heroIcon, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}55` }]}>
            <Ionicons name={iconName} size={36} color={accentColor} />
          </View>
          <View style={styles.heroInfo}>
            <Text variant="headingLarge" color={Colors.textPrimary} numberOfLines={2}>
              {container?.name ?? '...'}
            </Text>
            {container?.description ? (
              <Text variant="bodyMedium" color={Colors.textTertiary} numberOfLines={2} style={styles.heroDesc}>
                {container.description}
              </Text>
            ) : null}
            <View style={styles.heroBadgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}44` }]}>
                <Text variant="labelSmall" color={accentColor}>
                  {container ? CONTAINER_TYPE_LABELS[container.type] : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text variant="headingMedium" color={Colors.textPrimary}>{items.length}</Text>
            <Text variant="caption" color={Colors.textTertiary}>Tipos de ítem</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text variant="headingMedium" color={Colors.textPrimary}>
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </Text>
            <Text variant="caption" color={Colors.textTertiary}>Unidades totales</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text variant="headingMedium" color={Colors.textPrimary}>
              {container ? formatRelativeDate(container.updated_at) : '—'}
            </Text>
            <Text variant="caption" color={Colors.textTertiary}>Actualizado</Text>
          </View>
        </View>
      </Animated.View>

      {/* Items list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={[styles.listHeaderAccent, { backgroundColor: accentColor }]} />
            <Text variant="labelMedium" color={Colors.textTertiary} style={styles.listHeaderText}>
              CONTENIDO ({items.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="archive-outline" size={40} color={Colors.textTertiary} />
              </View>
              <Text variant="headingSmall" color={Colors.textSecondary} align="center" style={styles.emptyTitle}>
                Contenedor vacío
              </Text>
              <Text variant="bodyMedium" color={Colors.textTertiary} align="center">
                Toca + para agregar el primer ítem
              </Text>
            </View>
          ) : null
        }
      />

      <FloatingActionButton
        onPress={() => navigate('CreateItem', { containerId })}
        icon="add"
        bottom={90}
        right={Spacing[5]}
        gradient={Colors.gradients.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroHeader: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing[3],
    marginBottom: Spacing[4],
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
    ...Shadows.sm,
  },
  navSpacer: {
    flex: 1,
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
    ...Shadows.sm,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing[4],
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[4],
  },
  heroInfo: {
    flex: 1,
    paddingTop: Spacing[1],
  },
  heroDesc: {
    marginTop: Spacing[1],
    marginBottom: Spacing[2],
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginTop: Spacing[2],
  },
  typeBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[2],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  listHeaderAccent: {
    width: 3,
    height: 14,
    borderRadius: BorderRadius.full,
    marginRight: Spacing[3],
  },
  listHeaderText: {
    letterSpacing: 2,
  },
  listContent: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: 120,
  },
  itemCardWrapper: {
    marginBottom: Spacing[2],
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    ...Shadows.sm,
  },
  itemIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.accent}18`,
    borderWidth: 1,
    borderColor: `${Colors.accent}33`,
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
    marginTop: 4,
  },
  itemRight: {
    marginLeft: Spacing[3],
    alignItems: 'center',
  },
  quantityBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    minWidth: 48,
  },
  quantityValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.primary,
    lineHeight: 24,
  },
  quantityUnit: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing[16],
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  emptyTitle: {
    marginBottom: Spacing[2],
  },
});
