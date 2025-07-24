import React from 'react';
import { Palette } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Palette className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dynamic Canvas Studio</h1>
          <p className="text-sm text-gray-500">Create dynamic templates with customizable elements</p>
        </div>
      </div>
    </header>
  );
};