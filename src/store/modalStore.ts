import { create } from 'zustand';

interface ModalState {
  // Modal states
  isPropertyModalOpen: boolean;
  isClientModalOpen: boolean;
  isAppointmentModalOpen: boolean;
  isAdvisorModalOpen: boolean;
  isServiceInquiryModalOpen: boolean;
  isNavigationModalOpen: boolean;
  
  // Modal data
  selectedProperty: any | null;
  selectedClient: any | null;
  selectedAppointment: any | null;
  selectedAdvisor: any | null;
  
  // Navigation
  modalHistory: string[];
  currentModal: string | null;
  
  // Modal actions
  openPropertyModal: (property?: any) => void;
  closePropertyModal: () => void;
  openClientModal: (client?: any) => void;
  closeClientModal: () => void;
  openAppointmentModal: (appointment?: any) => void;
  closeAppointmentModal: () => void;
  openAdvisorModal: (advisor?: any) => void;
  closeAdvisorModal: () => void;
  openServiceInquiryModal: () => void;
  closeServiceInquiryModal: () => void;
  openNavigationModal: () => void;
  closeNavigationModal: () => void;
  
  // Navigation actions
  goBackInModals: () => void;
  switchToModal: (modalType: string, data?: any) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  // Initial states
  isPropertyModalOpen: false,
  isClientModalOpen: false,
  isAppointmentModalOpen: false,
  isAdvisorModalOpen: false,
  isServiceInquiryModalOpen: false,
  isNavigationModalOpen: false,
  
  selectedProperty: null,
  selectedClient: null,
  selectedAppointment: null,
  selectedAdvisor: null,
  
  // Navigation
  modalHistory: [],
  currentModal: null,

  // Actions
  openPropertyModal: (property = null) => {
    const state = get();
    set({ 
      isPropertyModalOpen: true, 
      selectedProperty: property,
      modalHistory: state.currentModal ? [...state.modalHistory, state.currentModal] : state.modalHistory,
      currentModal: 'property'
    });
  },
  closePropertyModal: () => set({ 
    isPropertyModalOpen: false, 
    selectedProperty: null,
    currentModal: null
  }),
  
  openClientModal: (client = null) => {
    const state = get();
    set({ 
      isClientModalOpen: true, 
      selectedClient: client,
      modalHistory: state.currentModal ? [...state.modalHistory, state.currentModal] : state.modalHistory,
      currentModal: 'client'
    });
  },
  closeClientModal: () => set({ 
    isClientModalOpen: false, 
    selectedClient: null,
    currentModal: null
  }),
  
  openAppointmentModal: (appointment = null) => {
    const state = get();
    set({ 
      isAppointmentModalOpen: true, 
      selectedAppointment: appointment,
      modalHistory: state.currentModal ? [...state.modalHistory, state.currentModal] : state.modalHistory,
      currentModal: 'appointment'
    });
  },
  closeAppointmentModal: () => set({ 
    isAppointmentModalOpen: false, 
    selectedAppointment: null,
    currentModal: null
  }),
  
  openAdvisorModal: (advisor = null) => {
    const state = get();
    set({ 
      isAdvisorModalOpen: true, 
      selectedAdvisor: advisor,
      modalHistory: state.currentModal ? [...state.modalHistory, state.currentModal] : state.modalHistory,
      currentModal: 'advisor'
    });
  },
  closeAdvisorModal: () => set({ 
    isAdvisorModalOpen: false, 
    selectedAdvisor: null,
    currentModal: null
  }),
  
  openServiceInquiryModal: () => {
    const state = get();
    set({ 
      isServiceInquiryModalOpen: true,
      modalHistory: state.currentModal ? [...state.modalHistory, state.currentModal] : state.modalHistory,
      currentModal: 'serviceInquiry'
    });
  },
  closeServiceInquiryModal: () => set({ 
    isServiceInquiryModalOpen: false,
    currentModal: null
  }),
  
  openNavigationModal: () => set({ 
    isNavigationModalOpen: true 
  }),
  closeNavigationModal: () => set({ 
    isNavigationModalOpen: false 
  }),
  
  // Navigation actions
  goBackInModals: () => {
    const state = get();
    const previousModal = state.modalHistory[state.modalHistory.length - 1];
    const newHistory = state.modalHistory.slice(0, -1);
    
    // Close current modal
    set({
      isPropertyModalOpen: false,
      isClientModalOpen: false,
      isAppointmentModalOpen: false,
      isAdvisorModalOpen: false,
      isServiceInquiryModalOpen: false,
      modalHistory: newHistory,
      currentModal: previousModal || null
    });
    
    // Open previous modal if exists
    if (previousModal) {
      setTimeout(() => {
        switch (previousModal) {
          case 'property':
            set({ isPropertyModalOpen: true });
            break;
          case 'client':
            set({ isClientModalOpen: true });
            break;
          case 'appointment':
            set({ isAppointmentModalOpen: true });
            break;
          case 'advisor':
            set({ isAdvisorModalOpen: true });
            break;
          case 'serviceInquiry':
            set({ isServiceInquiryModalOpen: true });
            break;
        }
      }, 100);
    }
  },
  
  switchToModal: (modalType: string, data?: any) => {
    const state = get();
    // Close all modals first
    set({
      isPropertyModalOpen: false,
      isClientModalOpen: false,
      isAppointmentModalOpen: false,
      isAdvisorModalOpen: false,
      isServiceInquiryModalOpen: false,
      modalHistory: state.currentModal ? [...state.modalHistory, state.currentModal] : state.modalHistory,
    });
    
    // Open new modal
    setTimeout(() => {
      switch (modalType) {
        case 'property':
          get().openPropertyModal(data);
          break;
        case 'client':
          get().openClientModal(data);
          break;
        case 'appointment':
          get().openAppointmentModal(data);
          break;
        case 'advisor':
          get().openAdvisorModal(data);
          break;
        case 'serviceInquiry':
          get().openServiceInquiryModal();
          break;
      }
    }, 100);
  },

  closeAllModals: () => set({
    isPropertyModalOpen: false,
    isClientModalOpen: false,
    isAppointmentModalOpen: false,
    isAdvisorModalOpen: false,
    isServiceInquiryModalOpen: false,
    isNavigationModalOpen: false,
    selectedProperty: null,
    selectedClient: null,
    selectedAppointment: null,
    selectedAdvisor: null,
    modalHistory: [],
    currentModal: null,
  }),
}));
