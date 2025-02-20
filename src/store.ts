import { create } from 'zustand';
import { Incident, VehicleData } from './types';

interface Store {
  isAuthenticated: boolean;
  incidents: Incident[];
  vehicleDatabase: VehicleData[];
  setAuthenticated: (value: boolean) => void;
  addIncident: (incident: Incident) => void;
  resolveIncident: (id: string) => void;
  addVehicleData: (data: VehicleData) => void;
  removeVehicleData: (plateNumber: string) => void;
}

export const useStore = create<Store>((set) => ({
  isAuthenticated: false,
  incidents: [],
  vehicleDatabase: [
    { plateNumber: '34ABC123', ownerName: 'Ahmet Yılmaz', vehicleModel: 'Toyota Corolla' },
    { plateNumber: '06XYZ789', ownerName: 'Mehmet Demir', vehicleModel: 'Honda Civic' },
    { plateNumber: '35DEF456', ownerName: 'Ayşe Kaya', vehicleModel: 'Renault Clio' },
  ],
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  addIncident: (incident) => set((state) => ({ 
    incidents: [...state.incidents, incident] 
  })),
  resolveIncident: (id) => set((state) => ({
    incidents: state.incidents.map(inc => 
      inc.id === id ? { ...inc, isResolved: true } : inc
    )
  })),
  addVehicleData: (data) => set((state) => ({
    vehicleDatabase: [...state.vehicleDatabase, data]
  })),
  removeVehicleData: (plateNumber) => set((state) => ({
    vehicleDatabase: state.vehicleDatabase.filter(v => v.plateNumber !== plateNumber)
  })),
}));