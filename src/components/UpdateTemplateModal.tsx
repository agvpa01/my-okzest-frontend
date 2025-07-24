import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { CanvasConfig, CanvasElement } from '../types/canvas';
import { apiService } from '../services/api';

interface UpdateTemplateModalProps {
  templateId: string;
  currentName: string;
  config: CanvasConfig;
  elements: CanvasElement[];
  onClose: () => void;
  onUpdated: () => void;
}

export function UpdateTemplateModal({ 
  templateId, 
  currentName, 
  config, 
  elements, 
  onClose, 
  onUpdated 
}: UpdateTemplateModalProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await apiService.updateTemplate(templateId, {
        name: name.trim(),
        config,
        elements
      });
      
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Update Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter template name"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Template Info</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Canvas: {config.width} × {config.height}px</p>
              <p>Elements: {elements.length}</p>
              <p>Variables: {elements.filter(el => el.variableName).length}</p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Updating...' : 'Update Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}