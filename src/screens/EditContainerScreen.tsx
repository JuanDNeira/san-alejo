import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, Text, Button } from '../components/ui';
import { Colors, Spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * Pantalla de edición de contenedor.
 * Placeholder — implementación completa en siguiente iteración.
 */
export default function EditContainerScreen() {
  const navigation = useNavigation();

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Button
          label="Cancelar"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="sm"
        />
      </View>
      <View style={styles.content}>
        <Ionicons name="create-outline" size={64} color={Colors.textTertiary} />
        <Text variant="headingMedium" color={Colors.textPrimary} align="center">
          Editar contenedor
        </Text>
        <Text variant="bodyMedium" color={Colors.textTertiary} align="center">
          Formulario en construcción
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
  },
});
