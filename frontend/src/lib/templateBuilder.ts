import type { CanvasData, CanvasElement, CanvasSettings } from '@/types/editor';

export interface LayoutDefinition {
  id: string;
  name: string;
  layoutType: 'invitation-vertical' | 'event-poster' | 'celebration-card';
  pageCount?: number;
  colors: {
    primary: string;
    background: string;
    accent: string;
    surface: string;
  };
  typography: {
    titleSize: number;
    subtitleSize: number;
    headingSize: number;
    bodySize: number;
    labelSize: number;
  };
}

export interface EventContent {
  title: string;
  subtitle: string;
  description: string;
  dateLabel: string;
  dateValue: string;
  locationLabel: string;
  locationValue: string;
  rsvpHeading: string;
  nameLabel: string;
  namePlaceholder: string;
  guestsLabel: string;
  guestsPlaceholder: string;
  contact: string;
}

export function getContentForEventType(eventType: string): EventContent {
  switch (eventType) {
    case 'coffee':
      return {
        title: 'Coffee Invitation',
        subtitle: "Let's grab a coffee together!",
        description: "I'd love to catch up over a warm cup of coffee. Hope you can make it!",
        dateLabel: 'DATE & TIME', dateValue: 'Saturday at 10:00 AM',
        locationLabel: 'LOCATION', locationValue: 'Starbucks Downtown',
        rsvpHeading: 'Let me know if you can make it',
        nameLabel: 'Your Name', namePlaceholder: 'Enter your name',
        guestsLabel: 'Bringing anyone?', guestsPlaceholder: 'How many guests?',
        contact: "Questions? Text me anytime.",
      };
    case 'dinner':
      return {
        title: 'Dinner Invitation',
        subtitle: "You're invited to a special dinner.",
        description: "Join us for an evening of great food, wonderful company, and memorable conversations.",
        dateLabel: 'DATE & TIME', dateValue: 'Friday at 7:00 PM',
        locationLabel: 'LOCATION', locationValue: "The Dining Room\n123 Main Street",
        rsvpHeading: 'Kindly RSVP',
        nameLabel: 'Your Name', namePlaceholder: 'Enter your full name',
        guestsLabel: 'Number of Guests', guestsPlaceholder: 'How many guests?',
        contact: "Questions? Contact the host at host@example.com",
      };
    case 'date':
      return {
        title: 'Date Invitation',
        subtitle: 'Would you go on a date with me?',
        description: "I've been looking forward to spending some special time with you. Let's make it happen!",
        dateLabel: 'DATE & TIME', dateValue: 'Saturday at 6:00 PM',
        locationLabel: 'LOCATION', locationValue: 'Downtown Cinema',
        rsvpHeading: 'Say yes?',
        nameLabel: 'Your Name', namePlaceholder: 'Enter your name',
        guestsLabel: 'Just you or...?', guestsPlaceholder: 'How many guests?',
        contact: "Questions? Call or text me anytime.",
      };
    case 'birthday':
      return {
        title: 'Happy Birthday!',
        subtitle: "You're invited to a birthday celebration!",
        description: "Come celebrate this special day with great food, music, and amazing company!",
        dateLabel: 'DATE & TIME', dateValue: 'Saturday, June 14th at 6:00 PM',
        locationLabel: 'LOCATION', locationValue: "The Grand Ballroom\n123 Celebration Ave",
        rsvpHeading: 'Kindly RSVP by June 1st',
        nameLabel: 'Your Name', namePlaceholder: 'Enter your name',
        guestsLabel: 'Number of Guests', guestsPlaceholder: 'How many guests?',
        contact: "Questions? Contact us at party@example.com",
      };
    case 'proposal':
      return {
        title: 'Will You Marry Me?',
        subtitle: "I've been waiting for this moment...",
        description: "You mean the world to me, and I want to spend the rest of my life with you.",
        dateLabel: 'DATE & TIME', dateValue: 'A magical evening',
        locationLabel: 'LOCATION', locationValue: 'A special place just for us',
        rsvpHeading: 'Your answer means everything',
        nameLabel: 'Your Name', namePlaceholder: 'Enter your name',
        guestsLabel: 'Any message for me?', guestsPlaceholder: 'Share your thoughts...',
        contact: "This is a moment I'll never forget.",
      };
    case 'anniversary':
      return {
        title: 'Happy Anniversary!',
        subtitle: 'Celebrating our love and journey together.',
        description: "Another year of beautiful memories. Let's celebrate our love and look forward to many more.",
        dateLabel: 'DATE & TIME', dateValue: 'Our special day',
        locationLabel: 'LOCATION', locationValue: 'Our favorite restaurant',
        rsvpHeading: "Let's celebrate together",
        nameLabel: 'Your Name', namePlaceholder: 'Enter your name',
        guestsLabel: 'Number of Guests', guestsPlaceholder: 'How many guests?',
        contact: "Questions? Reach out to us anytime.",
      };
    default:
      return {
        title: "You're Invited!",
        subtitle: 'Join us for a special event.',
        description: "We would be honored to have you join us for this special occasion.",
        dateLabel: 'DATE & TIME', dateValue: 'Saturday at 6:00 PM',
        locationLabel: 'LOCATION', locationValue: "Event Venue\n123 Main Street",
        rsvpHeading: 'Please RSVP',
        nameLabel: 'Your Name', namePlaceholder: 'Enter your name',
        guestsLabel: 'Number of Guests', guestsPlaceholder: 'How many guests?',
        contact: "Questions? Contact us at events@example.com",
      };
  }
}

