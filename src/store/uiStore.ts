import { create } from 'zustand';

type ModalType = 'createContainer' | 'createItem' | 'editContainer' | 'editItem' | 'deleteConfirm' | null;

interface UIState {
  // Modal
  activeModal: ModalType;
  modalPayload: unknown;

  // Bottom sheet
  isBottomSheetOpen: boolean;

  // Búsqueda global
  isSearchActive: boolean;

  // Tab activo
  activeTab: string;

  // Actions
  openModal: (type: ModalType, payload?: unknown) => void;
  closeModal: () => void;
  setBottomSheet: (open: boolean) => void;
  setSearchActive: (active: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  modalPayload: null,
  isBottomSheetOpen: false,
  isSearchActive: false,
  activeTab: 'Home',

  openModal: (type, payload = null) =>
    set({ activeModal: type, modalPayload: payload }),

  closeModal: () =>
    set({ activeModal: null, modalPayload: null }),

  setBottomSheet: (open) =>
    set({ isBottomSheetOpen: open }),

  setSearchActive: (active) =>
    set({ isSearchActive: active }),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),
}));
