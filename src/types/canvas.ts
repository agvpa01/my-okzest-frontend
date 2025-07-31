export interface CanvasConfig {
  width: number;
  height: number;
  backgroundImage: string;
  backgroundImageWidth?: number;
  backgroundImageHeight?: number;
  backgroundImageX?: number;
  backgroundImageY?: number;
  backgroundImageObjectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export interface TextElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: '100' | '200' | '300' | 'normal' | '500' | '600' | 'bold' | '800' | '900';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing?: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface ImageElement {
  type: 'image';
  src: string;
  width: number;
  height: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface CanvasElement {
  id: string;
  x: number;
  y: number;
  variableName: string;
  data: TextElement | ImageElement;
}

export interface URLParams {
  [key: string]: string;
}