// === Template Definitions ===
export const TEMPLATE_DEFINITIONS: LayoutDefinition[] = [
  {
    id: 'birthday-elegant',
    name: 'Elegant Birthday',
    layoutType: 'invitation-vertical',
    pageCount: 1,
    colors: { primary: '#be123c', background: '#fff1f2', accent: '#f43f5e', surface: '#fecdd3' },
    typography: { titleSize: 64, subtitleSize: 36, headingSize: 24, bodySize: 22, labelSize: 16 },
  },
  {
    id: 'wedding-classic',
    name: 'Classic Wedding',
    layoutType: 'celebration-card',
    pageCount: 1,
    colors: { primary: '#6b21a8', background: '#faf5ff', accent: '#c084fc', surface: '#e9d5ff' },
    typography: { titleSize: 52, subtitleSize: 36, headingSize: 22, bodySize: 20, labelSize: 16 },
  },
  {
    id: 'party-modern',
    name: 'Modern Party',
    layoutType: 'event-poster',
    pageCount: 1,
    colors: { primary: '#0284c7', background: '#f0f9ff', accent: '#0284c7', surface: '#bae6fd' },
    typography: { titleSize: 56, subtitleSize: 24, headingSize: 24, bodySize: 22, labelSize: 16 },
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower',
    layoutType: 'invitation-vertical',
    pageCount: 1,
    colors: { primary: '#047857', background: '#ecfdf5', accent: '#34d399', surface: '#a7f3d0' },
    typography: { titleSize: 56, subtitleSize: 24, headingSize: 24, bodySize: 22, labelSize: 16 },
  },
  {
    id: 'graduation',
    name: 'Graduation',
    layoutType: 'event-poster',
    pageCount: 1,
    colors: { primary: '#b45309', background: '#fffbeb', accent: '#f59e0b', surface: '#fde68a' },
    typography: { titleSize: 48, subtitleSize: 32, headingSize: 22, bodySize: 22, labelSize: 16 },
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    layoutType: 'invitation-vertical',
    pageCount: 1,
    colors: { primary: '#334155', background: '#f8fafc', accent: '#475569', surface: '#e2e8f0' },
    typography: { titleSize: 52, subtitleSize: 22, headingSize: 24, bodySize: 20, labelSize: 16 },
  },
  {
    id: 'story-album',
    name: 'Story Album',
    layoutType: 'invitation-vertical',
    pageCount: 2,
    colors: { primary: '#7c3aed', background: '#f5f3ff', accent: '#a78bfa', surface: '#ddd6fe' },
    typography: { titleSize: 52, subtitleSize: 28, headingSize: 22, bodySize: 20, labelSize: 16 },
  },
  {
    id: 'event-album',
    name: 'Event Album',
    layoutType: 'event-poster',
    pageCount: 3,
    colors: { primary: '#0ea5e9', background: '#f0f9ff', accent: '#38bdf8', surface: '#bae6fd' },
    typography: { titleSize: 48, subtitleSize: 24, headingSize: 22, bodySize: 20, labelSize: 16 },
  },
];

