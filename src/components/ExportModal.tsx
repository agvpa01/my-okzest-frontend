import React, { useState, useRef } from 'react';
import { CanvasConfig, CanvasElement } from '../types/canvas';
import { X, Download, Code } from 'lucide-react';
import { renderCanvas } from '../utils/canvasRenderer';
import { apiService } from '../services/api';

interface ExportModalProps {
  config: CanvasConfig;
  elements: CanvasElement[];
  onClose: () => void;
  templateId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  config,
  elements,
  onClose,
  templateId,
}) => {
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateEmbedCode = () => {
    if (!templateId) {
      return '<!-- Please save the template first to generate embed code -->';
    }
    
    // Create clear placeholder parameters for the variables
    const exampleParams: Record<string, string> = {};
    elements.forEach(el => {
      exampleParams[el.variableName] = 'REPLACE_ME';
    });
    
    const renderUrl = apiService.getRenderUrl(templateId, exampleParams);
    return `<img src="${renderUrl}" alt="Dynamic Canvas" />`;
  };

  const exportCanvas = async () => {
    try {
      // Create a temporary canvas for export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = config.width;
      canvas.height = config.height;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background image if exists
      if (config.backgroundImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          drawElements();
        };
        img.src = config.backgroundImage;
      } else {
        drawElements();
      }

      const drawElements = () => {
        elements.forEach((element) => {
          if (element.data.type === 'text') {
            ctx.font = `${element.data.fontWeight} ${element.data.fontSize}px ${element.data.fontFamily}`;
            ctx.fillStyle = element.data.color;
            ctx.textAlign = element.data.textAlign as CanvasTextAlign;
            if (element.data.letterSpacing && element.data.letterSpacing !== 'normal') {
              ctx.letterSpacing = element.data.letterSpacing;
            }
            ctx.fillText(element.data.content || `{${element.variableName}}`, element.x, element.y + element.data.fontSize);
          } else if (element.data.type === 'image' && element.data.src) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, element.x, element.y, element.data.width, element.data.height);
            };
            img.src = element.data.src;
          }
        });

        // Export canvas
        const link = document.createElement('a');
        link.download = `canvas.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      };
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      alert('Embed code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy embed code:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Export Canvas</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Export Format</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="png"
                  checked={format === 'png'}
                  onChange={(e) => setFormat(e.target.value as 'png')}
                  className="mr-2"
                />
                PNG (Transparent background)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="jpg"
                  checked={format === 'jpg'}
                  onChange={(e) => setFormat(e.target.value as 'jpg')}
                  className="mr-2"
                />
                JPG (White background)
              </label>
            </div>
          </div>

          {/* Export Button */}
          <div>
            <button
              onClick={exportCanvas}
              className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Canvas as {format.toUpperCase()}
            </button>
          </div>

          {/* Embed Code */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Embed Code</h3>
            <div className="relative">
              <textarea
                value={generateEmbedCode()}
                readOnly
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono resize-none"
              />
              <button
                onClick={copyEmbedCode}
                className="absolute top-2 right-2 p-2 text-gray-600 hover:bg-gray-200 rounded"
                title="Copy embed code"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">How to use this embed code:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy the HTML code above</li>
                <li>Paste it into your website where you want the image to appear</li>
                <li>Replace each "REPLACE_ME" with your actual dynamic values</li>
                <li>The image will automatically update based on the values you provide</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">
                <strong>Example:</strong> Change "variable1=REPLACE_ME" to "variable1=Hello%20World"
              </p>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              {renderCanvas(config, elements, {}, 400)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};