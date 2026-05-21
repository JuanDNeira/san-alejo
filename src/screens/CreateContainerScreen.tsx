import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  Text,
  Button,
  PremiumInput,
  SectionHeader,
  TypeSelector,
  ColorPicker,
  TagBadge,
} from '../components/ui';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useContainerStore } from '../store/containerStore';
import { TagRepository } from '../database/repositories/TagRepository';
import { LocationRepository } from '../database/repositories/LocationRepository';
import { useAppNavigation } from '../navigation/RootNavigator';
import { validateContainerName } from '../utils/validation';
import type { ContainerType } from '../types/common';
import { CONTAINER_TYPE_ICONS } from '../types/common';
import type { Tag } from '../types/Tag';
import type { Location } from '../types/Location';

interface FormState {
  name: string;
  description: string;
  type: ContainerType;
  color_tag: string | undefined;
  location_id: string | undefined;
  selectedTagIds: string[];
}

interface FormErrors {
  name?: string;
}

export default function CreateContainerScreen() {
  const { goBack, params } = useAppNavigation();
  const { createContainer, isLoading } = useContainerStore();

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    type: 'box',
    color_tag: Colors.containerTags[0],
    location_id: params?.locationId,
    selectedTagIds: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    TagRepository.findAll().then(setTags).catch(() => {});
    LocationRepository.findAll().then(setLocations).catch(() => {});
  }, []);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'name') setErrors((prev) => ({ ...prev, name: undefined }));
  }, []);

  const toggleTag = useCallback((tagId: string) => {
    Haptics.selectionAsync();
    setForm((prev) => ({
      ...prev,
      selectedTagIds: prev.selectedTagIds.includes(tagId)
        ? prev.selectedTagIds.filter((id) => id !== tagId)
        : [...prev.selectedTagIds, tagId],
    }));
  }, []);

  const validate = (): boolean => {
    const nameError = validateContainerName(form.name);
    if (nameError) {
      setErrors({ name: nameError });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const container = await createContainer({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        color_tag: form.color_tag,
        location_id: form.location_id,
        parent_container_id: params?.parentContainerId,
      });

      // Assign tags
      if (form.selectedTagIds.length > 0) {
        for (const tagId of form.selectedTagIds) {
          await TagRepository.assignToContainer(container.id, tagId);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goBack();
    } catch {
      Alert.alert('Error', 'No se pudo crear el contenedor. Intenta de nuevo.');
    }
  };

  const selectedColor = form.color_tag ?? Colors.primary;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={goBack} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text variant="headingSmall" color={Colors.textPrimary}>
          Nuevo contenedor
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Preview banner */}
      <View style={styles.previewBanner}>
        <LinearGradient
          colors={[`${selectedColor}33`, Colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.previewGradient}
        >
          <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}22`, borderColor: `${selectedColor}55` }]}>
            <Ionicons
              name={CONTAINER_TYPE_ICONS[form.type] as React.ComponentProps<typeof Ionicons>['name']}
              size={32}
              color={selectedColor}
            />
          </View>
          <View style={styles.previewInfo}>
            <Text variant="headingMedium" color={Colors.textPrimary} numberOfLines={1}>
              {form.name || 'Sin nombre'}
            </Text>
            {form.description ? (
              <Text variant="bodySmall" color={Colors.textTertiary} numberOfLines={1}>
                {form.description}
              </Text>
            ) : null}
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Información básica */}
        <SectionHeader title="Información" accent={selectedColor} />

        <PremiumInput
          label="Nombre del contenedor"
          value={form.name}
          onChangeText={(v) => updateField('name', v)}
          error={errors.name}
          icon="cube-outline"
          maxLength={100}
          returnKeyType="next"
        />

        <PremiumInput
          label="Descripción (opcional)"
          value={form.description}
          onChangeText={(v) => updateField('description', v)}
          icon="document-text-outline"
          multiline
          numberOfLines={3}
          maxLength={300}
        />

        {/* Tipo */}
        <SectionHeader title="Tipo de contenedor" accent={selectedColor} style={styles.sectionSpacing} />
        <TypeSelector value={form.type} onChange={(t) => updateField('type', t)} />

        {/* Color */}
        <SectionHeader title="Color identificador" accent={selectedColor} style={styles.sectionSpacing} />
        <ColorPicker
          value={form.color_tag}
          onChange={(c) => updateField('color_tag', c)}
        />

        {/* Ubicación */}
        {locations.length > 0 && (
          <>
            <SectionHeader title="Ubicación" accent={selectedColor} style={styles.sectionSpacing} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.locationScroll}
            >
              {locations.map((loc) => {
                const isSelected = form.location_id === loc.id;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    onPress={() => updateField('location_id', isSelected ? undefined : loc.id)}
                    activeOpacity={0.75}
                    style={[
                      styles.locationChip,
                      isSelected && { borderColor: selectedColor, backgroundColor: `${selectedColor}22` },
                    ]}
                  >
                    <Ionicons
                      name={(loc.icon ?? 'location-outline') as React.ComponentProps<typeof Ionicons>['name']}
                      size={14}
                      color={isSelected ? selectedColor : Colors.textTertiary}
                      style={styles.locationIcon}
                    />
                    <Text
                      variant="labelSmall"
                      color={isSelected ? selectedColor : Colors.textSecondary}
                    >
                      {loc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <>
            <SectionHeader title="Etiquetas" accent={selectedColor} style={styles.sectionSpacing} />
            <View style={styles.tagsGrid}>
              {tags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  label={tag.name}
                  color={tag.color}
                  selected={form.selectedTagIds.includes(tag.id)}
                  onPress={() => toggleTag(tag.id)}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          label="Cancelar"
          onPress={goBack}
          variant="ghost"
          size="md"
          style={styles.cancelButton}
        />
        <Button
          label="Crear contenedor"
          onPress={handleSubmit}
          variant="primary"
          size="md"
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[12],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 36,
  },
  previewBanner: {
    overflow: 'hidden',
  },
  previewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[4],
  },
  previewInfo: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
  },
  sectionSpacing: {
    marginTop: Spacing[5],
  },
  locationScroll: {
    paddingBottom: Spacing[1],
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundTertiary,
    marginRight: Spacing[2],
  },
  locationIcon: {
    marginRight: 6,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bottomSpacer: {
    height: Spacing[4],
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    paddingBottom: Spacing[8],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing[3],
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
