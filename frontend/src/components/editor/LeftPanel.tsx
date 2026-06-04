'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEditorStore } from '@/stores/editorStore';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { toast } from 'sonner';
import type { CanvasElement, FormFieldType } from '@/types/editor';
import {
  Type,
  Image,
  Video,
  Mic,
  Square,
  Circle,
  Triangle,
  Upload,
  FormInput,
} from 'lucide-react';

const FORM_ELEMENTS: { type: FormFieldType; label: string }[] = [
  { type: 'button-group', label: 'Buttons (Accept/Decline)' },
  { type: 'text-input', label: 'Text Input' },
  { type: 'textarea', label: 'Text Area' },
  { type: 'date-picker', label: 'Date Picker' },
  { type: 'time-picker', label: 'Time Picker' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'radio-group', label: 'Radio Group' },
  { type: 'checkbox-group', label: 'Checkboxes' },
  { type: 'number-input', label: 'Number Input' },
];

export function LeftPanel() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const { addElement, canvas } = useEditorStore();
  const [activeTab, setActiveTab] = useState('elements');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress, error: uploadError } = useMediaUpload();
  const recorder = useAudioRecorder();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const publicUrl = await upload(file);
        if (publicUrl) {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          const element: CanvasElement = {
            id: `el_${crypto.randomUUID().slice(0, 8)}`,
            type: isImage ? 'image' : isVideo ? 'video' : 'audio',
            x: canvas.width / 2 - 150,
            y: canvas.height / 2 - 100,
            width: isVideo ? 320 : 300,
            height: isVideo ? 180 : isImage ? 300 : 60,
            rotation: 0,
            zIndex: Date.now(),
            locked: false,
            opacity: 1,
            content: {
              src: publicUrl,
              alt: file.name,
              objectFit: 'cover' as const,
            },
          };
          addElement(element);
          toast.success(`Uploaded ${file.name}`);
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const createId = () => `el_${crypto.randomUUID().slice(0, 8)}`;

  const addTextElement = () => {
    const element: CanvasElement = {
      id: createId(),
      type: 'text',
      x: canvas.width / 2 - 150,
      y: canvas.height / 2 - 30,
      width: 300,
      height: 60,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      opacity: 1,
      content: {
        html: '<p style="font-size:24px;color:#000000">Edit this text</p>',
        plainText: 'Edit this text',
        fontFamily: 'Inter',
        fontSize: 24,
        color: '#000000',
        textAlign: 'center',
      },
    };
    addElement(element);
  };

  const addShapeElement = (shapeType: 'rectangle' | 'circle' | 'triangle' = 'rectangle') => {
    const element: CanvasElement = {
      id: createId(),
      type: 'shape',
      x: canvas.width / 2 - 75,
      y: canvas.height / 2 - 75,
      width: 150,
      height: 150,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      opacity: 1,
      content: {
        shapeType,
        fill: '#e2e8f0',
        stroke: '#94a3b8',
        strokeWidth: 2,
        borderRadius: shapeType === 'rectangle' ? 8 : 0,
      },
    };
    addElement(element);
  };

  const addImageElement = () => {
    // Trigger file input (media upload will be handled in Phase 3)
    const element: CanvasElement = {
      id: createId(),
      type: 'image',
      x: canvas.width / 2 - 150,
      y: canvas.height / 2 - 150,
      width: 300,
      height: 300,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      opacity: 1,
      content: {
        src: '',
        alt: 'Uploaded image',
        objectFit: 'cover',
      },
    };
    addElement(element);
  };

  const addVideoElement = () => {
    const element: CanvasElement = {
      id: createId(),
      type: 'video',
      x: canvas.width / 2 - 160,
      y: canvas.height / 2 - 90,
      width: 320,
      height: 180,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      opacity: 1,
      content: {
        src: '',
        objectFit: 'contain',
      },
    };
    addElement(element);
  };

  const addAudioElement = () => {
    const element: CanvasElement = {
      id: createId(),
      type: 'audio',
      x: canvas.width / 2 - 150,
      y: canvas.height / 2 - 30,
      width: 300,
      height: 60,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      opacity: 1,
      content: {
        src: '',
      },
    };
    addElement(element);
  };

  const addFormElement = (fieldType: FormFieldType) => {
    const element: CanvasElement = {
      id: createId(),
      type: 'form-element',
      x: canvas.width / 2 - 150,
      y: canvas.height / 2 - 25,
      width: 300,
      height: 50,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      opacity: 1,
      content: {
        fieldId: `field_${crypto.randomUUID().slice(0, 6)}`,
        fieldType,
        label: fieldType === 'button-group' ? 'Will you attend?' : 'Enter your answer',
        options: fieldType === 'button-group' ? ["I'll be there!", "Can't make it"] : undefined,
        required: false,
      },
    };
    addElement(element);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid grid-cols-3 m-2 shrink-0">
          <TabsTrigger value="elements" className="text-xs px-1">
            <Type className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs px-1">
            <Image className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="forms" className="text-xs px-1">
            <FormInput className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-3">
          <TabsContent value="elements" className="mt-0 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase">Add Elements</p>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={addTextElement}
            >
              <Type className="h-4 w-4 mr-2" /> Text
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addShapeElement('rectangle')}
            >
              <Square className="h-4 w-4 mr-2" /> Rectangle
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addShapeElement('circle')}
            >
              <Circle className="h-4 w-4 mr-2" /> Circle
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addShapeElement('triangle')}
            >
              <Triangle className="h-4 w-4 mr-2" /> Triangle
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={addImageElement}
            >
              <Image className="h-4 w-4 mr-2" /> Image
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={addVideoElement}
            >
              <Video className="h-4 w-4 mr-2" /> Video
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={addAudioElement}
            >
              <Mic className="h-4 w-4 mr-2" /> Voice Note
            </Button>
          </TabsContent>

          <TabsContent value="media" className="mt-0 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase">Upload Media</p>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              {isUploading ? (
                <>
                  <Upload className="h-8 w-8 text-blue-400 mx-auto animate-pulse" />
                  <p className="mt-2 text-sm text-blue-600">
                    Uploading... {progress}%
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Images, videos, or audio files
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,audio/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Audio Recording */}
            <p className="text-xs font-medium text-gray-500 uppercase mt-4">Record Voice Note</p>
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              {recorder.isRecording ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-mono text-red-600">
                      {Math.floor(recorder.duration / 60).toString().padStart(2, '0')}:
                      {(recorder.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {recorder.isPaused ? (
                      <Button size="sm" variant="outline" onClick={recorder.resumeRecording}>
                        Resume
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={recorder.pauseRecording}>
                        Pause
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={recorder.stopRecording}>
                      Stop
                    </Button>
                  </div>
                </>
              ) : recorder.audioBlob ? (
                <>
                  <audio src={recorder.audioUrl || ''} controls className="w-full h-8" />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={async () => {
                        if (!recorder.audioBlob) return;
                        const file = new File([recorder.audioBlob], 'voice-note.webm', { type: 'audio/webm' });
                        // eslint-disable-next-line no-console
                        console.log('[VOICE] Uploading audio blob, size:', file.size, 'type:', file.type);
                        const publicUrl = await upload(file);
                        // eslint-disable-next-line no-console
                        console.log('[VOICE] Upload result:', publicUrl);
                        if (publicUrl) {
                          const element: CanvasElement = {
                            id: `el_${crypto.randomUUID().slice(0, 8)}`,
                            type: 'audio',
                            x: canvas.width / 2 - 150,
                            y: canvas.height / 2 - 30,
                            width: 300,
                            height: 60,
                            rotation: 0,
                            zIndex: Date.now(),
                            locked: false,
                            opacity: 1,
                            content: { src: publicUrl },
                          };
                          // eslint-disable-next-line no-console
                          console.log('[VOICE] Adding element with src:', element.content);
                          addElement(element);
                          recorder.discardRecording();
                          toast.success('Voice note added');
                        } else {
                          toast.error('Upload failed — voice note not saved');
                        }
                      }}
                    >
                      Use
                    </Button>
                    <Button size="sm" variant="outline" onClick={recorder.discardRecording}>
                      Discard
                    </Button>
                  </div>
                </>
              ) : (
                <Button size="sm" variant="outline" className="w-full" onClick={recorder.startRecording}>
                  <Mic className="h-4 w-4 mr-2" /> Start Recording
                </Button>
              )}
              {uploadError && (
                <p className="text-xs text-red-500">Upload error: {uploadError}</p>
              )}
              {recorder.error && (
                <p className="text-xs text-red-500">{recorder.error}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="forms" className="mt-0 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase">Interactive Elements</p>
            <p className="text-xs text-gray-500 mb-3">
              Add form fields to collect responses from visitors.
            </p>
            {FORM_ELEMENTS.map((fe) => (
              <Button
                key={fe.type}
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() => addFormElement(fe.type)}
              >
                <FormInput className="h-4 w-4 mr-2" /> {fe.label}
              </Button>
            ))}
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
