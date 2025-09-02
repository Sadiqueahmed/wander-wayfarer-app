import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Waypoint {
  id: string;
  placeId?: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  type: 'start' | 'end' | 'waypoint';
}

interface DayItem {
  id: string;
  type: 'leg' | 'poi' | 'note' | 'lodging' | 'photo';
  title: string;
  details?: string;
  time?: string;
  cost?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  durationMin?: number;
}

interface DayPlan {
  id: string;
  date?: string;
  items: DayItem[];
  summary: {
    distanceKm: number;
    durationMin: number;
    estimatedCost: number;
  };
}

interface RouteData {
  polyline?: any;
  distance?: number;
  duration?: number;
  steps?: any[];
}

interface Itinerary {
  id?: string;
  title: string;
  waypoints: Waypoint[];
  days: DayPlan[];
  routeData: RouteData;
  isPublic: boolean;
  shareSlug?: string;
  createdAt: string;
  updatedAt: string;
}

interface ItineraryState {
  currentItinerary: Itinerary | null;
  savedItineraries: Itinerary[];
  filters: {
    fuel: boolean;
    food: boolean;
  };
  
  // Actions
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  updateWaypoints: (waypoints: Waypoint[]) => void;
  updateRouteData: (routeData: RouteData) => void;
  updateDays: (days: DayPlan[]) => void;
  updateFilters: (filters: { fuel: boolean; food: boolean }) => void;
  saveItinerary: () => void;
  loadItinerary: (id: string) => void;
  deleteItinerary: (id: string) => void;
  createNewItinerary: () => void;
  updateShareSettings: (isPublic: boolean, shareSlug?: string) => void;
}

const defaultItinerary: Itinerary = {
  title: 'New Trip',
  waypoints: [
    { id: 'start', name: '', lat: 0, lng: 0, type: 'start' },
    { id: 'end', name: '', lat: 0, lng: 0, type: 'end' }
  ],
  days: [],
  routeData: {},
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      currentItinerary: null,
      savedItineraries: [],
      filters: { fuel: false, food: false },

      setCurrentItinerary: (itinerary) => 
        set({ currentItinerary: itinerary }),

      updateWaypoints: (waypoints) => 
        set((state) => ({
          currentItinerary: state.currentItinerary 
            ? { ...state.currentItinerary, waypoints, updatedAt: new Date().toISOString() }
            : null
        })),

      updateRouteData: (routeData) => 
        set((state) => ({
          currentItinerary: state.currentItinerary 
            ? { ...state.currentItinerary, routeData, updatedAt: new Date().toISOString() }
            : null
        })),

      updateDays: (days) => 
        set((state) => ({
          currentItinerary: state.currentItinerary 
            ? { ...state.currentItinerary, days, updatedAt: new Date().toISOString() }
            : null
        })),

      updateFilters: (filters) => 
        set({ filters }),

      saveItinerary: () => {
        const { currentItinerary, savedItineraries } = get();
        if (!currentItinerary) return;

        const itineraryToSave = {
          ...currentItinerary,
          id: currentItinerary.id || `itinerary-${Date.now()}`,
          updatedAt: new Date().toISOString()
        };

        const existingIndex = savedItineraries.findIndex(
          (it) => it.id === itineraryToSave.id
        );

        if (existingIndex >= 0) {
          // Update existing
          const newSavedItineraries = [...savedItineraries];
          newSavedItineraries[existingIndex] = itineraryToSave;
          set({ 
            savedItineraries: newSavedItineraries,
            currentItinerary: itineraryToSave
          });
        } else {
          // Add new
          set({ 
            savedItineraries: [...savedItineraries, itineraryToSave],
            currentItinerary: itineraryToSave
          });
        }
      },

      loadItinerary: (id) => {
        const { savedItineraries } = get();
        const itinerary = savedItineraries.find((it) => it.id === id);
        if (itinerary) {
          set({ currentItinerary: itinerary });
        }
      },

      deleteItinerary: (id) => {
        const { savedItineraries, currentItinerary } = get();
        const newSavedItineraries = savedItineraries.filter((it) => it.id !== id);
        
        set({ 
          savedItineraries: newSavedItineraries,
          currentItinerary: currentItinerary?.id === id ? null : currentItinerary
        });
      },

      createNewItinerary: () => {
        set({ currentItinerary: { ...defaultItinerary } });
      },

      updateShareSettings: (isPublic, shareSlug) => 
        set((state) => ({
          currentItinerary: state.currentItinerary 
            ? { 
                ...state.currentItinerary, 
                isPublic, 
                shareSlug,
                updatedAt: new Date().toISOString() 
              }
            : null
        })),
    }),
    {
      name: 'itinerary-storage',
      partialize: (state) => ({ 
        savedItineraries: state.savedItineraries,
        filters: state.filters 
      }),
    }
  )
);