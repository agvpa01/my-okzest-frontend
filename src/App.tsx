import React, { useState, useCallback, useEffect } from 'react';
import { CanvasEditor } from './components/CanvasEditor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PreviewModal } from './components/PreviewModal';
import { ExportModal } from './components/ExportModal';
import { SaveTemplateModal } from './components/SaveTemplateModal';
import { LoadTemplateModal } from './components/LoadTemplateModal';
import { UpdateTemplateModal } from './components/UpdateTemplateModal';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { CanvasElement, CanvasConfig } from './types/canvas';
import { Eye, Download, Settings, Save, Upload, RefreshCw, ArrowLeft, LayoutDashboard } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    width: 800,
    height: 600,
    backgroundImage: '',
  });

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [isBackgroundSelected, setIsBackgroundSelected] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showLoadTemplate, setShowLoadTemplate] = useState(false);
  const [showUpdateTemplate, setShowUpdateTemplate] = useState(false);
  const [currentTemplateName, setCurrentTemplateName] = useState<string>('');
  const [showSettings, setShowSettings] = useState(true);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});

  // Function to constrain elements within canvas boundaries
  const constrainElementsToCanvas = useCallback((newCanvasConfig: CanvasConfig, currentElements: CanvasElement[]) => {
    return currentElements.map(element => {
      const elementWidth = element.data.width || 100;
      const elementHeight = element.data.height || 50;
      
      // Calculate maximum allowed positions
      const maxX = Math.max(0, newCanvasConfig.width - elementWidth);
      const maxY = Math.max(0, newCanvasConfig.height - elementHeight);
      
      // Constrain element position within canvas bounds
      const constrainedX = Math.min(Math.max(0, element.x), maxX);
      const constrainedY = Math.min(Math.max(0, element.y), maxY);
      
      // Only update if position changed
      if (constrainedX !== element.x || constrainedY !== element.y) {
        return {
          ...element,
          x: constrainedX,
          y: constrainedY
        };
      }
      
      return element;
    });
  }, []);

  // Parse URL parameters on component mount and when URL changes
  useEffect(() => {
    const parseUrlParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      setUrlParams(params);
    };

    parseUrlParams();
    
    // Listen for URL changes (e.g., when user manually changes URL)
    const handlePopState = () => {
      parseUrlParams();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const addElement = useCallback((element: Omit<CanvasElement, 'id'>) => {
    const newElement: CanvasElement = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    if (selectedElement?.id === id) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedElement]);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const duplicateElement = useCallback((element: CanvasElement) => {
    const newElement: CanvasElement = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: element.x + 20,
      y: element.y + 20,
      variableName: `${element.variableName}_copy`,
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  }, []);

  const handleCanvasConfigChange = useCallback((newConfig: CanvasConfig) => {
    // Check if canvas size changed
    const sizeChanged = newConfig.width !== canvasConfig.width || newConfig.height !== canvasConfig.height;
    
    if (sizeChanged) {
      // Constrain elements to new canvas boundaries
      const constrainedElements = constrainElementsToCanvas(newConfig, elements);
      setElements(constrainedElements);
      
      // Update selected element if it was constrained
      if (selectedElement) {
        const constrainedSelected = constrainedElements.find(el => el.id === selectedElement.id);
        if (constrainedSelected && (constrainedSelected.x !== selectedElement.x || constrainedSelected.y !== selectedElement.y)) {
          setSelectedElement(constrainedSelected);
        }
      }
    }
    
    setCanvasConfig(newConfig);
  }, [canvasConfig, elements, selectedElement, constrainElementsToCanvas]);

  const loadTemplate = useCallback((config: CanvasConfig, elements: CanvasElement[], templateId?: string, templateName?: string) => {
    setCanvasConfig(config);
    setElements(elements);
    setSelectedElement(null);
    setCurrentTemplateId(templateId || null);
    setCurrentTemplateName(templateName || '');
    setCurrentView('editor');
    
    // Update URL with template ID if provided
    if (templateId) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('template', templateId);
      window.history.pushState({}, '', newUrl.toString());
    }
  }, []);

  const createNewTemplate = useCallback(() => {
    setCanvasConfig({
      width: 800,
      height: 600,
      backgroundImage: '',
    });
    setElements([]);
    setSelectedElement(null);
    setCurrentTemplateId(null);
    setCurrentTemplateName('');
    setCurrentView('editor');
  }, []);

  const goToDashboard = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  const handleTemplateUpdated = useCallback(() => {
    console.log('Template updated successfully!');
  }, []);

  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        onLoadTemplate={loadTemplate}
        onCreateNew={createNewTemplate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Properties Panel */}
        <div className={`transition-all duration-300 ${showSettings ? 'w-80' : 'w-0'} overflow-hidden bg-white border-r border-gray-200`}>
          <PropertiesPanel
            canvasConfig={canvasConfig}
            onCanvasConfigChange={handleCanvasConfigChange}
            selectedElement={selectedElement}
            onElementUpdate={updateElement}
            onElementDelete={deleteElement}
            onElementDuplicate={duplicateElement}
            onAddElement={addElement}
            elements={elements}
            isBackgroundSelected={isBackgroundSelected}
            onElementSelect={(element) => {
              setSelectedElement(element);
              setIsBackgroundSelected(false);
            }}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToDashboard}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Dashboard</span>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500">
                Canvas: {canvasConfig.width} × {canvasConfig.height}px
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLoadTemplate(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Load</span>
              </button>
              <button
                onClick={() => setShowSaveTemplate(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              {currentTemplateId && (
                <button
                  onClick={() => setShowUpdateTemplate(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Update</span>
                </button>
              )}
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Canvas Editor */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <CanvasEditor
              config={canvasConfig}
              elements={elements}
              selectedElement={selectedElement}
              onElementSelect={(element) => {
                setSelectedElement(element);
                setIsBackgroundSelected(false);
              }}
              onElementUpdate={updateElement}
              urlParams={urlParams}
              isBackgroundSelected={isBackgroundSelected}
              onBackgroundSelect={() => {
                setSelectedElement(null);
                setIsBackgroundSelected(true);
              }}
              onConfigUpdate={handleCanvasConfigChange}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPreview && (
        <PreviewModal
          config={canvasConfig}
          elements={elements}
          onClose={() => setShowPreview(false)}
          templateId={currentTemplateId || undefined}
        />
      )}

      {showExport && (
        <ExportModal
          config={canvasConfig}
          elements={elements}
          onClose={() => setShowExport(false)}
          templateId={currentTemplateId || undefined}
        />
      )}

      {showSaveTemplate && (
        <SaveTemplateModal
           config={canvasConfig}
           elements={elements}
           onClose={() => setShowSaveTemplate(false)}
           onSaved={(templateId) => {
             setCurrentTemplateId(templateId);
             console.log('Template saved with ID:', templateId);
           }}
         />
      )}

      {showLoadTemplate && (
        <LoadTemplateModal
          onClose={() => setShowLoadTemplate(false)}
          onLoad={loadTemplate}
        />
      )}

      {showUpdateTemplate && currentTemplateId && (
        <UpdateTemplateModal
          templateId={currentTemplateId}
          currentName={currentTemplateName}
          config={canvasConfig}
          elements={elements}
          onClose={() => setShowUpdateTemplate(false)}
          onUpdated={handleTemplateUpdated}
        />
      )}
    </div>
  );
}

export default App;