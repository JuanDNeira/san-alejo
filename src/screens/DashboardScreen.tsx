import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, StatCard, SectionHeader } from '../components/ui';
import { Colors, Spacing, BorderRadius, Shadows, FontFamily, FontSize } from '../theme';
import { ContainerRepository } from '../database/repositories/ContainerRepository';
import { ItemRepository } from '../database/repositories/ItemRepository';
import { useAppNavigation } from '../navigation/RootNavigator';
import type { ContainerType } from '../types/common';
import { CONTAINER_TYPE_LABELS, CONTAINER_TYPE_ICONS } from '../types/common';

interface DashboardStats {
  totalContainers: number;
  totalItems: number;
  byType: Partial<Record<ContainerType, number>>;
  topContainers: { container: { id: string; name: string; color_tag?: string; type: ContainerType }; count: number }[];
}

const TYPE_COLORS: Partial<Record<ContainerType, string>> = {
  box: Colors.primary,
  suitcase: Colors.secondary,
  drawer: Colors.accent,
  shelf: Colors.warning,
  bag: Colors.info,
  other: Colors.textTertiary,
};

export default function DashboardScreen() {
  const { navigate } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setIsLoading(true);
    try {
      const [containers, totalItems, byType, topContainers] = await Promise.all([
        ContainerRepository.findAll(),
        ItemRepository.getTotalCount(),
        ContainerRepository.getStatsByType(),
        ContainerRepository.getTopFilledContainers(5),
      ]);
      setStats({
        totalContainers: containers.length,
        totalItems,
        byType,
        topContainers: topContainers.map(({ container, count }) => ({
          container: {
            id: container.id,
            name: container.name,
            color_tag: container.color_tag,
            type: container.type,
          },
          count,
        })),
      });
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
    }
  }

  const totalTypes = stats ? Object.keys(stats.byType).length : 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="labelSmall" color={Colors.textTertiary} style={styles.headerLabel}>
            RESUMEN GENERAL
          </Text>
          <Text variant="headingLarge" color={Colors.textPrimary}>Panel</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadStats} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Main metrics */}
        <View style={styles.metricsRow}>
          <StatCard
            label="Contenedores"
            value={stats?.totalContainers ?? 0}
            icon="cube"
            gradient={Colors.gradients.primary}
            subtitle={`${totalTypes} tipos`}
          />
          <View style={styles.metricGap} />
          <StatCard
            label="Ítems totales"
            value={stats?.totalItems ?? 0}
            icon="pricetag"
            gradient={Colors.gradients.accent}
            subtitle="unidades"
          />
        </View>

        {/* Average items per container */}
        {stats && stats.totalContainers > 0 && (
          <View style={styles.avgCard}>
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.avgGradient}
            >
              <View style={styles.avgLeft}>
                <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
                <View style={styles.avgText}>
                  <Text variant="labelMedium" color={Colors.textSecondary}>Promedio por contenedor</Text>
                  <Text variant="caption" color={Colors.textTertiary}>ítems / contenedor</Text>
                </View>
              </View>
              <Text variant="headingMedium" color={Colors.primary}>
                {(stats.totalItems / stats.totalContainers).toFixed(1)}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* By type */}
        {stats && Object.keys(stats.byType).length > 0 && (
          <>
            <SectionHeader title="Distribución por tipo" accent={Colors.primary} style={styles.sectionHeader} />
            <View style={styles.typeGrid}>
              {(Object.entries(stats.byType) as [ContainerType, number][]).map(([type, count]) => {
                const color = TYPE_COLORS[type] ?? Colors.primary;
                const iconName = CONTAINER_TYPE_ICONS[type] as React.ComponentProps<typeof Ionicons>['name'];
                const pct = stats.totalContainers > 0 ? (count / stats.totalContainers) * 100 : 0;
                return (
                  <View key={type} style={styles.typeCard}>
                    <View style={[styles.typeIconWrapper, { backgroundColor: `${color}22` }]}>
                      <Ionicons name={iconName} size={18} color={color} />
                    </View>
                    <Text variant="headingSmall" color={Colors.textPrimary} style={styles.typeCount}>
                      {count}
                    </Text>
                    <Text variant="caption" color={Colors.textTertiary}>
                      {CONTAINER_TYPE_LABELS[type]}
                    </Text>
                    {/* Mini bar */}
                    <View style={styles.typeBar}>
                      <View style={[styles.typeBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Top containers */}
        {stats && stats.topContainers.length > 0 && (
          <>
            <SectionHeader title="Más llenos" accent={Colors.accent} style={styles.sectionHeader} />
            <View style={styles.topList}>
              {stats.topContainers.map(({ container, count }, index) => {
                const color = container.color_tag ?? Colors.primary;
                const iconName = CONTAINER_TYPE_ICONS[container.type] as React.ComponentProps<typeof Ionicons>['name'];
                const maxCount = stats.topContainers[0]?.count ?? 1;
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <TouchableOpacity
                    key={container.id}
                    style={styles.topItem}
                    onPress={() => navigate('ContainerDetail', { containerId: container.id })}
                    activeOpacity={0.75}
                  >
                    <View style={styles.topRank}>
                      <Text style={[styles.rankText, index === 0 && styles.rankFirst]}>
                        #{index + 1}
                      </Text>
                    </View>
                    <View style={[styles.topIconWrapper, { backgroundColor: `${color}22` }]}>
                      <Ionicons name={iconName} size={16} color={color} />
                    </View>
                    <View style={styles.topInfo}>
                      <Text variant="labelLarge" color={Colors.textPrimary} numberOfLines={1}>
                        {container.name}
                      </Text>
                      <View style={styles.topBarWrapper}>
                        <View style={styles.topBarBg}>
                          <Animated.View
                            style={[styles.topBarFill, { width: `${pct}%`, backgroundColor: color }]}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={[styles.topCountBadge, { backgroundColor: `${color}22`, borderColor: `${color}44` }]}>
                      <Text style={[styles.topCountText, { color }]}>{count}</Text>
                      <Text style={styles.topCountUnit}>ítems</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Empty state */}
        {!isLoading && stats?.totalContainers === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="bar-chart-outline" size={40} color={Colors.textTertiary} />
            </View>
            <Text variant="headingSmall" color={Colors.textSecondary} align="center" style={styles.emptyTitle}>
              Sin datos aún
            </Text>
            <Text variant="bodyMedium" color={Colors.textTertiary} align="center">
              Agrega contenedores para ver estadísticas aquí
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
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
  headerLabel: {
    letterSpacing: 2,
    marginBottom: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[20],
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
  },
  metricGap: {
    width: Spacing[3],
  },
  avgCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing[4],
    ...Shadows.sm,
  },
  avgGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  avgLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avgText: {
    marginLeft: Spacing[3],
  },
  sectionHeader: {
    marginBottom: Spacing[3],
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing[2],
    marginBottom: Spacing[4],
  },
  typeCard: {
    width: '50%',
    paddingHorizontal: Spacing[2],
    marginBottom: Spacing[3],
  },
  typeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  typeCount: {
    marginBottom: 2,
  },
  typeBar: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    marginTop: Spacing[2],
    overflow: 'hidden',
  },
  typeBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  topList: {
    marginBottom: Spacing[4],
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    marginBottom: Spacing[2],
    ...Shadows.sm,
  },
  topRank: {
    width: 28,
    alignItems: 'center',
    marginRight: Spacing[3],
  },
  rankText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  rankFirst: {
    color: Colors.warning,
  },
  topIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  topInfo: {
    flex: 1,
  },
  topBarWrapper: {
    marginTop: Spacing[2],
  },
  topBarBg: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  topBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  topCountBadge: {
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginLeft: Spacing[3],
    minWidth: 52,
  },
  topCountText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  topCountUnit: {
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
  bottomSpacer: {
    height: Spacing[4],
  },
});