export function getTemplateDefinition(templateId: string): LayoutDefinition | undefined {
  return TEMPLATE_DEFINITIONS.find((t) => t.id === templateId);
}

// === Builder Helpers ===
function txt(
  id: string, x: number, y: number, w: number, h: number,
  html: string, plain: string, opts: {
    fontSize?: number; color?: string; align?: 'left' | 'center' | 'right';
    weight?: number; z?: number;
  } = {},
): CanvasElement {
  return {
    id, type: 'text', x, y, width: w, height: h, rotation: 0,
    zIndex: opts.z ?? 1, locked: false, opacity: 1,
    content: {
      html, plainText: plain, fontFamily: 'Inter',
      fontSize: opts.fontSize ?? 16, color: opts.color ?? '#1f2937',
      textAlign: opts.align ?? 'left', fontWeight: opts.weight,
    },
  };
}

function shp(
  id: string, x: number, y: number, w: number, h: number,
  fill: string, opts: { shape?: 'rectangle' | 'circle' | 'triangle'; z?: number; locked?: boolean; op?: number } = {},
): CanvasElement {
  return {
    id, type: 'shape', x, y, width: w, height: h, rotation: 0,
    zIndex: opts.z ?? 1, locked: opts.locked ?? false, opacity: opts.op ?? 1,
    content: { shapeType: opts.shape ?? 'rectangle', fill },
  };
}

function fld(
  id: string, x: number, y: number, w: number, h: number,
  label: string, placeholder: string, fieldType: 'text-input' | 'number-input',
  opts: { required?: boolean; z?: number } = {},
): CanvasElement {
  return {
    id, type: 'form-element', x, y, width: w, height: h, rotation: 0,
    zIndex: opts.z ?? 1, locked: false, opacity: 1,
    content: { fieldId: id, fieldType, label, placeholder, required: opts.required ?? false },
  };
}

function btnGroup(
  id: string, x: number, y: number, w: number, h: number,
  opts: { z?: number } = {},
): CanvasElement {
  return {
    id, type: 'form-element', x, y, width: w, height: h, rotation: 0,
    zIndex: opts.z ?? 1, locked: false, opacity: 1,
    content: {
      fieldId: id,
      fieldType: 'button-group',
      label: 'Will you attend?',
      options: ["I'll be there!", "Can't make it"],
      required: false,
    },
  };
}

function nl2br(text: string): string {
  return text.replace(/\n/g, '<br/>');
}

