'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useEditorStore } from '@/stores/editorStore';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { api } from '@/lib/api';
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
  Search,
  Sparkles,
  Smile,
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
  const { addElement, canvas, updateCanvas } = useEditorStore();
  const [openSection, setOpenSection] = useState('backgrounds');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress, error: uploadError } = useMediaUpload();
  const recorder = useAudioRecorder();
  const [backgrounds, setBackgrounds] = useState<Array<{ id: string; fileName: string; publicUrl: string }>>([]);
  const [backgroundSearch, setBackgroundSearch] = useState('');
  const [gifSearch, setGifSearch] = useState('');
  const [emojiSearch, setEmojiSearch] = useState('');

  // Load backgrounds on mount
  useEffect(() => {
    api.getBackgrounds().then(setBackgrounds).catch(console.error);
  }, []);

  const filteredBackgrounds = backgrounds.filter(b =>
    b.fileName.toLowerCase().includes(backgroundSearch.toLowerCase())
  );

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

  const handleBackgroundSelect = (publicUrl: string) => {
    updateCanvas({ backgroundImage: publicUrl });
    toast.success('Background updated');
  };

  const addEmojiElement = (emoji: string) => {
    const element: CanvasElement = {
      id: createId(),
      type: 'text',
      x: canvas.width / 2 - 25,
      y: canvas.height / 2 - 25,
      width: 50,
      height: 50,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      opacity: 1,
      content: {
        html: `<p style="font-size:48px">${emoji}</p>`,
        plainText: emoji,
        fontFamily: 'Inter',
        fontSize: 48,
        color: '#000000',
        textAlign: 'center',
      },
    };
    addElement(element);
  };

  const COMMON_EMOJIS = [
    '😀', '😂', '😍', '🥰', '😎', '🤩', '😊', '😇',
    '🎉', '🎊', '🎈', '🎁', '🏆', '⭐', '💯', '❤️',
    '👍', '👏', '🙌', '🤝', '💪', '🔥', '✨', '💫',
    '🌟', '☀️', '🌙', '⭐', '🌈', '🦋', '🌸', '🌺',
    '🎂', '🍰', '🍕', '🍔', '🍩', '☕', '🥂', '🍾',
  ];

  const filteredEmojis = COMMON_EMOJIS.filter(e =>
    e.includes(emojiSearch) || emojiSearch === ''
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
      <div className="flex-1 overflow-y-auto">
        <Accordion>
          {/* Backgrounds Section */}
          <AccordionItem
            title="Backgrounds"
            isOpen={openSection === 'backgrounds'}
            onToggle={() => setOpenSection(openSection === 'backgrounds' ? '' : 'backgrounds')}
          >
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search backgrounds..."
                  value={backgroundSearch}
                  onChange={(e) => setBackgroundSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => handleBackgroundSelect(bg.publicUrl)}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition relative group"
                  >
                    <img
                      src={bg.publicUrl}
                      alt={bg.fileName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-xs">Set Background</span>
                    </div>
                  </button>
                ))}
              </div>
              {filteredBackgrounds.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No backgrounds found</p>
              )}
            </div>
          </AccordionItem>

          {/* GIFs Section */}
          <AccordionItem
            title="GIFs"
            isOpen={openSection === 'gifs'}
            onToggle={() => setOpenSection(openSection === 'gifs' ? '' : 'gifs')}
          >
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search GIFs..."
                  value={gifSearch}
                  onChange={(e) => setGifSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 text-center py-4">
                GIF search coming soon
              </p>
            </div>
          </AccordionItem>

          {/* Emojis Section */}
          <AccordionItem
            title="Emojis"
            isOpen={openSection === 'emojis'}
            onToggle={() => setOpenSection(openSection === 'emojis' ? '' : 'emojis')}
          >
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search emojis..."
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-6 gap-1">
                {filteredEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmojiElement(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </AccordionItem>

          {/* Elements Section */}
          <AccordionItem
            title="Elements"
            isOpen={openSection === 'elements'}
            onToggle={() => setOpenSection(openSection === 'elements' ? '' : 'elements')}
          >
            <div className="space-y-2">
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
            </div>
          </AccordionItem>

          {/* Media Upload Section */}
          <AccordionItem
            title="Media Upload"
            isOpen={openSection === 'media'}
            onToggle={() => setOpenSection(openSection === 'media' ? '' : 'media')}
          >
            <div className="space-y-2">
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
                          const publicUrl = await upload(file);
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
            </div>
          </AccordionItem>

          {/* Interactive Elements Section */}
          <AccordionItem
            title="Interactive Elements"
            isOpen={openSection === 'forms'}
            onToggle={() => setOpenSection(openSection === 'forms' ? '' : 'forms')}
          >
            <div className="space-y-2">
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
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
