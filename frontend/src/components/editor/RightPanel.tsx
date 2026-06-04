'use client';

import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Lock,
  Unlock,
} from 'lucide-react';
import type { CanvasElement, TextContent, ShapeContent, MediaContent } from '@/types/editor';

export function RightPanel() {
  const {
    elements,
    selectedElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
  } = useEditorStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="w-60 bg-white border-l border-gray-200 p-4 shrink-0">
        <p className="text-sm text-gray-500 text-center mt-8">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-60 bg-white border-l border-gray-200 overflow-y-auto shrink-0">
      <div className="p-4 space-y-4">
        {/* Element Actions */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Actions</p>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => duplicateElement(selectedElement.id)}
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => deleteElement(selectedElement.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                updateElement(selectedElement.id, { locked: !selectedElement.locked })
              }
              title={selectedElement.locked ? 'Unlock' : 'Lock'}
            >
              {selectedElement.locked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Position & Size */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Position</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={Math.round(selectedElement.x)}
                onChange={(e) =>
                  updateElement(selectedElement.id, { x: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={Math.round(selectedElement.y)}
                onChange={(e) =>
                  updateElement(selectedElement.id, { y: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs">W</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={Math.round(selectedElement.width)}
                onChange={(e) =>
                  updateElement(selectedElement.id, { width: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs">H</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={Math.round(selectedElement.height)}
                onChange={(e) =>
                  updateElement(selectedElement.id, { height: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rotation & Opacity */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Transform</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Rotation</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={Math.round(selectedElement.rotation)}
                onChange={(e) =>
                  updateElement(selectedElement.id, { rotation: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Opacity</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                min={0}
                max={1}
                step={0.1}
                value={selectedElement.opacity}
                onChange={(e) =>
                  updateElement(selectedElement.id, { opacity: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Layer Order */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Layer</p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => bringToFront(selectedElement.id)}
              title="Bring to front"
            >
              <ArrowUpToLine className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => moveUp(selectedElement.id)}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => moveDown(selectedElement.id)}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => sendToBack(selectedElement.id)}
              title="Send to back"
            >
              <ArrowDownToLine className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <>
            <Separator />
            <TextProperties element={selectedElement} onUpdate={updateElement} />
          </>
        )}

        {/* Shape Properties */}
        {selectedElement.type === 'shape' && (
          <>
            <Separator />
            <ShapeProperties element={selectedElement} onUpdate={updateElement} />
          </>
        )}

        {/* Media Properties (Audio, Video, Image) */}
        {(selectedElement.type === 'audio' || selectedElement.type === 'video' || selectedElement.type === 'image') && (
          <>
            <Separator />
            <MediaProperties element={selectedElement} onUpdate={updateElement} />
          </>
        )}
      </div>
    </div>
  );
}

function TextProperties({
  element,
  onUpdate,
}: {
  element: CanvasElement;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}) {
  const content = element.content as TextContent;

  const updateContent = (updates: Partial<TextContent>) => {
    onUpdate(element.id, { content: { ...content, ...updates } });
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Text</p>
      <div className="space-y-2">
        <div>
          <Label className="text-xs">Font Family</Label>
          <Input
            className="h-8 text-xs"
            value={content.fontFamily || 'Inter'}
            onChange={(e) => updateContent({ fontFamily: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Size</Label>
            <Input
              type="number"
              className="h-8 text-xs"
              value={content.fontSize || 24}
              onChange={(e) => updateContent({ fontSize: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Weight</Label>
            <Input
              type="number"
              className="h-8 text-xs"
              step={100}
              min={100}
              max={900}
              value={content.fontWeight || 400}
              onChange={(e) => updateContent({ fontWeight: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              className="h-8 w-8 rounded cursor-pointer border border-gray-200"
              value={content.color || '#000000'}
              onChange={(e) => updateContent({ color: e.target.value })}
            />
            <Input
              className="h-8 text-xs flex-1"
              value={content.color || '#000000'}
              onChange={(e) => updateContent({ color: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Align</Label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((align) => (
              <Button
                key={align}
                variant={content.textAlign === align ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => updateContent({ textAlign: align })}
              >
                {align[0].toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShapeProperties({
  element,
  onUpdate,
}: {
  element: CanvasElement;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}) {
  const content = element.content as ShapeContent;

  const updateContent = (updates: Partial<ShapeContent>) => {
    onUpdate(element.id, { content: { ...content, ...updates } });
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Shape</p>
      <div className="space-y-2">
        <div>
          <Label className="text-xs">Fill</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              className="h-8 w-8 rounded cursor-pointer border border-gray-200"
              value={content.fill || '#e2e8f0'}
              onChange={(e) => updateContent({ fill: e.target.value })}
            />
            <Input
              className="h-8 text-xs flex-1"
              value={content.fill || '#e2e8f0'}
              onChange={(e) => updateContent({ fill: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Stroke</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              className="h-8 w-8 rounded cursor-pointer border border-gray-200"
              value={content.stroke || '#94a3b8'}
              onChange={(e) => updateContent({ stroke: e.target.value })}
            />
            <Input
              className="h-8 text-xs flex-1"
              value={content.stroke || '#94a3b8'}
              onChange={(e) => updateContent({ stroke: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Stroke W</Label>
            <Input
              type="number"
              className="h-8 text-xs"
              min={0}
              max={20}
              value={content.strokeWidth || 1}
              onChange={(e) => updateContent({ strokeWidth: Number(e.target.value) })}
            />
          </div>
          {content.shapeType === 'rectangle' && (
            <div>
              <Label className="text-xs">Radius</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                min={0}
                value={content.borderRadius || 0}
                onChange={(e) => updateContent({ borderRadius: Number(e.target.value) })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaProperties({
  element,
  onUpdate,
}: {
  element: CanvasElement;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}) {
  const content = element.content as MediaContent;

  const updateContent = (updates: Partial<MediaContent>) => {
    onUpdate(element.id, { content: { ...content, ...updates } });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase">Media</p>

      <div>
        <Label className="text-xs">Source URL</Label>
        <Input
          className="h-8 text-xs"
          value={content.src || ''}
          onChange={(e) => updateContent({ src: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {element.type === 'audio' && content.src && (
        <audio src={content.src} controls className="w-full h-8" />
      )}

      {element.type === 'video' && content.src && (
        <video src={content.src} controls className="w-full h-20 rounded" />
      )}

      {element.type === 'image' && (
        <div>
          <Label className="text-xs">Object Fit</Label>
          <div className="flex gap-1">
            {(['cover', 'contain', 'fill'] as const).map((fit) => (
              <Button
                key={fit}
                variant={content.objectFit === fit ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => updateContent({ objectFit: fit })}
              >
                {fit[0].toUpperCase() + fit.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