// === Layout Builders ===
function buildInvitationVertical(layout: LayoutDefinition, content: EventContent): CanvasData {
  const c = layout.colors, t = layout.typography;
  return {
    version: 1,
    canvas: { width: 1080, height: 1920, backgroundColor: c.background },
    elements: [
      shp('deco-top', 0, 0, 1080, 12, c.primary, { z: 1, locked: true }),
      txt('title', 140, 80, 800, 120,
        `<p style="font-size:${t.titleSize}px;color:${c.primary};text-align:center;font-weight:bold">${content.title}</p>`,
        content.title, { fontSize: t.titleSize, color: c.primary, align: 'center', weight: 700, z: 2 }),
      txt('subtitle', 140, 220, 800, 60,
        `<p style="font-size:${t.subtitleSize}px;color:#4b5563;text-align:center">${content.subtitle}</p>`,
        content.subtitle, { fontSize: t.subtitleSize, color: '#4b5563', align: 'center', z: 3 }),
      shp('photo-box', 340, 310, 400, 400, c.surface, { z: 4 }),
      txt('photo-text', 340, 490, 400, 40,
        `<p style="font-size:18px;color:${c.primary};text-align:center">[ Your Photo Here ]</p>`,
        '[ Your Photo Here ]', { fontSize: 18, color: c.primary, align: 'center', z: 5 }),
      txt('description', 140, 740, 800, 60,
        `<p style="font-size:${t.bodySize}px;color:#1f2937;text-align:center">${content.description}</p>`,
        content.description, { fontSize: t.bodySize, color: '#1f2937', align: 'center', z: 6 }),
      txt('date-label', 140, 820, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.dateLabel}</p>`,
        content.dateLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 7 }),
      txt('date-value', 140, 855, 800, 40,
        `<p style="font-size:${t.headingSize}px;color:#1f2937;text-align:left">${content.dateValue}</p>`,
        content.dateValue, { fontSize: t.headingSize, color: '#1f2937', align: 'left', z: 8 }),
      txt('location-label', 140, 915, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.locationLabel}</p>`,
        content.locationLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 9 }),
      txt('location-value', 140, 950, 800, 70,
        `<p style="font-size:${t.headingSize}px;color:#1f2937;text-align:left">${nl2br(content.locationValue)}</p>`,
        content.locationValue, { fontSize: t.headingSize, color: '#1f2937', align: 'left', z: 10 }),
      txt('rsvp-heading', 140, 1060, 800, 40,
        `<p style="font-size:${t.headingSize}px;color:${c.primary};text-align:center;font-weight:bold">${content.rsvpHeading}</p>`,
        content.rsvpHeading, { fontSize: t.headingSize, color: c.primary, align: 'center', weight: 700, z: 11 }),
      txt('name-label', 140, 1120, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.nameLabel}</p>`,
        content.nameLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 12 }),
      fld('name-field', 140, 1155, 800, 50, 'Name', content.namePlaceholder, 'text-input', { required: true, z: 13 }),
      txt('guests-label', 140, 1225, 300, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.guestsLabel}</p>`,
        content.guestsLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 14 }),
      fld('guests-field', 140, 1260, 800, 50, 'Guests', content.guestsPlaceholder, 'number-input', { required: true, z: 15 }),
      txt('contact', 140, 1380, 800, 50,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:center">${content.contact}</p>`,
        content.contact, { fontSize: t.labelSize, color: '#9ca3af', align: 'center', z: 16 }),
      shp('deco-c1', 80, 200, 40, 40, c.primary, { shape: 'circle', z: 17, locked: true, op: 0.3 }),
      shp('deco-c2', 960, 600, 60, 60, c.primary, { shape: 'circle', z: 18, locked: true, op: 0.3 }),
    ],
  };
}

