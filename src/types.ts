export interface Incident {
  id: string;
  plateNumber: string;
  gpsLocation: string;
  cameraStatus: string;
  vehicleStatus: string;
  isResolved: boolean;
  timestamp: string;
  vehicleDetails: VehicleData;
}

export interface VehicleData {
  plateNumber: string;
  ownerName: string;
  vehicleModel: string;
}

export interface VehicleCommand {
  command: 'LOCK_ENGINE' | 'AUTO_PARK';
  plateNumber: string;
}