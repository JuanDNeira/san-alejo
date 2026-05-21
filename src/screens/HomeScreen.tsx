import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card } from '../components/ui';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useContainerStore } from '../store/containerStore';
import { useAppNavigation } from '../navigation/RootNavigator';
import type { Container } from '../types/Container';
import { CONTAINER_TYPE_LABELS, CONTAINER_TYPE_ICONS } from '../types/common';
import { formatRelativeDate } from '../utils/dateUtils';

export default function HomeScreen() {
  const { navigate } = useAppNavigation();
  const { containers, isLoading, loadContainers } = useContainerStore();

  useEffect(() => { loadContainers(); }, [loadContainers]);

  const renderContainer = useCallback(
    ({ item }: { item: Container }) => (
      <ContainerCard
        container={item}
        onPress={() => navigate('ContainerDetail', { containerId: item.id })}
      />
    ),
    [navigate]
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text variant="labelSmall" color={Colors.textTertiary} style={styles.greeting}>
            BIENVENIDO A
          </Text>
          <Text variant="headingLarge" color={Colors.textPrimary}>San Alejo</Text>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={() => navigate('Search')} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={containers}
        keyExtractor={(item) => item.id}
        renderItem={renderContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadContainers} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        ListHeaderComponent={
          <Text variant="labelMedium" color={Colors.textTertiary} style={styles.sectionLabel}>
            MIS CONTENEDORES
          </Text>
        }
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => navigate('CreateContainer')}>
        <LinearGradient colors={Colors.gradients.primary} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={Colors.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

function ContainerCard({ container, onPress }: { container: Container; onPress: () => void }) {
  const iconName = CONTAINER_TYPE_ICONS[container.type] as React.ComponentProps<typeof Ionicons>['name'];
  const accentColor = container.color_tag ?? Colors.primary;

  return (
    <Card onPress={onPress} style={styles.containerCard} noPadding>
      <View style={[styles.colorBar, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: Colors.primaryGlow }]}>
          <Ionicons name={iconName} size={24} color={accentColor} />
        </View>
        <View style={styles.cardInfo}>
          <Text variant="labelLarge" color={Colors.textPrimary} numberOfLines={1}>{container.name}</Text>
          {container.description ? (
            <Text variant="bodySmall" color={Colors.textTertiary} numberOfLines={1} style={styles.descText}>
              {container.description}
            </Text>
          ) : null}
          <Text variant="caption" color={Colors.textTertiary} style={styles.dateText}>
            {formatRelativeDate(container.updated_at)}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text variant="labelSmall" color={Colors.textTertiary}>{CONTAINER_TYPE_LABELS[container.type]}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={styles.chevron} />
        </View>
      </View>
    </Card>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color={Colors.textTertiary} />
      <Text variant="headingSmall" color={Colors.textSecondary} align="center" style={styles.emptyTitle}>
        Sin contenedores
      </Text>
      <Text variant="bodyMedium" color={Colors.textTertiary} align="center">
        Toca el botón + para crear tu primer contenedor
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing[4], paddingTop: Spacing[4], paddingBottom: Spacing[3] },
  greeting: { letterSpacing: 2, marginBottom: 2 },
  searchButton: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { letterSpacing: 2, marginBottom: Spacing[3], marginTop: Spacing[2] },
  listContent: { paddingHorizontal: Spacing[4], paddingBottom: 120 },
  containerCard: { flexDirection: 'row', marginBottom: Spacing[3], overflow: 'hidden' },
  colorBar: { width: 4, borderTopLeftRadius: BorderRadius.lg, borderBottomLeftRadius: BorderRadius.lg },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: Spacing[4] },
  iconContainer: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[3] },
  cardInfo: { flex: 1 },
  descText: { marginTop: 2 },
  dateText: { marginTop: 2 },
  cardRight: { alignItems: 'flex-end', marginLeft: Spacing[2] },
  chevron: { marginTop: 4 },
  fab: { position: 'absolute', bottom: 90, right: Spacing[5], elevation: 8 },
  fabGradient: { width: 60, height: 60, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing[20] },
  emptyTitle: { marginTop: Spacing[2], marginBottom: Spacing[2] },
});