function buildEventPoster(layout: LayoutDefinition, content: EventContent): CanvasData {
  const c = layout.colors, t = layout.typography;
  return {
    version: 1,
    canvas: { width: 1080, height: 1920, backgroundColor: c.background },
    elements: [
      shp('deco-bar', 0, 0, 1080, 200, c.primary, { z: 1, locked: true }),
      txt('title', 140, 40, 800, 80,
        `<p style="font-size:${t.titleSize}px;color:#fff;text-align:center;font-weight:bold">${content.title}</p>`,
        content.title, { fontSize: t.titleSize, color: '#ffffff', align: 'center', weight: 700, z: 2 }),
      txt('subtitle', 140, 130, 800, 40,
        `<p style="font-size:${t.subtitleSize}px;color:#e0f2fe;text-align:center">${content.subtitle}</p>`,
        content.subtitle, { fontSize: t.subtitleSize, color: '#e0f2fe', align: 'center', z: 3 }),
      shp('photo-box', 240, 240, 600, 400, c.surface, { z: 4 }),
      txt('photo-text', 240, 410, 600, 40,
        `<p style="font-size:18px;color:${c.primary};text-align:center">[ Event Photo / Flyer ]</p>`,
        '[ Event Photo / Flyer ]', { fontSize: 18, color: c.primary, align: 'center', z: 5 }),
      txt('description', 140, 680, 800, 60,
        `<p style="font-size:${t.bodySize}px;color:#1f2937;text-align:center">${content.description}</p>`,
        content.description, { fontSize: t.bodySize, color: '#1f2937', align: 'center', z: 6 }),
      txt('date-label', 140, 780, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.dateLabel}</p>`,
        content.dateLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 7 }),
      txt('date-value', 140, 815, 800, 40,
        `<p style="font-size:${t.headingSize}px;color:#1f2937;text-align:left">${content.dateValue}</p>`,
        content.dateValue, { fontSize: t.headingSize, color: '#1f2937', align: 'left', z: 8 }),
      txt('location-label', 140, 875, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.locationLabel}</p>`,
        content.locationLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 9 }),
      txt('location-value', 140, 910, 800, 70,
        `<p style="font-size:${t.headingSize}px;color:#1f2937;text-align:left">${nl2br(content.locationValue)}</p>`,
        content.locationValue, { fontSize: t.headingSize, color: '#1f2937', align: 'left', z: 10 }),
      txt('rsvp-heading', 140, 1080, 800, 40,
        `<p style="font-size:${t.headingSize}px;color:${c.primary};text-align:center;font-weight:bold">${content.rsvpHeading}</p>`,
        content.rsvpHeading, { fontSize: t.headingSize, color: c.primary, align: 'center', weight: 700, z: 11 }),
      txt('name-label', 140, 1140, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.nameLabel}</p>`,
        content.nameLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 12 }),
      fld('name-field', 140, 1175, 800, 50, 'Name', content.namePlaceholder, 'text-input', { required: true, z: 13 }),
      txt('guests-label', 140, 1245, 300, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.guestsLabel}</p>`,
        content.guestsLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 14 }),
      fld('guests-field', 140, 1280, 800, 50, 'Guests', content.guestsPlaceholder, 'number-input', { required: true, z: 15 }),
      txt('contact', 140, 1400, 800, 50,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:center">${content.contact}</p>`,
        content.contact, { fontSize: t.labelSize, color: '#9ca3af', align: 'center', z: 16 }),
      shp('deco-c', 1000, 300, 50, 50, c.primary, { shape: 'circle', z: 17, locked: true, op: 0.3 }),
    ],
  };
}

