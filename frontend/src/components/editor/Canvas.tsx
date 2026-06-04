'use client';

import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, IText, Rect, Circle, Triangle, FabricImage, Group, FabricText, Line } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';
import type { CanvasElement, TextContent, ShapeContent, MediaContent, FormElementContent } from '@/types/editor';

// Custom property key stored on fabric objects
const ELEMENT_ID_KEY = 'elementId';

// Helper to get/set custom property on fabric objects
function getElementId(obj: unknown): string | undefined {
  return (obj as Record<string, unknown>)[ELEMENT_ID_KEY] as string | undefined;
}

function setElementId(obj: unknown, id: string): void {
  const fabricObj = obj as { set?: (key: string, value: unknown) => void };
  if (fabricObj && typeof fabricObj.set === 'function') {
    fabricObj.set(ELEMENT_ID_KEY, id);
  } else {
    (obj as Record<string, unknown>)[ELEMENT_ID_KEY] = id;
  }
}

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const isSyncingFromStore = useRef(false);
  const isSyncingToStore = useRef(false);
  const textSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTextUpdates = useRef<Map<string, { text: string; obj: Record<string, unknown> }>>(new Map());

  const {
    canvas: canvasSettings,
    elements,
    zoom,
    selectedElementId,
    gridEnabled,
    snapEnabled,
    selectElement,
    updateElement,
    pushHistory,
  } = useEditorStore();

  // --- Initialize Fabric.js canvas ---
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

    const fc = new FabricCanvas(canvasElRef.current, {
      width: canvasSettings.width,
      height: canvasSettings.height,
      backgroundColor: canvasSettings.backgroundColor,
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    fabricRef.current = fc;

    // --- Diagnostic logging ---
    fc.on('mouse:down', (e: { target?: unknown; button?: number; pointer?: { x: number; y: number } }) => {
      const target = e.target;
      const pointer = e.pointer;
      if (target) {
        const t = target as Record<string, unknown>;
        console.log('[DIAG] mouse:down target:', {
          type: t.type,
          elementId: getElementId(target),
          selectable: t.selectable,
          evented: t.evented,
          visible: t.visible,
          left: t.left,
          top: t.top,
          width: t.width,
          height: t.height,
          angle: t.angle,
          opacity: t.opacity,
          lockMovementX: t.lockMovementX,
          lockMovementY: t.lockMovementY,
          lockScalingX: t.lockScalingX,
          lockScalingY: t.lockScalingY,
          lockRotation: t.lockRotation,
          group: t.group ? (t.group as Record<string, unknown>).type : undefined,
        });
      } else {
        console.log('[DIAG] mouse:down — no target at', pointer);
      }
    });
    // eslint-disable-next-line no-console
    console.log('[DIAG] Fabric canvas initialized. Size:', canvasSettings.width, 'x', canvasSettings.height);

    // Auto-fit zoom to viewport on first load
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const padding = 64; // account for p-8 padding
      const availWidth = containerRect.width - padding;
      const availHeight = containerRect.height - padding;
      const fitZoom = Math.min(
        availWidth / canvasSettings.width,
        availHeight / canvasSettings.height,
        1 // cap at 100%
      );
      if (fitZoom < 1) {
        useEditorStore.getState().setZoom(Math.max(fitZoom, 0.25));
      }
    }

    return () => {
      fc.dispose();
      fabricRef.current = null;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Auto-fit zoom on window resize ---
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !fabricRef.current) return;
      const containerRect = container.getBoundingClientRect();
      const padding = 64;
      const availWidth = containerRect.width - padding;
      const availHeight = containerRect.height - padding;
      const fitZoom = Math.min(
        availWidth / canvasSettings.width,
        availHeight / canvasSettings.height,
        1
      );
      if (fitZoom < 1) {
        useEditorStore.getState().setZoom(Math.max(fitZoom, 0.25));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSettings.width, canvasSettings.height]);

  // --- Fabric event handlers (sync Fabric → Store) ---
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;

    const handleSelectionCreated = (e: { selected?: unknown[]; target?: unknown; deselected?: unknown[] }) => {
      const selected = e.selected;
      if (selected && selected.length === 1) {
        const id = getElementId(selected[0]);
        // If the clicked object already matches store selection, this is a programmatic
        // sync — do nothing to avoid a feedback loop.
        if (id && id !== selectedElementId) {
          selectElement(id);
        }
      }
    };

    const handleSelectionUpdated = (e: { selected?: unknown[] }) => {
      handleSelectionCreated(e);
    };

    const handleSelectionCleared = () => {
      // Only clear if there's an actual selection in the store
      if (selectedElementId !== null) {
        selectElement(null);
      }
    };

    const handleObjectModified = (e: { target?: unknown }) => {
      if (isSyncingFromStore.current) return;
      const target = e.target;
      if (!target) return;

      const id = getElementId(target);
      if (!id) return;

      const obj = target as { left?: number; top?: number; scaleX?: number; scaleY?: number; width?: number; height?: number; angle?: number; opacity?: number };

      isSyncingToStore.current = true;
      pushHistory();

      const left = obj.left || 0;
      const top = obj.top || 0;
      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;
      const width = obj.width || 0;
      const height = obj.height || 0;
      const angle = obj.angle || 0;
      const opacity = obj.opacity ?? 1;

      updateElement(id, {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.round(width * scaleX),
        height: Math.round(height * scaleY),
        rotation: Math.round(angle),
        opacity,
      });

      isSyncingToStore.current = false;
    };

    // Debounced text sync to avoid excessive re-renders during typing
    const flushTextUpdates = () => {
      pendingTextUpdates.current.forEach((data, id) => {
        const obj = data.obj;
        const text = data.text;
        isSyncingToStore.current = true;
        updateElement(id, {
          content: {
            html: `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
            plainText: text,
            fontFamily: obj.fontFamily as string | undefined,
            fontSize: obj.fontSize as number | undefined,
            color: obj.fill as string | undefined,
            textAlign: (obj.textAlign || 'left') as 'left' | 'center' | 'right',
          } as any,
        });
        isSyncingToStore.current = false;
      });
      pendingTextUpdates.current.clear();
    };

    const handleTextChanged = (e: { target?: unknown }) => {
      if (isSyncingFromStore.current) return;
      const target = e.target;
      if (!target) return;

      const id = getElementId(target);
      if (!id) return;

      const obj = target as { text?: string; fontFamily?: string; fontSize?: number; fill?: string; textAlign?: string };
      const text = obj.text || '';

      pendingTextUpdates.current.set(id, { text, obj: obj as Record<string, unknown> });

      if (textSyncTimeoutRef.current) {
        clearTimeout(textSyncTimeoutRef.current);
      }
      textSyncTimeoutRef.current = setTimeout(() => {
        flushTextUpdates();
      }, 300);
    };

    // Prevent Fabric hidden textarea from causing page scroll jumps
    const styleId = 'fabric-textarea-fix';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `textarea[data-fabric-hiddentextarea]{position:fixed!important;left:0!important;top:0!important;opacity:0!important;z-index:-1!important;pointer-events:none!important;width:1px!important;height:1px!important;}`;
      document.head.appendChild(style);
    }

    fc.on('selection:created', handleSelectionCreated as unknown as (...args: unknown[]) => void);
    fc.on('selection:updated', handleSelectionUpdated as unknown as (...args: unknown[]) => void);
    fc.on('selection:cleared', handleSelectionCleared as unknown as (...args: unknown[]) => void);
    fc.on('object:modified', handleObjectModified as unknown as (...args: unknown[]) => void);
    fc.on('text:changed', handleTextChanged as unknown as (...args: unknown[]) => void);

    return () => {
      fc.off('selection:created', handleSelectionCreated as unknown as (...args: unknown[]) => void);
      fc.off('selection:updated', handleSelectionUpdated as unknown as (...args: unknown[]) => void);
      fc.off('selection:cleared', handleSelectionCleared as unknown as (...args: unknown[]) => void);
      fc.off('object:modified', handleObjectModified as unknown as (...args: unknown[]) => void);
      fc.off('text:changed', handleTextChanged as unknown as (...args: unknown[]) => void);
      if (textSyncTimeoutRef.current) {
        clearTimeout(textSyncTimeoutRef.current);
        textSyncTimeoutRef.current = null;
      }
      flushTextUpdates();
    };
  }, [selectElement, selectedElementId, updateElement, pushHistory]);

  // --- Sync Store → Fabric (elements) ---
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc || isSyncingToStore.current) return;

    isSyncingFromStore.current = true;

    const existingObjects = fc.getObjects();
    const storeIds = new Set(elements.map((el) => el.id));

    // Remove objects no longer in store
    existingObjects.forEach((obj) => {
      const id = getElementId(obj);
      if (id && !storeIds.has(id)) {
        fc.remove(obj);
      }
    });

    // Add or update objects
    elements.forEach((element) => {
      const existing = existingObjects.find(
        (obj) => getElementId(obj) === element.id
      );

      if (existing) {
        // Update position/size if it changed (avoid fighting with user interaction)
        const currentLeft = existing.left || 0;
        const currentTop = existing.top || 0;

        if (Math.round(currentLeft) !== element.x || Math.round(currentTop) !== element.y) {
          existing.set({ left: element.x, top: element.y });
        }
        existing.set({ opacity: element.opacity, angle: element.rotation });
        existing.set({ selectable: !element.locked, evented: !element.locked });
      } else {
        // Create new fabric object
        const fabricObj = createFabricObject(element);
        if (fabricObj) {
          setElementId(fabricObj, element.id);
          fc.add(fabricObj);
          // eslint-disable-next-line no-console
          const objProps = fabricObj as unknown as Record<string, unknown>;
          console.log('[DIAG] Created fabric object:', {
            type: objProps.type,
            elementId: element.id,
            selectable: objProps.selectable,
            evented: objProps.evented,
            left: objProps.left,
            top: objProps.top,
            width: objProps.width,
            height: objProps.height,
          });
        }
      }
    });

    // Log all canvas objects after sync
    // eslint-disable-next-line no-console
    console.log('[DIAG] Canvas objects after sync:', fc.getObjects().map((o) => {
      const p = o as unknown as Record<string, unknown>;
      return {
        type: p.type,
        elementId: getElementId(o),
        selectable: p.selectable,
        evented: p.evented,
        left: p.left,
        top: p.top,
      };
    }));

    // Update z-ordering
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    sortedElements.forEach((element) => {
      const obj = fc.getObjects().find(
        (o) => getElementId(o) === element.id
      );
      if (obj) {
        fc.bringObjectToFront(obj);
      }
    });

    fc.requestRenderAll();
    isSyncingFromStore.current = false;
  }, [elements]);

  // --- Sync selection from store → fabric ---
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;

    if (selectedElementId) {
      const obj = fc.getObjects().find(
        (o) => getElementId(o) === selectedElementId
      );
      if (obj && fc.getActiveObject() !== obj) {
        fc.setActiveObject(obj);
        fc.requestRenderAll();
      }
    } else {
      fc.discardActiveObject();
      fc.requestRenderAll();
    }
  }, [selectedElementId]);

  // --- Update canvas settings (background color, dimensions, background image) ---
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.backgroundColor = canvasSettings.backgroundColor;
    fc.setDimensions({ width: canvasSettings.width, height: canvasSettings.height });
    
    // Handle background image
    if (canvasSettings.backgroundImage) {
      FabricImage.fromURL(canvasSettings.backgroundImage).then((img) => {
        if (fc) {
          img.scaleToWidth(fc.width);
          img.scaleToHeight(fc.height);
          fc.backgroundImage = img;
          fc.requestRenderAll();
        }
      }).catch((err) => {
        console.error('Failed to load background image:', err);
      });
    } else {
      fc.backgroundImage = undefined;
      fc.requestRenderAll();
    }
    
    fc.requestRenderAll();
  }, [canvasSettings]);

  // --- Mouse wheel zoom ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const { setZoom, zoom: currentZoom } = useEditorStore.getState();
        setZoom(currentZoom + delta);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // --- Snap to grid ---
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;

    const GRID_SIZE = 20;

    const handleObjectMoving = (e: { target?: unknown }) => {
      if (!snapEnabled) return;
      const obj = e.target as { left?: number; top?: number; set: (props: Record<string, number>) => void };
      if (!obj) return;

      const left = obj.left || 0;
      const top = obj.top || 0;

      obj.set({
        left: Math.round(left / GRID_SIZE) * GRID_SIZE,
        top: Math.round(top / GRID_SIZE) * GRID_SIZE,
      });
    };

    fc.on('object:moving', handleObjectMoving as unknown as (...args: unknown[]) => void);
    return () => {
      fc.off('object:moving', handleObjectMoving as unknown as (...args: unknown[]) => void);
    };
  }, [snapEnabled]);

  // --- Compute viewport transform for zoom ---
  const containerStyle: React.CSSProperties = {
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-auto bg-gray-100 p-8"
    >
      <div className="relative shadow-2xl" style={containerStyle}>
        {/* Grid Overlay */}
        {gridEnabled && (
          <div
            className="absolute inset-0 pointer-events-none z-50 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              width: canvasSettings.width,
              height: canvasSettings.height,
            }}
          />
        )}
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}

// --- Factory: Create a fabric object from a CanvasElement ---
function createFabricObject(element: CanvasElement) {
  const baseProps = {
    left: element.x,
    top: element.y,
    angle: element.rotation,
    opacity: element.opacity,
    selectable: !element.locked,
    evented: !element.locked,
  };

  switch (element.type) {
    case 'text': {
      const content = element.content as TextContent;
      const textObj = new IText(content.plainText || 'Text', {
        ...baseProps,
        width: element.width,
        fontFamily: content.fontFamily || 'Inter',
        fontSize: content.fontSize || 24,
        fontWeight: content.fontWeight || 400,
        fill: content.color || '#000000',
        textAlign: content.textAlign || 'left',
      });
      return textObj;
    }

    case 'shape': {
      const content = element.content as ShapeContent;
      const shapeProps = {
        ...baseProps,
        width: element.width,
        height: element.height,
        fill: content.fill || '#e2e8f0',
        stroke: content.stroke || '#94a3b8',
        strokeWidth: content.strokeWidth || 1,
      };

      switch (content.shapeType) {
        case 'rectangle':
          return new Rect({
            ...shapeProps,
            rx: content.borderRadius || 0,
            ry: content.borderRadius || 0,
          });
        case 'circle':
          return new Circle({
            ...baseProps,
            radius: Math.min(element.width, element.height) / 2,
            fill: content.fill || '#e2e8f0',
            stroke: content.stroke || '#94a3b8',
            strokeWidth: content.strokeWidth || 1,
          });
        case 'triangle':
          return new Triangle(shapeProps);
        case 'line':
          return new Line([0, 0, element.width, 0], {
            ...baseProps,
            stroke: content.stroke || '#94a3b8',
            strokeWidth: content.strokeWidth || 2,
          });
        default:
          return new Rect(shapeProps);
      }
    }

    case 'image': {
      const content = element.content as MediaContent;
      // Create placeholder rect; image will load async
      const placeholder = new Rect({
        ...baseProps,
        width: element.width,
        height: element.height,
        fill: '#f1f5f9',
        stroke: '#cbd5e1',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
      });

      // Load image asynchronously and replace placeholder
      if (content.src) {
        FabricImage.fromURL(content.src).then((img) => {
          img.set({
            ...baseProps,
            scaleX: element.width / (img.width || element.width),
            scaleY: element.height / (img.height || element.height),
          });
          setElementId(img, element.id);

          const fc = (placeholder.canvas as FabricCanvas);
          if (fc) {
            fc.remove(placeholder);
            fc.add(img);
            fc.requestRenderAll();
          }
        }).catch(() => {
          // Keep placeholder on error
        });
      }

      return placeholder;
    }

    case 'video':
    case 'audio': {
      // Render as a styled placeholder in the editor
      const content = element.content as MediaContent;
      const hasSource = !!content.src;
      const label = element.type === 'video'
        ? (hasSource ? '▶ Video (Ready)' : '▶ Video')
        : (hasSource ? '🎤 Audio (Recorded)' : '🎤 Audio');
      const bgColor = element.type === 'video' ? '#fef3c7' : '#f3e8ff';
      const borderColor = element.type === 'video' ? '#f59e0b' : '#a855f7';

      const bg = new Rect({
        width: element.width,
        height: element.height,
        fill: bgColor,
        stroke: borderColor,
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        selectable: false,
        evented: false,
      });

      const text = new FabricText(label, {
        fontSize: 14,
        fill: borderColor,
        fontFamily: 'Inter',
        fontWeight: 600,
        originX: 'center',
        originY: 'center',
        left: element.width / 2,
        top: element.height / 2,
        selectable: false,
        evented: false,
      });

      const group = new Group([bg, text], {
        ...baseProps,
        width: element.width,
        height: element.height,
      });

      return group;
    }

    case 'form-element': {
      const content = element.content as FormElementContent;

      const bg = new Rect({
        width: element.width,
        height: element.height,
        fill: '#eff6ff',
        stroke: '#93c5fd',
        strokeWidth: 2,
        strokeDashArray: [6, 3],
        rx: 6,
        ry: 6,
        selectable: false,
        evented: false,
      });

      const label = new FabricText(`${content.fieldType}: ${content.label}`, {
        fontSize: 12,
        fill: '#2563eb',
        fontFamily: 'Inter',
        fontWeight: 500,
        originX: 'center',
        originY: 'center',
        left: element.width / 2,
        top: element.height / 2,
        selectable: false,
        evented: false,
      });

      const group = new Group([bg, label], {
        ...baseProps,
        width: element.width,
        height: element.height,
      });

      return group;
    }

    default:
      return null;
  }
}
