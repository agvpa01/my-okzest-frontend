import React, { useState, useCallback, useEffect } from 'react';
import { CanvasConfig } from '../types/canvas';

interface BackgroundImageProps {
  config: CanvasConfig;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasConfig>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  config,
  isSelected,
  onSelect,
  onUpdate,
  canvasWidth,
  canvasHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);

  // Default values for background image positioning
  const bgX = config.backgroundImageX || 0;
  const bgY = config.backgroundImageY || 0;
  const bgWidth = config.backgroundImageWidth || canvasWidth;
  const bgHeight = config.backgroundImageHeight || canvasHeight;
  const bgObjectFit = config.backgroundImageObjectFit || 'cover';

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: bgX,
      elementY: bgY,
    });
  }, [bgX, bgY, onSelect]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: bgWidth,
      height: bgHeight,
      elementX: bgX,
      elementY: bgY,
    });
  }, [bgWidth, bgHeight, bgX, bgY]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const newX = Math.max(0, Math.min(canvasWidth - bgWidth, dragStart.elementX + deltaX));
      const newY = Math.max(0, Math.min(canvasHeight - bgHeight, dragStart.elementY + deltaY));
      
      onUpdate({
        backgroundImageX: newX,
        backgroundImageY: newY,
      });
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.elementX;
      let newY = resizeStart.elementY;
      
      // Handle different resize directions
      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'n':
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'ne':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'e':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          break;
        case 'se':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 's':
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          break;
        case 'w':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          break;
      }
      
      // Ensure the image stays within canvas bounds
      newX = Math.max(0, Math.min(canvasWidth - newWidth, newX));
      newY = Math.max(0, Math.min(canvasHeight - newHeight, newY));
      newWidth = Math.min(newWidth, canvasWidth - newX);
      newHeight = Math.min(newHeight, canvasHeight - newY);
      
      const updates: Partial<CanvasConfig> = {
        backgroundImageWidth: newWidth,
        backgroundImageHeight: newHeight,
      };
      
      if (newX !== resizeStart.elementX) {
        updates.backgroundImageX = newX;
      }
      if (newY !== resizeStart.elementY) {
        updates.backgroundImageY = newY;
      }
      
      onUpdate(updates);
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeHandle, bgWidth, bgHeight, canvasWidth, canvasHeight, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (!config.backgroundImage) {
    return null;
  }

  const getCursorStyle = (handle: ResizeHandle): string => {
    const cursors = {
      nw: 'nw-resize',
      n: 'n-resize',
      ne: 'ne-resize',
      e: 'e-resize',
      se: 'se-resize',
      s: 's-resize',
      sw: 'sw-resize',
      w: 'w-resize',
    };
    return cursors[handle];
  };

  return (
    <>
      {/* Background Image */}
      <div
        className={`absolute cursor-move ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          left: bgX,
          top: bgY,
          width: bgWidth,
          height: bgHeight,
          backgroundImage: `url(${config.backgroundImage})`,
          backgroundSize: bgObjectFit,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: isSelected ? 5 : -1,
        }}
        onMouseDown={handleMouseDown}
      />
      
      {/* Selection indicator and resize handles */}
      {isSelected && (
        <>
          {/* Resize handles */}
          {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandle[]).map((handle) => {
            const isCorner = ['nw', 'ne', 'se', 'sw'].includes(handle);
            const size = isCorner ? 8 : 6;
            
            let style: React.CSSProperties = {
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: '#3b82f6',
              border: '1px solid white',
              cursor: getCursorStyle(handle),
              zIndex: 10,
            };
            
            // Position the handle
            switch (handle) {
              case 'nw':
                style.left = bgX - size / 2;
                style.top = bgY - size / 2;
                break;
              case 'n':
                style.left = bgX + bgWidth / 2 - size / 2;
                style.top = bgY - size / 2;
                break;
              case 'ne':
                style.left = bgX + bgWidth - size / 2;
                style.top = bgY - size / 2;
                break;
              case 'e':
                style.left = bgX + bgWidth - size / 2;
                style.top = bgY + bgHeight / 2 - size / 2;
                break;
              case 'se':
                style.left = bgX + bgWidth - size / 2;
                style.top = bgY + bgHeight - size / 2;
                break;
              case 's':
                style.left = bgX + bgWidth / 2 - size / 2;
                style.top = bgY + bgHeight - size / 2;
                break;
              case 'sw':
                style.left = bgX - size / 2;
                style.top = bgY + bgHeight - size / 2;
                break;
              case 'w':
                style.left = bgX - size / 2;
                style.top = bgY + bgHeight / 2 - size / 2;
                break;
            }
            
            return (
              <div
                key={handle}
                style={style}
                onMouseDown={(e) => handleResizeMouseDown(e, handle)}
              />
            );
          })}
          
          {/* Background label */}
          <div
            className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none"
            style={{
              left: bgX,
              top: bgY - 25,
              zIndex: 10,
            }}
          >
            Background Image
          </div>
        </>
      )}
    </>
  );
};