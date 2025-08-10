import React, { useState } from 'react';
import { CanvasConfig, CanvasElement, TextElement, ImageElement } from '../types/canvas';
import { Type, Image, Upload, Plus, Trash2, Copy } from 'lucide-react';
import { apiService } from '../services/api';

interface PropertiesPanelProps {
  canvasConfig: CanvasConfig;
  onCanvasConfigChange: (config: CanvasConfig) => void;
  selectedElement: CanvasElement | null;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDelete: (id: string) => void;
  onElementDuplicate: (element: CanvasElement) => void;
  onAddElement: (element: Omit<CanvasElement, 'id'>) => void;
  elements: CanvasElement[];
  isBackgroundSelected?: boolean;
  onElementSelect?: (element: CanvasElement) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  canvasConfig,
  onCanvasConfigChange,
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onAddElement,
  elements,
  isBackgroundSelected = false,
  onElementSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'elements' | 'list'>('canvas');

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { url } = await apiService.uploadImage(file);
        onCanvasConfigChange({
          ...canvasConfig,
          backgroundImage: url,
        });
      } catch (error) {
        console.error('Failed to upload background image:', error);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const addTextElement = () => {
    const variableName = `text_${elements.length + 1}`;
    onAddElement({
      x: 50,
      y: 50,
      variableName,
      data: {
        type: 'text',
        content: 'Sample Text',
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        letterSpacing: 'normal',
        width: 200,
        height: 50,
        strokeColor: '#000000',
        strokeWidth: 0,
      } as TextElement,
    });
  };

  const addImageElement = () => {
    const variableName = `image_${elements.length + 1}`;
    onAddElement({
      x: 50,
      y: 50,
      variableName,
      data: {
        type: 'image',
        src: '',
        width: 150,
        height: 100,
        objectFit: 'cover',
      } as ImageElement,
    });
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, updates);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'canvas'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Canvas
        </button>
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'elements'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Elements
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          List
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'canvas' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Canvas Settings</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={canvasConfig.width}
                      onChange={(e) => onCanvasConfigChange({
                        ...canvasConfig,
                        width: parseInt(e.target.value) || 800
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={canvasConfig.height}
                      onChange={(e) => onCanvasConfigChange({
                        ...canvasConfig,
                        height: parseInt(e.target.value) || 600
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <label className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="text-sm">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundUpload}
                          className="hidden"
                        />
                      </label>
                      {canvasConfig.backgroundImage && (
                        <button
                          onClick={() => onCanvasConfigChange({ ...canvasConfig, backgroundImage: '' })}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Or enter image URL..."
                        value={canvasConfig.backgroundImage?.startsWith('http') ? canvasConfig.backgroundImage : ''}
                        onChange={(e) => onCanvasConfigChange({
                          ...canvasConfig,
                          backgroundImage: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Elements</h3>
              <div className="space-y-3">
                <button
                  onClick={addTextElement}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Add Text Element
                </button>
                <button
                  onClick={addImageElement}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Add Image Element
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="space-y-4">
            {isBackgroundSelected ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Background Image Properties
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={canvasConfig.backgroundImageX || 0}
                        onChange={(e) => onCanvasConfigChange({
                          ...canvasConfig,
                          backgroundImageX: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={canvasConfig.backgroundImageY || 0}
                        onChange={(e) => onCanvasConfigChange({
                          ...canvasConfig,
                          backgroundImageY: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width
                      </label>
                      <input
                        type="number"
                        value={canvasConfig.backgroundImageWidth || canvasConfig.width}
                        onChange={(e) => onCanvasConfigChange({
                          ...canvasConfig,
                          backgroundImageWidth: parseInt(e.target.value) || canvasConfig.width
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height
                      </label>
                      <input
                        type="number"
                        value={canvasConfig.backgroundImageHeight || canvasConfig.height}
                        onChange={(e) => onCanvasConfigChange({
                          ...canvasConfig,
                          backgroundImageHeight: parseInt(e.target.value) || canvasConfig.height
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Object Fit
                    </label>
                    <select
                      value={canvasConfig.backgroundImageObjectFit || 'cover'}
                      onChange={(e) => onCanvasConfigChange({
                        ...canvasConfig,
                        backgroundImageObjectFit: e.target.value as 'cover' | 'contain' | 'fill' | 'none'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="fill">Fill</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : selectedElement ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Element
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onElementDuplicate(selectedElement)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onElementDelete(selectedElement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variable Name
                    </label>
                    <input
                      type="text"
                      value={selectedElement.variableName}
                      onChange={(e) => updateSelectedElement({ variableName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {selectedElement.data.type === 'text' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Text Content
                        </label>
                        <input
                          type="text"
                          value={selectedElement.data.content}
                          onChange={(e) => updateSelectedElement({ 
                            data: { ...selectedElement.data, content: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Font Size
                          </label>
                          <input
                            type="number"
                            value={selectedElement.data.fontSize}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, fontSize: parseInt(e.target.value) || 16 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                          </label>
                          <input
                            type="color"
                            value={selectedElement.data.color}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, color: e.target.value }
                            })}
                            className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Font Family
                        </label>
                        <select
                          value={selectedElement.data.fontFamily}
                          onChange={(e) => updateSelectedElement({ 
                            data: { ...selectedElement.data, fontFamily: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <optgroup label="Sans Serif">
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Calibri, sans-serif">Calibri</option>
                            <option value="Tahoma, sans-serif">Tahoma</option>
                            <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                            <option value="Lucida Sans Unicode, sans-serif">Lucida Sans Unicode</option>
                            <option value="Franklin Gothic Medium, sans-serif">Franklin Gothic Medium</option>
                            <option value="Century Gothic, sans-serif">Century Gothic</option>
                            <option value="Futura, sans-serif">Futura</option>
                            <option value="Gill Sans, sans-serif">Gill Sans</option>
                            <option value="Optima, sans-serif">Optima</option>
                          </optgroup>
                          <optgroup label="Serif">
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Times, serif">Times</option>
                            <option value="Palatino, serif">Palatino</option>
                            <option value="Book Antiqua, serif">Book Antiqua</option>
                            <option value="Baskerville, serif">Baskerville</option>
                            <option value="Garamond, serif">Garamond</option>
                            <option value="Minion Pro, serif">Minion Pro</option>
                            <option value="Cambria, serif">Cambria</option>
                            <option value="Caslon, serif">Caslon</option>
                          </optgroup>
                          <optgroup label="Monospace">
                            <option value="Courier New, monospace">Courier New</option>
                            <option value="Monaco, monospace">Monaco</option>
                            <option value="Consolas, monospace">Consolas</option>
                            <option value="Menlo, monospace">Menlo</option>
                            <option value="Source Code Pro, monospace">Source Code Pro</option>
                            <option value="Fira Code, monospace">Fira Code</option>
                            <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                            <option value="Roboto Mono, monospace">Roboto Mono</option>
                          </optgroup>
                          <optgroup label="Display & Decorative">
                            <option value="Impact, sans-serif">Impact</option>
                            <option value="Arial Black, sans-serif">Arial Black</option>
                            <option value="Bebas Neue, sans-serif">Bebas Neue</option>
                            <option value="Oswald, sans-serif">Oswald</option>
                            <option value="Montserrat, sans-serif">Montserrat</option>
                            <option value="Playfair Display, serif">Playfair Display</option>
                            <option value="Merriweather, serif">Merriweather</option>
                            <option value="Lora, serif">Lora</option>
                            <option value="Raleway, sans-serif">Raleway</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Lato, sans-serif">Lato</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                            <option value="Nunito, sans-serif">Nunito</option>
                            <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                          </optgroup>
                          <optgroup label="Script & Handwriting">
                            <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                            <option value="Brush Script MT, cursive">Brush Script MT</option>
                            <option value="Lucida Handwriting, cursive">Lucida Handwriting</option>
                            <option value="Dancing Script, cursive">Dancing Script</option>
                            <option value="Pacifico, cursive">Pacifico</option>
                            <option value="Great Vibes, cursive">Great Vibes</option>
                            <option value="Satisfy, cursive">Satisfy</option>
                            <option value="Kaushan Script, cursive">Kaushan Script</option>
                            <option value="Amatic SC, cursive">Amatic SC</option>
                            <option value="Caveat, cursive">Caveat</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Font Weight
                        </label>
                        <select
                          value={selectedElement.data.fontWeight}
                          onChange={(e) => updateSelectedElement({ 
                            data: { ...selectedElement.data, fontWeight: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="lighter">Lighter</option>
                          <option value="100">100</option>
                          <option value="200">200</option>
                          <option value="300">300</option>
                          <option value="400">400</option>
                          <option value="500">500</option>
                          <option value="600">600</option>
                          <option value="700">700</option>
                          <option value="800">800</option>
                          <option value="900">900</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Letter Spacing
                        </label>
                        <select
                          value={selectedElement.data.letterSpacing || 'normal'}
                          onChange={(e) => updateSelectedElement({ 
                            data: { ...selectedElement.data, letterSpacing: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="-0.05em">Tight (-0.05em)</option>
                          <option value="-0.025em">Slightly Tight (-0.025em)</option>
                          <option value="normal">Normal</option>
                          <option value="0.025em">Slightly Wide (0.025em)</option>
                          <option value="0.05em">Wide (0.05em)</option>
                          <option value="0.1em">Extra Wide (0.1em)</option>
                          <option value="0.15em">Ultra Wide (0.15em)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Text Align
                        </label>
                        <select
                          value={selectedElement.data.textAlign}
                          onChange={(e) => updateSelectedElement({ 
                            data: { ...selectedElement.data, textAlign: e.target.value as 'left' | 'center' | 'right' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stroke Color
                          </label>
                          <input
                            type="color"
                            value={selectedElement.data.strokeColor || '#000000'}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, strokeColor: e.target.value }
                            })}
                            className="w-full h-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stroke Width
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={selectedElement.data.strokeWidth || 0}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, strokeWidth: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Width
                          </label>
                          <input
                            type="number"
                            value={selectedElement.data.width || 200}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, width: parseInt(e.target.value) || 200 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Height
                          </label>
                          <input
                            type="number"
                            value={selectedElement.data.height || 50}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, height: parseInt(e.target.value) || 50 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedElement.data.type === 'image' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image Source
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <label className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                              <Upload className="w-4 h-4 mr-2" />
                              <span className="text-sm">Upload Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const { url } = await apiService.uploadImage(file);
                                      updateSelectedElement({ 
                                        data: { ...selectedElement.data, src: url }
                                      });
                                    } catch (error) {
                                      console.error('Failed to upload image:', error);
                                      alert('Failed to upload image. Please try again.');
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            {selectedElement.data.src && (
                              <button
                                onClick={() => updateSelectedElement({ 
                                  data: { ...selectedElement.data, src: '' }
                                })}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="url"
                              value={selectedElement.data.src?.startsWith('http') ? selectedElement.data.src : ''}
                              onChange={(e) => updateSelectedElement({ 
                                data: { ...selectedElement.data, src: e.target.value }
                              })}
                              placeholder="Or enter image URL..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Width
                          </label>
                          <input
                            type="number"
                            value={selectedElement.data.width}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, width: parseInt(e.target.value) || 100 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Height
                          </label>
                          <input
                            type="number"
                            value={selectedElement.data.height}
                            onChange={(e) => updateSelectedElement({ 
                              data: { ...selectedElement.data, height: parseInt(e.target.value) || 100 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Object Fit
                        </label>
                        <select
                          value={selectedElement.data.objectFit}
                          onChange={(e) => updateSelectedElement({ 
                            data: { ...selectedElement.data, objectFit: e.target.value as 'cover' | 'contain' | 'fill' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="fill">Fill</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Plus className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">Select an element or background image to edit properties</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">All Elements</h3>
              
              {elements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Plus className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No elements added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add text or image elements from the Canvas tab</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {elements.map((element, index) => (
                    <div
                      key={element.id}
                      onClick={() => onElementSelect?.(element)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedElement?.id === element.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {element.data.type === 'text' ? (
                              <Type className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Image className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {element.variableName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {element.data.type === 'text' 
                                ? `"${(element.data as TextElement).content}"`
                                : `${element.data.width}×${element.data.height}px`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onElementDuplicate(element);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onElementDelete(element.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Position: ({element.x}, {element.y})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};