import React, { useRef, useCallback, useState } from 'react';
import { CanvasElement } from '../types/canvas';

interface DraggableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  canvasWidth: number;
  canvasHeight: number;
  urlParams?: Record<string, string>;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  canvasWidth,
  canvasHeight,
  urlParams = {},
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  }, [element.x, element.y, onSelect]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (element.data.type !== 'image' && element.data.type !== 'text') return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    if (element.data.type === 'image') {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.data.width,
        height: element.data.height,
      });
    } else if (element.data.type === 'text') {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.data.width || 200,
        height: element.data.height || 50,
      });
    }
  }, [element.data]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      // Get actual element dimensions - use rendered dimensions when available
      let elementWidth = element.data.width || (element.data.type === 'text' ? 200 : 150);
      let elementHeight = element.data.height || (element.data.type === 'text' ? 50 : 100);
      
      // For better accuracy, use actual rendered dimensions if available
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        if (!element.data.width) {
          elementWidth = rect.width;
        }
        if (!element.data.height) {
          elementHeight = rect.height;
        }
      }
      
      // Calculate new position with proper boundary constraints
      const newX = Math.max(0, Math.min(canvasWidth - elementWidth, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(canvasHeight - elementHeight, e.clientY - dragStart.y));
      
      onUpdate({ x: newX, y: newY });
    } else if (isResizing && (element.data.type === 'image' || element.data.type === 'text')) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = element.x;
      let newY = element.y;
      
      // Handle width changes with canvas boundary constraints
      if (resizeHandle.includes('right')) {
        const maxWidth = canvasWidth - element.x;
        newWidth = Math.max(20, Math.min(maxWidth, resizeStart.width + deltaX));
      }
      if (resizeHandle.includes('left')) {
        const maxWidthIncrease = element.x;
        const proposedWidth = Math.max(20, resizeStart.width - deltaX);
        const actualWidthIncrease = proposedWidth - resizeStart.width;
        const constrainedWidthIncrease = Math.min(actualWidthIncrease, maxWidthIncrease);
        newWidth = resizeStart.width + constrainedWidthIncrease;
        newX = element.x - constrainedWidthIncrease;
      }
      
      // Handle height changes with canvas boundary constraints
      if (resizeHandle.includes('bottom')) {
        const maxHeight = canvasHeight - element.y;
        newHeight = Math.max(20, Math.min(maxHeight, resizeStart.height + deltaY));
      }
      if (resizeHandle.includes('top')) {
        const maxHeightIncrease = element.y;
        const proposedHeight = Math.max(20, resizeStart.height - deltaY);
        const actualHeightIncrease = proposedHeight - resizeStart.height;
        const constrainedHeightIncrease = Math.min(actualHeightIncrease, maxHeightIncrease);
        newHeight = resizeStart.height + constrainedHeightIncrease;
        newY = element.y - constrainedHeightIncrease;
      }
      
      // Additional boundary check to ensure element stays within canvas after resize
      // This handles edge cases where corner resizing might still go out of bounds
      if (newX + newWidth > canvasWidth) {
        newWidth = canvasWidth - newX;
      }
      if (newY + newHeight > canvasHeight) {
        newHeight = canvasHeight - newY;
      }
      if (newX < 0) {
        newWidth = newWidth + newX;
        newX = 0;
      }
      if (newY < 0) {
        newHeight = newHeight + newY;
        newY = 0;
      }
      
      // Ensure minimum dimensions are maintained
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);
      
      const updates: Partial<CanvasElement> = {
        data: {
          ...element.data,
          width: newWidth,
          height: newHeight,
        },
      };
      
      // Only update position if it changed
      if (newX !== element.x || newY !== element.y) {
        updates.x = newX;
        updates.y = newY;
      }
      
      onUpdate(updates);
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeHandle, onUpdate, canvasWidth, canvasHeight, element.data]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const renderContent = () => {
    const variableValue = urlParams[element.variableName];
    
    if (element.data.type === 'text') {
      return (
        <div
          style={{
            fontSize: element.data.fontSize,
            fontFamily: element.data.fontFamily,
            fontWeight: element.data.fontWeight,
            color: element.data.color,
            textAlign: element.data.textAlign,
            letterSpacing: element.data.letterSpacing || 'normal',
            width: element.data.width ? `${element.data.width}px` : 'auto',
            height: element.data.height ? `${element.data.height}px` : 'auto',
            whiteSpace: element.data.width ? 'normal' : 'nowrap',
            wordWrap: 'break-word',
            overflow: 'hidden',
            display: 'flex',
            alignItems: element.data.height ? 'center' : 'flex-start',
            justifyContent: element.data.textAlign === 'center' ? 'center' : element.data.textAlign === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          <div style={{ 
            textAlign: element.data.textAlign, 
            width: '100%',
            textShadow: element.data.strokeWidth && element.data.strokeColor && element.data.strokeWidth > 0
              ? `${element.data.strokeWidth}px 0 0 ${element.data.strokeColor}, -${element.data.strokeWidth}px 0 0 ${element.data.strokeColor}, 0 ${element.data.strokeWidth}px 0 ${element.data.strokeColor}, 0 -${element.data.strokeWidth}px 0 ${element.data.strokeColor}, ${element.data.strokeWidth}px ${element.data.strokeWidth}px 0 ${element.data.strokeColor}, -${element.data.strokeWidth}px -${element.data.strokeWidth}px 0 ${element.data.strokeColor}, ${element.data.strokeWidth}px -${element.data.strokeWidth}px 0 ${element.data.strokeColor}, -${element.data.strokeWidth}px ${element.data.strokeWidth}px 0 ${element.data.strokeColor}`
              : 'none'
          }}>
            {variableValue || element.data.content || `{${element.variableName}}`}
          </div>
        </div>
      );
    } else {
      return (
        <img
          src={variableValue || element.data.src || 'https://via.placeholder.com/150x100?text=Image'}
          alt={element.variableName}
          style={{
            width: element.data.width,
            height: element.data.height,
            objectFit: element.data.objectFit,
          }}
          className="block"
        />
      );
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${isDragging ? 'z-50' : 'z-10'}`}
      style={{
        left: element.x,
        top: element.y,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      
      {isSelected && (
        <>
          <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {element.variableName}
          </div>
          
          {(element.data.type === 'image' || element.data.type === 'text') && (
            <>
              {/* Corner resize handles */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
              />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
              />
              
              {/* Edge resize handles */}
              <div
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-n-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
              />
              <div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-s-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
              />
              <div
                className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-w-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
              />
              <div
                className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-e-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};