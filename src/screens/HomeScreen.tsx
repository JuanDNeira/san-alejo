import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, EmptyState, FloatingActionButton } from '../components/ui';
import { Colors, Spacing, BorderRadius, Shadows, FontFamily, FontSize } from '../theme';
import { useContainerStore } from '../store/containerStore';
import { useAppNavigation } from '../navigation/RootNavigator';
import type { Container } from '../types/Container';
import { CONTAINER_TYPE_LABELS, CONTAINER_TYPE_ICONS } from '../types/common';
import { formatRelativeDate } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing[4] * 2;

// ─── Animated Container Card ─────────────────────────────────────────────────
function ContainerPosterCard({
  container,
  onPress,
  index,
}: {
  container: Container;
  onPress: () => void;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const accentColor = container.color_tag ?? Colors.primary;
  const iconName = CONTAINER_TYPE_ICONS[container.type] as React.ComponentProps<typeof Ionicons>['name'];
  const itemCount = container.item_count ?? 0;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.card}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={[`${accentColor}18`, Colors.surface, Colors.backgroundSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top accent line */}
        <View style={[styles.topAccent, { backgroundColor: accentColor }]} />

        {/* Card content */}
        <View style={styles.cardInner}>
          {/* Left: icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}44` }]}>
            <Ionicons name={iconName} size={28} color={accentColor} />
          </View>

          {/* Center: info */}
          <View style={styles.cardInfo}>
            <Text variant="labelLarge" color={Colors.textPrimary} numberOfLines={1} style={styles.cardName}>
              {container.name}
            </Text>
            {container.description ? (
              <Text variant="bodySmall" color={Colors.textTertiary} numberOfLines={2} style={styles.cardDesc}>
                {container.description}
              </Text>
            ) : (
              <Text variant="bodySmall" color={Colors.textTertiary} style={styles.cardDesc}>
                {CONTAINER_TYPE_LABELS[container.type]}
              </Text>
            )}
            <Text variant="caption" color={Colors.textTertiary} style={styles.cardDate}>
              {formatRelativeDate(container.updated_at)}
            </Text>
          </View>

          {/* Right: stats + chevron */}
          <View style={styles.cardRight}>
            <View style={[styles.itemCountBadge, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}55` }]}>
              <Text style={[styles.itemCountText, { color: accentColor }]}>
                {itemCount}
              </Text>
              <Text style={styles.itemCountLabel}>ítems</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={styles.chevron} />
          </View>
        </View>

        {/* Bottom bar */}
        <View style={styles.cardFooter}>
          <View style={[styles.typePill, { backgroundColor: `${accentColor}15` }]}>
            <Ionicons name={iconName} size={10} color={accentColor} style={styles.typePillIcon} />
            <Text style={[styles.typePillText, { color: accentColor }]}>
              {CONTAINER_TYPE_LABELS[container.type].toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { navigate } = useAppNavigation();
  const { containers, isLoading, loadContainers } = useContainerStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadContainers();
  }, [loadContainers]);

  const renderContainer = useCallback(
    ({ item, index }: { item: Container; index: number }) => (
      <ContainerPosterCard
        container={item}
        index={index}
        onPress={() => navigate('ContainerDetail', { containerId: item.id })}
      />
    ),
    [navigate]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="labelSmall" color={Colors.textTertiary} style={styles.greeting}>
            BIENVENIDO A
          </Text>
          <Text variant="headingLarge" color={Colors.textPrimary}>
            San Alejo
          </Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      {containers.length > 0 && (
        <View style={styles.statsStrip}>
          <LinearGradient
            colors={[Colors.primaryGlow, Colors.backgroundSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text variant="headingSmall" color={Colors.primary}>{containers.length}</Text>
              <Text variant="caption" color={Colors.textTertiary}>Contenedores</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headingSmall" color={Colors.accent}>
                {containers.reduce((sum, c) => sum + (c.item_count ?? 0), 0)}
              </Text>
              <Text variant="caption" color={Colors.textTertiary}>Ítems totales</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* List */}
      <FlatList
        data={containers}
        keyExtractor={(item) => item.id}
        renderItem={renderContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadContainers}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          containers.length > 0 ? (
            <View style={styles.listHeader}>
              <View style={styles.listHeaderAccent} />
              <Text variant="labelMedium" color={Colors.textTertiary} style={styles.listHeaderText}>
                MIS CONTENEDORES
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="cube-outline"
              title="Sin contenedores"
              description="Crea tu primer contenedor para empezar a organizar tus cosas."
              actionLabel="Crear contenedor"
              onAction={() => navigate('CreateContainer')}
            />
          ) : null
        }
      />

      <FloatingActionButton
        onPress={() => navigate('CreateContainer')}
        icon="add"
        bottom={90}
        right={Spacing[5]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    letterSpacing: 2,
    marginBottom: 2,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  statsStrip: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
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
    backgroundColor: Colors.primary,
    marginRight: Spacing[3],
  },
  listHeaderText: {
    letterSpacing: 2,
  },
  listContent: {
    paddingHorizontal: Spacing[4],
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: Spacing[3],
  },
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadows.cardShadow,
  },
  topAccent: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[4],
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    marginBottom: 3,
  },
  cardDesc: {
    marginBottom: 4,
  },
  cardDate: {},
  cardRight: {
    alignItems: 'center',
    marginLeft: Spacing[3],
  },
  itemCountBadge: {
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 52,
    marginBottom: Spacing[2],
  },
  itemCountText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
  },
  itemCountLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  chevron: {},
  cardFooter: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  typePillIcon: {
    marginRight: 4,
  },
  typePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    letterSpacing: 1,
  },
});
