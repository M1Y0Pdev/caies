import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Shield, Plus, ChevronRight, ChevronDown, Camera, Car, 
  Check, X, LogOut, Lock, ParkingSquare 
} from 'lucide-react';
import { Incident, VehicleData, VehicleCommand } from '../types';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState<VehicleData>({ 
    plateNumber: '', 
    ownerName: '', 
    vehicleModel: '' 
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [plateInput, setPlateInput] = useState('');
  const navigate = useNavigate();

  const { 
    incidents, 
    addIncident, 
    resolveIncident, 
    vehicleDatabase,
    addVehicleData,
    removeVehicleData,
    setAuthenticated 
  } = useStore();

  const activeIncidents = incidents.filter(inc => !inc.isResolved);
  const resolvedCount = incidents.length - activeIncidents.length;

  const sendCommand = async (command: VehicleCommand) => {
    try {
      const response = await fetch('YOUR_SERVER_URL/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error('Command failed');
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert('Komut gönderilemedi: ' + error);
    }
  };

  const handleLockEngine = (plateNumber: string) => {
    sendCommand({
      command: 'LOCK_ENGINE',
      plateNumber,
    });
  };

  const handleAutoPark = (plateNumber: string) => {
    sendCommand({
      command: 'AUTO_PARK',
      plateNumber,
    });
  };

  const handleAddIncident = () => {
    const vehicle = vehicleDatabase.find(v => v.plateNumber === plateInput);
    if (!vehicle) {
      alert('Plaka bulunamadı!');
      return;
    }

    const newIncident: Incident = {
      id: `ihbar${incidents.length + 1}`,
      plateNumber: plateInput,
      gpsLocation: '41.0082° N, 28.9784° E',
      cameraStatus: 'Aktif',
      vehicleStatus: 'Hareket Halinde',
      isResolved: false,
      timestamp: new Date().toISOString(),
      vehicleDetails: vehicle
    };

    addIncident(newIncident);
    setPlateInput('');
  };

  const handleLogout = () => {
    setAuthenticated(false);
    navigate('/login');
  };

  const toggleIncidentDetails = (incident: Incident) => {
    setSelectedIncident(selectedIncident?.id === incident.id ? null : incident);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">İhbar Takip Sistemi</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 transform hover:scale-105"
                >
                  Plaka Veritabanı
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 transform hover:scale-105"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container mx-auto p-6 grid grid-cols-3 gap-6">
          {/* İhbar Ekle */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">İhbar Ekle</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plaka</label>
                  <input
                    type="text"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    placeholder="34ABC123"
                  />
                </div>
                
                <button
                  onClick={handleAddIncident}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  İhbar Et
                </button>
              </div>
            </div>
          </div>

          {/* Etkin İhbarlar */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Etkin İhbarlar</h2>
              </div>
              
              <div className="space-y-4">
                {activeIncidents.map((incident) => (
                  <div key={incident.id} 
                    className="border rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">{incident.id}</span>
                        <span className="text-gray-600">{incident.plateNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {incident.vehicleStatus !== 'Hareket Halinde' && (
                          <button
                            onClick={() => handleLockEngine(incident.plateNumber)}
                            className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-all duration-200"
                            title="Kontağı Kilitle"
                          >
                            <Lock className="w-5 h-5" />
                          </button>
                        )}
                        {incident.vehicleStatus === 'Hareket Halinde' && (
                          <button
                            onClick={() => handleAutoPark(incident.plateNumber)}
                            className="p-2 hover:bg-blue-100 rounded-full text-blue-600 transition-all duration-200"
                            title="Otonom Park"
                          >
                            <ParkingSquare className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleIncidentDetails(incident)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                        >
                          {selectedIncident?.id === incident.id ? 
                            <ChevronDown className="w-5 h-5" /> : 
                            <ChevronRight className="w-5 h-5" />
                          }
                        </button>
                        <button
                          onClick={() => resolveIncident(incident.id)}
                          className="p-2 hover:bg-green-100 rounded-full text-green-600 transition-all duration-200"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`mt-4 border-t pt-4 transition-all duration-300 ${
                      selectedIncident?.id === incident.id ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Araç Bilgileri</h3>
                          <div className="space-y-2">
                            <p><span className="font-medium">Plaka:</span> {incident.vehicleDetails.plateNumber}</p>
                            <p><span className="font-medium">Sahibi:</span> {incident.vehicleDetails.ownerName}</p>
                            <p><span className="font-medium">Model:</span> {incident.vehicleDetails.vehicleModel}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Sistem Durumu</h3>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">GPS:</span>
                              <span>{incident.gpsLocation}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Kamera:</span>
                              <span>{incident.cameraStatus}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Araç Durumu:</span>
                              <span>{incident.vehicleStatus}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="text-center transform transition-all duration-200 hover:scale-105">
                  <p className="text-gray-600">Toplam İhbar</p>
                  <p className="text-2xl font-bold text-blue-600">{incidents.length}</p>
                </div>
                <div className="text-center transform transition-all duration-200 hover:scale-105">
                  <p className="text-gray-600">Çözülen İhbar</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plaka Veritabanı Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all duration-300 animate-slideIn">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">Plaka Veritabanı</h3>
              </div>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Yeni Plaka Ekle</h4>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Plaka"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value.toUpperCase()})}
                  className="rounded-md border-gray-300 transition-all duration-200"
                />
                <input
                  type="text"
                  placeholder="Sahibi"
                  value={newVehicle.ownerName}
                  onChange={(e) => setNewVehicle({...newVehicle, ownerName: e.target.value})}
                  className="rounded-md border-gray-300 transition-all duration-200"
                />
                <input
                  type="text"
                  placeholder="Araç Modeli"
                  value={newVehicle.vehicleModel}
                  onChange={(e) => setNewVehicle({...newVehicle, vehicleModel: e.target.value})}
                  className="rounded-md border-gray-300 transition-all duration-200"
                />
              </div>
              <button
                onClick={() => {
                  if (newVehicle.plateNumber && newVehicle.ownerName && newVehicle.vehicleModel) {
                    addVehicleData(newVehicle);
                    setNewVehicle({ plateNumber: '', ownerName: '', vehicleModel: '' });
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                Ekle
              </button>
            </div>

            <div className="overflow-auto max-h-96">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Plaka</th>
                    <th className="px-4 py-2 text-left">Sahibi</th>
                    <th className="px-4 py-2 text-left">Araç Modeli</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleDatabase.map((vehicle) => (
                    <tr key={vehicle.plateNumber} className="border-t hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-2">{vehicle.plateNumber}</td>
                      <td className="px-4 py-2">{vehicle.ownerName}</td>
                      <td className="px-4 py-2">{vehicle.vehicleModel}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeVehicleData(vehicle.plateNumber)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-center py-3">
        <p className="text-sm">© 2024 Kromatik Zihinler. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
};