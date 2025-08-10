import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Calendar } from 'lucide-react';
import { CanvasConfig, CanvasElement } from '../types/canvas';
import { apiService, CanvasTemplate } from '../services/api';

interface LoadTemplateModalProps {
  onClose: () => void;
  onLoad: (config: CanvasConfig, elements: CanvasElement[], templateId?: string, templateName?: string, categoryId?: string) => void;
}

export function LoadTemplateModal({ onClose, onLoad }: LoadTemplateModalProps) {
  const [templates, setTemplates] = useState<CanvasTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTemplates = await apiService.getTemplates();
      // Ensure we always have an array
      setTemplates(Array.isArray(fetchedTemplates) ? fetchedTemplates : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      setTemplates([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTemplate = async (template: CanvasTemplate) => {
    try {
      const fullTemplate = await apiService.getTemplate(template.id);
      onLoad(fullTemplate.config, fullTemplate.elements, fullTemplate.id, fullTemplate.name, fullTemplate.category_id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setDeletingId(templateId);
      await apiService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Load Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Create your first template by saving your current canvas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(templates) && templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Canvas: {template.config.width} × {template.config.height}px</p>
                        <p>Elements: {template.elements.length}</p>
                        <p>Variables: {template.variables?.length || 0}</p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Created: {formatDate(template.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleLoadTemplate(template)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={deletingId === template.id}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}