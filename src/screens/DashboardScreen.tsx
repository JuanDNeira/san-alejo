import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card } from '../components/ui';
import { Colors, Spacing, BorderRadius } from '../theme';
import { ContainerRepository } from '../database/repositories/ContainerRepository';
import { ItemRepository } from '../database/repositories/ItemRepository';
import type { ContainerType } from '../types/common';
import { CONTAINER_TYPE_LABELS } from '../types/common';

interface DashboardStats {
  totalContainers: number;
  totalItems: number;
  byType: Partial<Record<ContainerType, number>>;
  topContainers: { container: { id: string; name: string; color_tag?: string }; count: number }[];
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

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
          container: { id: container.id, name: container.name, color_tag: container.color_tag },
          count,
        })),
      });
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text variant="labelSmall" color={Colors.textTertiary} style={styles.headerLabel}>
          RESUMEN
        </Text>
        <Text variant="headingLarge" color={Colors.textPrimary}>Panel</Text>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard label="Contenedores" value={stats?.totalContainers ?? 0} icon="cube" gradient={Colors.gradients.primary} />
        <View style={styles.metricSpacer} />
        <MetricCard label="Ítems totales" value={stats?.totalItems ?? 0} icon="pricetag" gradient={Colors.gradients.accent} />
      </View>

      {stats && Object.keys(stats.byType).length > 0 && (
        <Card style={styles.section}>
          <Text variant="labelMedium" color={Colors.textTertiary} style={styles.sectionLabel}>
            POR TIPO
          </Text>
          {(Object.entries(stats.byType) as [ContainerType, number][]).map(([type, count]) => (
            <View key={type} style={styles.typeRow}>
              <Text variant="bodyMedium" color={Colors.textSecondary}>
                {CONTAINER_TYPE_LABELS[type]}
              </Text>
              <View style={styles.typeCount}>
                <Text variant="labelMedium" color={Colors.primary}>{count}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {stats && stats.topContainers.length > 0 && (
        <Card style={styles.section}>
          <Text variant="labelMedium" color={Colors.textTertiary} style={styles.sectionLabel}>
            MÁS LLENOS
          </Text>
          {stats.topContainers.map(({ container, count }, index) => (
            <View key={container.id} style={styles.topRow}>
              <View style={styles.topRank}>
                <Text variant="labelSmall" color={Colors.textTertiary}>#{index + 1}</Text>
              </View>
              <View style={[styles.topDot, { backgroundColor: container.color_tag ?? Colors.primary }]} />
              <Text variant="bodyMedium" color={Colors.textPrimary} style={styles.topName}>
                {container.name}
              </Text>
              <Text variant="labelMedium" color={Colors.textSecondary}>{count} ítems</Text>
            </View>
          ))}
        </Card>
      )}

      {!isLoading && stats?.totalContainers === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={56} color={Colors.textTertiary} />
          <Text variant="bodyMedium" color={Colors.textTertiary} align="center" style={styles.emptyText}>
            Agrega contenedores para ver estadísticas
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

function MetricCard({ label, value, icon, gradient }: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  gradient: readonly [string, string];
}) {
  return (
    <View style={styles.metricCard}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.metricGradient}>
        <Ionicons name={icon} size={28} color="#FFFFFFEE" />
        <Text variant="displayMedium" color={Colors.textPrimary} style={styles.metricValue}>{value}</Text>
        <Text variant="labelSmall" color="#FFFFFFBB">{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
  },
  headerLabel: {
    letterSpacing: 2,
    marginBottom: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[4],
  },
  metricSpacer: {
    width: Spacing[3],
  },
  metricCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
  },
  metricGradient: {
    padding: Spacing[5],
    alignItems: 'flex-start',
  },
  metricValue: {
    marginTop: Spacing[2],
    marginBottom: 2,
  },
  section: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[4],
  },
  sectionLabel: {
    letterSpacing: 2,
    marginBottom: Spacing[3],
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeCount: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRank: {
    width: 24,
    alignItems: 'center',
    marginRight: Spacing[3],
  },
  topDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    marginRight: Spacing[3],
  },
  topName: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing[20],
  },
  emptyText: {
    marginTop: Spacing[3],
  },
});
