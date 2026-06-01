-- Add layout_definition column for frontend template builder (safe to re-run)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='templates' AND column_name='layout_definition') THEN
        ALTER TABLE templates ADD COLUMN layout_definition JSONB;
    END IF;
END $$;

-- Populate layout_definition for existing templates from frontend definitions
UPDATE templates SET layout_definition = '{
  "layoutType": "invitation-vertical",
  "pageCount": 1,
  "colors": { "primary": "#be123c", "background": "#fff1f2", "accent": "#f43f5e", "surface": "#fecdd3" },
  "typography": { "titleSize": 64, "subtitleSize": 36, "headingSize": 24, "bodySize": 22, "labelSize": 16 }
}' WHERE slug = 'birthday-elegant';

UPDATE templates SET layout_definition = '{
  "layoutType": "celebration-card",
  "pageCount": 1,
  "colors": { "primary": "#6b21a8", "background": "#faf5ff", "accent": "#c084fc", "surface": "#e9d5ff" },
  "typography": { "titleSize": 52, "subtitleSize": 36, "headingSize": 22, "bodySize": 20, "labelSize": 16 }
}' WHERE slug = 'wedding-classic';

UPDATE templates SET layout_definition = '{
  "layoutType": "event-poster",
  "pageCount": 1,
  "colors": { "primary": "#0284c7", "background": "#f0f9ff", "accent": "#0284c7", "surface": "#bae6fd" },
  "typography": { "titleSize": 56, "subtitleSize": 24, "headingSize": 24, "bodySize": 22, "labelSize": 16 }
}' WHERE slug = 'party-modern';

UPDATE templates SET layout_definition = '{
  "layoutType": "invitation-vertical",
  "pageCount": 1,
  "colors": { "primary": "#047857", "background": "#ecfdf5", "accent": "#34d399", "surface": "#a7f3d0" },
  "typography": { "titleSize": 56, "subtitleSize": 24, "headingSize": 24, "bodySize": 22, "labelSize": 16 }
}' WHERE slug = 'baby-shower';

UPDATE templates SET layout_definition = '{
  "layoutType": "event-poster",
  "pageCount": 1,
  "colors": { "primary": "#b45309", "background": "#fffbeb", "accent": "#f59e0b", "surface": "#fde68a" },
  "typography": { "titleSize": 48, "subtitleSize": 32, "headingSize": 22, "bodySize": 22, "labelSize": 16 }
}' WHERE slug = 'graduation';

UPDATE templates SET layout_definition = '{
  "layoutType": "invitation-vertical",
  "pageCount": 1,
  "colors": { "primary": "#334155", "background": "#f8fafc", "accent": "#475569", "surface": "#e2e8f0" },
  "typography": { "titleSize": 52, "subtitleSize": 22, "headingSize": 24, "bodySize": 20, "labelSize": 16 }
}' WHERE slug = 'corporate';
