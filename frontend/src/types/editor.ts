export type ElementType = 'text' | 'image' | 'video' | 'audio' | 'shape' | 'form-element';

export type FormFieldType =
  | 'button-group'
  | 'text-input'
  | 'textarea'
  | 'date-picker'
  | 'time-picker'
  | 'dropdown'
  | 'radio-group'
  | 'checkbox-group'
  | 'number-input';

export interface TextContent {
  html: string;
  plainText: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface MediaContent {
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export interface ShapeContent {
  shapeType: 'rectangle' | 'circle' | 'line' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

export interface FormElementContent {
  fieldId: string;
  fieldType: FormFieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  min?: number;
  max?: number;
}

export type ElementContent = TextContent | MediaContent | ShapeContent | FormElementContent;

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  opacity: number;
  content: ElementContent;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
}

export interface Page {
  id: string;
  name: string;
  elements: CanvasElement[];
}

export interface CanvasData {
  version: number;
  canvas: CanvasSettings;
  elements: CanvasElement[];
  pages?: Page[];
  currentPageIndex?: number;
}

export interface HistoryState {
  past: CanvasData[];
  future: CanvasData[];
}

export interface EditorState {
  canvas: CanvasSettings;
  elements: CanvasElement[];
  pages: Page[];
  currentPageIndex: number;
  selectedElementId: string | null;
  history: HistoryState;
  previewMode: 'desktop' | 'mobile' | null;
  gridEnabled: boolean;
  snapEnabled: boolean;
  isDirty: boolean;
  zoom: number;
}