function buildCelebrationCard(layout: LayoutDefinition, content: EventContent): CanvasData {
  const c = layout.colors, t = layout.typography;
  return {
    version: 1,
    canvas: { width: 1080, height: 1920, backgroundColor: c.background },
    elements: [
      shp('deco-line', 390, 60, 300, 4, c.accent, { z: 1, locked: true }),
      txt('title', 140, 90, 800, 100,
        `<p style="font-size:${t.titleSize}px;color:${c.primary};text-align:center;font-weight:bold">${content.title}</p>`,
        content.title, { fontSize: t.titleSize, color: c.primary, align: 'center', weight: 700, z: 2 }),
      txt('subtitle', 140, 200, 800, 80,
        `<p style="font-size:${t.subtitleSize + 6}px;color:#4c1d95;text-align:center">${content.subtitle}</p>`,
        content.subtitle, { fontSize: t.subtitleSize + 6, color: '#4c1d95', align: 'center', z: 3 }),
      txt('description', 240, 300, 600, 50,
        `<p style="font-size:${t.bodySize - 2}px;color:#7c3aed;text-align:center;font-style:italic">${content.description}</p>`,
        content.description, { fontSize: t.bodySize - 2, color: '#7c3aed', align: 'center', z: 4 }),
      shp('photo-box', 290, 380, 500, 500, c.surface, { z: 5 }),
      txt('photo-text', 290, 590, 500, 40,
        `<p style="font-size:18px;color:#7c3aed;text-align:center">[ Photo Here ]</p>`,
        '[ Photo Here ]', { fontSize: 18, color: '#7c3aed', align: 'center', z: 6 }),
      txt('date-label', 140, 920, 400, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.dateLabel}</p>`,
        content.dateLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 7 }),
      txt('date-value', 140, 955, 800, 80,
        `<p style="font-size:${t.bodySize}px;color:#1f2937;text-align:left">${nl2br(content.dateValue)}</p>`,
        content.dateValue, { fontSize: t.bodySize, color: '#1f2937', align: 'left', z: 8 }),
      txt('location-label', 140, 1055, 400, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.locationLabel}</p>`,
        content.locationLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 9 }),
      txt('location-value', 140, 1090, 800, 60,
        `<p style="font-size:${t.bodySize}px;color:#1f2937;text-align:left">${nl2br(content.locationValue)}</p>`,
        content.locationValue, { fontSize: t.bodySize, color: '#1f2937', align: 'left', z: 10 }),
      txt('rsvp-heading', 140, 1250, 800, 40,
        `<p style="font-size:${t.headingSize}px;color:${c.primary};text-align:center;font-weight:bold">${content.rsvpHeading}</p>`,
        content.rsvpHeading, { fontSize: t.headingSize, color: c.primary, align: 'center', weight: 700, z: 11 }),
      txt('name-label', 140, 1310, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.nameLabel}</p>`,
        content.nameLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 12 }),
      fld('name-field', 140, 1345, 800, 50, 'Name', content.namePlaceholder, 'text-input', { required: true, z: 13 }),
      txt('guests-label', 140, 1415, 400, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.guestsLabel}</p>`,
        content.guestsLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 14 }),
      fld('guests-field', 140, 1450, 800, 50, 'Guests', content.guestsPlaceholder, 'number-input', { required: false, z: 15 }),
      txt('contact', 140, 1550, 800, 50,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:center">${content.contact}</p>`,
        content.contact, { fontSize: t.labelSize, color: '#9ca3af', align: 'center', z: 16 }),
      shp('deco-heart', 490, 1700, 100, 100, c.accent, { shape: 'circle', z: 17, locked: true, op: 0.2 }),
    ],
  };
}

// === Public API ===
export function buildCanvasFromTemplate(
  templateId: string,
  eventType: string,
  overrides?: Partial<EventContent>,
): CanvasData | null {
  const layout = getTemplateDefinition(templateId);
  if (!layout) return null;
  return buildCanvasFromLayout(layout, eventType, overrides);
}

function buildStoryPage(layout: LayoutDefinition, content: EventContent, pageNum: number): CanvasElement[] {
  const c = layout.colors, t = layout.typography;
  if (pageNum === 2) {
    // Details / Story page
    return [
      shp('deco-top', 0, 0, 1080, 12, c.primary, { z: 1, locked: true }),
      txt('title', 140, 80, 800, 100,
        `<p style="font-size:${t.titleSize}px;color:${c.primary};text-align:center;font-weight:bold">Our Story</p>`,
        'Our Story', { fontSize: t.titleSize, color: c.primary, align: 'center', weight: 700, z: 2 }),
      txt('story-1', 140, 210, 800, 120,
        `<p style="font-size:${t.bodySize}px;color:#1f2937;text-align:center">${content.description}</p>`,
        content.description, { fontSize: t.bodySize, color: '#1f2937', align: 'center', z: 3 }),
      shp('photo-1', 140, 360, 360, 360, c.surface, { z: 4 }),
      txt('photo-label-1', 140, 530, 360, 40,
        `<p style="font-size:18px;color:${c.primary};text-align:center">[ Photo 1 ]</p>`,
        '[ Photo 1 ]', { fontSize: 18, color: c.primary, align: 'center', z: 5 }),
      shp('photo-2', 580, 360, 360, 360, c.surface, { z: 6 }),
      txt('photo-label-2', 580, 530, 360, 40,
        `<p style="font-size:18px;color:${c.primary};text-align:center">[ Photo 2 ]</p>`,
        '[ Photo 2 ]', { fontSize: 18, color: c.primary, align: 'center', z: 7 }),
      txt('details', 140, 760, 800, 80,
        `<p style="font-size:${t.headingSize}px;color:#1f2937;text-align:center;font-weight:bold">Event Details</p>`,
        'Event Details', { fontSize: t.headingSize, color: '#1f2937', align: 'center', weight: 700, z: 8 }),
      txt('date-label', 140, 860, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.dateLabel}</p>`,
        content.dateLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 9 }),
      txt('date-value', 140, 895, 800, 40,
        `<p style="font-size:${t.headingSize}px;color:#1f2937;text-align:left">${content.dateValue}</p>`,
        content.dateValue, { fontSize: t.headingSize, color: '#1f2937', align: 'left', z: 10 }),
      txt('location-label', 140, 955, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:left">${content.locationLabel}</p>`,
        content.locationLabel, { fontSize: t.labelSize, color: '#9ca3af', align: 'left', z: 11 }),
      txt('location-value', 140, 990, 800, 70,
        `<p style="font-size:${t.headingSize}px;color:#1f2937;text-align:left">${nl2br(content.locationValue)}</p>`,
        content.locationValue, { fontSize: t.headingSize, color: '#1f2937', align: 'left', z: 12 }),
      txt('contact', 140, 1200, 800, 50,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:center">${content.contact}</p>`,
        content.contact, { fontSize: t.labelSize, color: '#9ca3af', align: 'center', z: 13 }),
    ];
  }
  return [];
}

