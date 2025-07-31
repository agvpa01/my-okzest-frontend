import React from 'react';
import { CanvasConfig, CanvasElement } from '../types/canvas';

export const renderCanvas = (
  config: CanvasConfig,
  elements: CanvasElement[],
  params: Record<string, string> = {},
  maxWidth?: number
) => {
  const scale = maxWidth ? Math.min(1, maxWidth / Math.max(config.width, config.height)) : 1;

  return (
    <div
      className="relative bg-white mx-auto"
      style={{
        width: config.width * scale,
        height: config.height * scale,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: config.width,
          height: config.height,
        }}
      >
        {elements.map((element) => {
          const variableValue = params[element.variableName];
          
          return (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: element.x,
                top: element.y,
              }}
            >
              {element.data.type === 'text' ? (
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
                    textShadow: element.data.strokeWidth && element.data.strokeWidth > 0
                      ? `${element.data.strokeWidth}px 0 0 ${element.data.strokeColor}, -${element.data.strokeWidth}px 0 0 ${element.data.strokeColor}, 0 ${element.data.strokeWidth}px 0 ${element.data.strokeColor}, 0 -${element.data.strokeWidth}px 0 ${element.data.strokeColor}, ${element.data.strokeWidth}px ${element.data.strokeWidth}px 0 ${element.data.strokeColor}, -${element.data.strokeWidth}px -${element.data.strokeWidth}px 0 ${element.data.strokeColor}, ${element.data.strokeWidth}px -${element.data.strokeWidth}px 0 ${element.data.strokeColor}, -${element.data.strokeWidth}px ${element.data.strokeWidth}px 0 ${element.data.strokeColor}`
                      : 'none'
                  }}>
                    {variableValue || element.data.content || `{${element.variableName}}`}
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};