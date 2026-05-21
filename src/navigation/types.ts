/**
 * San Alejo — Tipos de navegación
 * Tipado completo para todas las rutas de la app
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Tab Navigator ────────────────────────────────────────────────────────────
export type TabParamList = {
  Home: undefined;
  Dashboard: undefined;
};

// ─── Stack principal ──────────────────────────────────────────────────────────
export type RootStackParamList = {
  // Tabs
  MainTabs: NavigatorScreenParams<TabParamList>;

  // Búsqueda (accesible desde cualquier pantalla)
  Search: undefined;

  // Detalle de contenedor
  ContainerDetail: { containerId: string };

  // Sub-contenedor (navegación anidada)
  SubContainerDetail: { containerId: string; parentName: string };

  // Formularios
  CreateContainer: { parentContainerId?: string; locationId?: string };
  EditContainer: { containerId: string };
  CreateItem: { containerId: string };
  EditItem: { itemId: string; containerId: string };

  // Gestión
  Locations: undefined;
  Tags: undefined;

  // Configuración
  Settings: undefined;
};

// ─── Helpers de tipo para useNavigation ───────────────────────────────────────
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