function buildGalleryPage(layout: LayoutDefinition, content: EventContent, pageNum: number): CanvasElement[] {
  const c = layout.colors, t = layout.typography;
  if (pageNum === 2) {
    // Gallery / Details page
    return [
      shp('deco-bar', 0, 0, 1080, 200, c.primary, { z: 1, locked: true }),
      txt('title', 140, 40, 800, 80,
        `<p style="font-size:${t.titleSize}px;color:#fff;text-align:center;font-weight:bold">Gallery</p>`,
        'Gallery', { fontSize: t.titleSize, color: '#ffffff', align: 'center', weight: 700, z: 2 }),
      shp('photo-1', 120, 240, 280, 280, c.surface, { z: 3 }),
      txt('p1', 120, 360, 280, 40,
        `<p style="font-size:16px;color:${c.primary};text-align:center">[ Photo ]</p>`,
        '[ Photo ]', { fontSize: 16, color: c.primary, align: 'center', z: 4 }),
      shp('photo-2', 400, 240, 280, 280, c.surface, { z: 5 }),
      txt('p2', 400, 360, 280, 40,
        `<p style="font-size:16px;color:${c.primary};text-align:center">[ Photo ]</p>`,
        '[ Photo ]', { fontSize: 16, color: c.primary, align: 'center', z: 6 }),
      shp('photo-3', 680, 240, 280, 280, c.surface, { z: 7 }),
      txt('p3', 680, 360, 280, 40,
        `<p style="font-size:16px;color:${c.primary};text-align:center">[ Photo ]</p>`,
        '[ Photo ]', { fontSize: 16, color: c.primary, align: 'center', z: 8 }),
      shp('photo-4', 120, 560, 280, 280, c.surface, { z: 9 }),
      txt('p4', 120, 680, 280, 40,
        `<p style="font-size:16px;color:${c.primary};text-align:center">[ Photo ]</p>`,
        '[ Photo ]', { fontSize: 16, color: c.primary, align: 'center', z: 10 }),
      shp('photo-5', 400, 560, 280, 280, c.surface, { z: 11 }),
      txt('p5', 400, 680, 280, 40,
        `<p style="font-size:16px;color:${c.primary};text-align:center">[ Photo ]</p>`,
        '[ Photo ]', { fontSize: 16, color: c.primary, align: 'center', z: 12 }),
      shp('photo-6', 680, 560, 280, 280, c.surface, { z: 13 }),
      txt('p6', 680, 680, 280, 40,
        `<p style="font-size:16px;color:${c.primary};text-align:center">[ Photo ]</p>`,
        '[ Photo ]', { fontSize: 16, color: c.primary, align: 'center', z: 14 }),
      txt('caption', 140, 900, 800, 50,
        `<p style="font-size:${t.bodySize}px;color:#1f2937;text-align:center">Share your memories with us!</p>`,
        'Share your memories with us!', { fontSize: t.bodySize, color: '#1f2937', align: 'center', z: 15 }),
    ];
  }
  if (pageNum === 3) {
    // RSVP / Final page
    return [
      shp('deco-top', 0, 0, 1080, 12, c.primary, { z: 1, locked: true }),
      txt('title', 140, 80, 800, 100,
        `<p style="font-size:${t.titleSize}px;color:${c.primary};text-align:center;font-weight:bold">RSVP</p>`,
        'RSVP', { fontSize: t.titleSize, color: c.primary, align: 'center', weight: 700, z: 2 }),
      txt('subtitle', 140, 190, 800, 60,
        `<p style="font-size:${t.subtitleSize}px;color:#4b5563;text-align:center">${content.rsvpHeading}</p>`,
        content.rsvpHeading, { fontSize: t.subtitleSize, color: '#4b5563', align: 'center', z: 3 }),
      txt('name-label', 140, 300, 200, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.nameLabel}</p>`,
        content.nameLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 4 }),
      fld('name-field', 140, 335, 800, 50, 'Name', content.namePlaceholder, 'text-input', { required: true, z: 5 }),
      txt('guests-label', 140, 415, 300, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">${content.guestsLabel}</p>`,
        content.guestsLabel, { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 6 }),
      fld('guests-field', 140, 450, 800, 50, 'Guests', content.guestsPlaceholder, 'number-input', { required: true, z: 7 }),
      txt('message-label', 140, 530, 300, 30,
        `<p style="font-size:${t.labelSize}px;color:#4b5563;text-align:left">Message</p>`,
        'Message', { fontSize: t.labelSize, color: '#4b5563', align: 'left', z: 8 }),
      fld('message-field', 140, 565, 800, 50, 'Message', 'Leave a message...', 'text-input', { required: false, z: 9 }),
      txt('contact', 140, 700, 800, 50,
        `<p style="font-size:${t.labelSize}px;color:#9ca3af;text-align:center">${content.contact}</p>`,
        content.contact, { fontSize: t.labelSize, color: '#9ca3af', align: 'center', z: 10 }),
      shp('deco-circle', 960, 200, 60, 60, c.primary, { shape: 'circle', z: 11, locked: true, op: 0.2 }),
    ];
  }
  return [];
}

