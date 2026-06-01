-- Add multi-page templates
INSERT INTO templates (name, event_type, category, canvas_json, layout_definition, slug, sort_order, is_active)
VALUES (
    'Story Album',
    'anniversary',
    'default',
    '{}',
    '{
      "layoutType": "invitation-vertical",
      "pageCount": 2,
      "colors": { "primary": "#7c3aed", "background": "#f5f3ff", "accent": "#a78bfa", "surface": "#ddd6fe" },
      "typography": { "titleSize": 52, "subtitleSize": 28, "headingSize": 22, "bodySize": 20, "labelSize": 16 }
    }',
    'story-album',
    7,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    layout_definition = EXCLUDED.layout_definition,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

INSERT INTO templates (name, event_type, category, canvas_json, layout_definition, slug, sort_order, is_active)
VALUES (
    'Event Album',
    'birthday',
    'default',
    '{}',
    '{
      "layoutType": "event-poster",
      "pageCount": 3,
      "colors": { "primary": "#0ea5e9", "background": "#f0f9ff", "accent": "#38bdf8", "surface": "#bae6fd" },
      "typography": { "titleSize": 48, "subtitleSize": 24, "headingSize": 22, "bodySize": 20, "labelSize": 16 }
    }',
    'event-album',
    8,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    layout_definition = EXCLUDED.layout_definition,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;
