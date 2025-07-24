import React, { useState, useRef } from 'react';
import { CanvasConfig, CanvasElement } from '../types/canvas';
import { X, Copy, ExternalLink, Server } from 'lucide-react';
import { renderCanvas } from '../utils/canvasRenderer';
import { apiService } from '../services/api';

interface PreviewModalProps {
  config: CanvasConfig;
  elements: CanvasElement[];
  onClose: () => void;
  templateId?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  config,
  elements,
  onClose,
  templateId,
}) => {
  const [params, setParams] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const generateURL = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const queryString = new URLSearchParams(params).toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  const generateBackendURL = () => {
    if (!templateId) return '';
    return apiService.getRenderUrl(templateId, params);
  };

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(generateURL());
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleParamChange = (variableName: string, value: string) => {
    setParams(prev => ({
      ...prev,
      [variableName]: value,
    }));
  };

  const openPreview = () => {
    window.open(generateURL(), '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Preview & Share</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parameters */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dynamic Parameters</h3>
              <div className="space-y-4">
                {elements.map((element) => (
                  <div key={element.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {element.variableName}
                    </label>
                    {element.data.type === 'text' ? (
                      <input
                        type="text"
                        value={params[element.variableName] || element.data.content}
                        onChange={(e) => handleParamChange(element.variableName, e.target.value)}
                        placeholder={element.data.content}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <input
                        type="url"
                        value={params[element.variableName] || element.data.src}
                        onChange={(e) => handleParamChange(element.variableName, e.target.value)}
                        placeholder={element.data.src || 'https://example.com/image.jpg'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Frontend Preview URL</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={generateURL()}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      onClick={copyURL}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={openPreview}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {templateId && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Server className="w-4 h-4" />
                      <span>Backend Render URL</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={generateBackendURL()}
                        readOnly
                        className="flex-1 px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-sm"
                      />
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(generateBackendURL());
                            alert('Backend URL copied to clipboard!');
                          } catch (err) {
                            console.error('Failed to copy URL:', err);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Copy Backend URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(generateBackendURL(), '_blank')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                        title="Open backend render in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      This URL renders the image on the server and returns SVG format
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                {renderCanvas(config, elements, params, 400)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};