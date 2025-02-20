import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-white text-center">
        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-semibold">Yükleniyor...</h2>
      </div>
    </div>
  );
};