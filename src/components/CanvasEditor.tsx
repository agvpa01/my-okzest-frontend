import React, { useRef, useCallback } from 'react';
import { CanvasConfig, CanvasElement } from '../types/canvas';
import { DraggableElement } from './DraggableElement';
import { BackgroundImage } from './BackgroundImage';

interface CanvasEditorProps {
  config: CanvasConfig;
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  onElementSelect: (element: CanvasElement | null) => void;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  urlParams?: Record<string, string>;
  isBackgroundSelected?: boolean;
  onBackgroundSelect?: () => void;
  onConfigUpdate?: (updates: Partial<CanvasConfig>) => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  config,
  elements,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  urlParams = {},
  isBackgroundSelected = false,
  onBackgroundSelect,
  onConfigUpdate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  const scale = Math.min(1, 800 / Math.max(config.width, config.height));

  return (
    <div className="flex items-center justify-center min-h-full">
      <div 
        className="relative bg-white shadow-lg border border-gray-300 overflow-hidden"
        style={{
          width: config.width * scale,
          height: config.height * scale,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-pointer"
          onClick={handleCanvasClick}
          style={{
            width: config.width,
            height: config.height,
          }}
        >
          {/* Background Image Component */}
          {config.backgroundImage && onBackgroundSelect && onConfigUpdate && (
            <BackgroundImage
              config={config}
              isSelected={isBackgroundSelected}
              onSelect={onBackgroundSelect}
              onUpdate={onConfigUpdate}
              canvasWidth={config.width}
              canvasHeight={config.height}
            />
          )}
          
          {/* Canvas Elements */}
          {elements.map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              isSelected={selectedElement?.id === element.id}
              onSelect={() => onElementSelect(element)}
              onUpdate={(updates) => onElementUpdate(element.id, updates)}
              canvasWidth={config.width}
              canvasHeight={config.height}
              urlParams={urlParams}
            />
          ))}
        </div>
      </div>
    </div>
  );
};