export function buildCanvasFromLayout(
  layout: LayoutDefinition,
  eventType: string,
  overrides?: Partial<EventContent>,
): CanvasData {
  const content = { ...getContentForEventType(eventType), ...overrides };

  let firstPageElements: CanvasElement[];
  switch (layout.layoutType) {
    case 'invitation-vertical':
      firstPageElements = buildInvitationVertical(layout, content).elements;
      break;
    case 'event-poster':
      firstPageElements = buildEventPoster(layout, content).elements;
      break;
    case 'celebration-card':
      firstPageElements = buildCelebrationCard(layout, content).elements;
      break;
    default:
      firstPageElements = buildInvitationVertical(layout, content).elements;
  }

  const pageCount = layout.pageCount ?? 1;
  const pages = [
    { id: 'page-1', name: 'Cover', elements: firstPageElements },
  ];

  if (pageCount >= 2) {
    pages.push({
      id: 'page-2',
      name: pageCount === 2 ? 'Story' : 'Gallery',
      elements: pageCount === 2
        ? buildStoryPage(layout, content, 2)
        : buildGalleryPage(layout, content, 2),
    });
  }

  if (pageCount >= 3) {
    pages.push({
      id: 'page-3',
      name: 'RSVP',
      elements: buildGalleryPage(layout, content, 3),
    });
  }

  // Add submit button to last page
  const lastPage = pages[pages.length - 1];
  lastPage.elements.push(
    btnGroup('submit-btn', 140, 1750, 800, 80, { z: 100 })
  );

  return {
    version: 1,
    canvas: {
      width: 1080,
      height: 1920,
      backgroundColor: layout.colors.background,
    },
    elements: firstPageElements,
    pages,
    currentPageIndex: 0,
  };
}
