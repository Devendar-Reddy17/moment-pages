-- Add slug column for frontend key matching (safe to re-run)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='templates' AND column_name='slug') THEN
        ALTER TABLE templates ADD COLUMN slug VARCHAR(50);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);

-- Seed default templates matching frontend IDs (upsert on conflict)
INSERT INTO templates (name, event_type, category, canvas_json, slug, sort_order, is_active)
VALUES (
    'Elegant Birthday',
    'birthday',
    'default',
    '{"width":1080,"height":1920,"backgroundColor":"#fff1f2","elements":[
    {"id":"deco-top","type":"shape","x":0,"y":0,"width":1080,"height":12,"rotation":0,"zIndex":1,"locked":true,"opacity":1,"content":{"shapeType":"rect","fillColor":"#f43f5e"}},
    {"id":"title","type":"text","x":140,"y":80,"width":800,"height":120,"rotation":0,"zIndex":2,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:64px; color:#be123c; text-align:center; font-weight:bold;\">Happy Birthday!</p>","plainText":"Happy Birthday!","fontFamily":"Inter","fontSize":64,"color":"#be123c","textAlign":"center"}},
    {"id":"name","type":"text","x":140,"y":220,"width":800,"height":60,"rotation":0,"zIndex":3,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:36px; color:#881337; text-align:center;\">Sarah''s 30th Birthday</p>","plainText":"Sarah''s 30th Birthday","fontFamily":"Inter","fontSize":36,"color":"#881337","textAlign":"center"}},
    {"id":"photo-box","type":"shape","x":340,"y":310,"width":400,"height":400,"rotation":0,"zIndex":4,"locked":false,"opacity":1,"content":{"shapeType":"rect","fillColor":"#fecdd3"}},
    {"id":"photo-text","type":"text","x":340,"y":490,"width":400,"height":40,"rotation":0,"zIndex":5,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#be123c; text-align:center;\">[ Your Photo Here ]</p>","plainText":"[ Your Photo Here ]","fontFamily":"Inter","fontSize":18,"color":"#be123c","textAlign":"center"}},
    {"id":"join-us","type":"text","x":140,"y":740,"width":800,"height":40,"rotation":0,"zIndex":6,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#4b5563; text-align:center;\">You are warmly invited to celebrate this special day with us.</p>","plainText":"You are warmly invited to celebrate this special day with us.","fontFamily":"Inter","fontSize":22,"color":"#4b5563","textAlign":"center"}},
    {"id":"when-label","type":"text","x":140,"y":820,"width":200,"height":30,"rotation":0,"zIndex":7,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">DATE & TIME</p>","plainText":"DATE & TIME","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"when-value","type":"text","x":140,"y":855,"width":800,"height":40,"rotation":0,"zIndex":8,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Saturday, June 14th at 6:00 PM</p>","plainText":"Saturday, June 14th at 6:00 PM","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"where-label","type":"text","x":140,"y":915,"width":200,"height":30,"rotation":0,"zIndex":9,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">LOCATION</p>","plainText":"LOCATION","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"where-value","type":"text","x":140,"y":950,"width":800,"height":70,"rotation":0,"zIndex":10,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">The Grand Ballroom<br/>123 Celebration Ave, New York</p>","plainText":"The Grand Ballroom 123 Celebration Ave, New York","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"rsvp-heading","type":"text","x":140,"y":1060,"width":800,"height":40,"rotation":0,"zIndex":11,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#be123c; text-align:center; font-weight:bold;\">Kindly RSVP by June 1st</p>","plainText":"Kindly RSVP by June 1st","fontFamily":"Inter","fontSize":22,"color":"#be123c","textAlign":"center"}},
    {"id":"name-label","type":"text","x":140,"y":1120,"width":200,"height":30,"rotation":0,"zIndex":12,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Your Name</p>","plainText":"Your Name","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"name-field","type":"form-element","x":140,"y":1155,"width":800,"height":50,"rotation":0,"zIndex":13,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Name","placeholder":"Enter your name","required":true}},
    {"id":"guests-label","type":"text","x":140,"y":1225,"width":300,"height":30,"rotation":0,"zIndex":14,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Number of Guests</p>","plainText":"Number of Guests","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"guests-field","type":"form-element","x":140,"y":1260,"width":800,"height":50,"rotation":0,"zIndex":15,"locked":false,"opacity":1,"content":{"fieldType":"number-input","label":"Guests","placeholder":"How many guests?","required":true}},
    {"id":"contact","type":"text","x":140,"y":1380,"width":800,"height":50,"rotation":0,"zIndex":16,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:center;\">Questions? Contact us at party@example.com or (555) 123-4567</p>","plainText":"Questions? Contact us at party@example.com or (555) 123-4567","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"center"}},
    {"id":"deco-circle-1","type":"shape","x":80,"y":200,"width":40,"height":40,"rotation":0,"zIndex":17,"locked":true,"opacity":0.3,"content":{"shapeType":"circle","fillColor":"#f43f5e"}},
    {"id":"deco-circle-2","type":"shape","x":960,"y":600,"width":60,"height":60,"rotation":0,"zIndex":18,"locked":true,"opacity":0.3,"content":{"shapeType":"circle","fillColor":"#f43f5e"}}
]}',
    'birthday-elegant',
    1,
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    canvas_json = EXCLUDED.canvas_json,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

INSERT INTO templates (name, event_type, category, canvas_json, slug, sort_order, is_active)
VALUES (
    'Classic Wedding',
    'wedding',
    'default',
    '{"width":1080,"height":1920,"backgroundColor":"#faf5ff","elements":[
    {"id":"deco-line","type":"shape","x":390,"y":60,"width":300,"height":4,"rotation":0,"zIndex":1,"locked":true,"opacity":1,"content":{"shapeType":"rect","fillColor":"#9333ea"}},
    {"id":"title","type":"text","x":140,"y":90,"width":800,"height":100,"rotation":0,"zIndex":2,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:52px; color:#6b21a8; text-align:center; font-weight:bold;\">Wedding Invitation</p>","plainText":"Wedding Invitation","fontFamily":"Inter","fontSize":52,"color":"#6b21a8","textAlign":"center"}},
    {"id":"names","type":"text","x":140,"y":200,"width":800,"height":80,"rotation":0,"zIndex":3,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:42px; color:#4c1d95; text-align:center;\">Emma & James</p>","plainText":"Emma & James","fontFamily":"Inter","fontSize":42,"color":"#4c1d95","textAlign":"center"}},
    {"id":"verse","type":"text","x":240,"y":300,"width":600,"height":50,"rotation":0,"zIndex":4,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:20px; color:#7c3aed; text-align:center; font-style:italic;\">Together with their families invite you to celebrate their love</p>","plainText":"Together with their families invite you to celebrate their love","fontFamily":"Inter","fontSize":20,"color":"#7c3aed","textAlign":"center"}},
    {"id":"photo-box","type":"shape","x":290,"y":380,"width":500,"height":500,"rotation":0,"zIndex":5,"locked":false,"opacity":1,"content":{"shapeType":"rect","fillColor":"#e9d5ff"}},
    {"id":"photo-text","type":"text","x":290,"y":590,"width":500,"height":40,"rotation":0,"zIndex":6,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#7c3aed; text-align:center;\">[ Couple Photo ]</p>","plainText":"[ Couple Photo ]","fontFamily":"Inter","fontSize":18,"color":"#7c3aed","textAlign":"center"}},
    {"id":"ceremony-label","type":"text","x":140,"y":920,"width":400,"height":30,"rotation":0,"zIndex":7,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">CEREMONY</p>","plainText":"CEREMONY","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"ceremony-value","type":"text","x":140,"y":955,"width":800,"height":80,"rotation":0,"zIndex":8,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#1f2937; text-align:left;\">Saturday, September 20th, 2025 at 3:00 PM<br/>St. Mary''s Church, 45 Garden Street, Boston</p>","plainText":"Saturday, September 20th, 2025 at 3:00 PM St. Mary''s Church, 45 Garden Street, Boston","fontFamily":"Inter","fontSize":22,"color":"#1f2937","textAlign":"left"}},
    {"id":"reception-label","type":"text","x":140,"y":1055,"width":400,"height":30,"rotation":0,"zIndex":9,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">RECEPTION</p>","plainText":"RECEPTION","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"reception-value","type":"text","x":140,"y":1090,"width":800,"height":60,"rotation":0,"zIndex":10,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#1f2937; text-align:left;\">5:00 PM onwards<br/>Rosewood Hotel Ballroom</p>","plainText":"5:00 PM onwards Rosewood Hotel Ballroom","fontFamily":"Inter","fontSize":22,"color":"#1f2937","textAlign":"left"}},
    {"id":"attire","type":"text","x":140,"y":1180,"width":800,"height":40,"rotation":0,"zIndex":11,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#7c3aed; text-align:center; font-style:italic;\">Dress Code: Formal / Black Tie Optional</p>","plainText":"Dress Code: Formal / Black Tie Optional","fontFamily":"Inter","fontSize":18,"color":"#7c3aed","textAlign":"center"}},
    {"id":"rsvp-heading","type":"text","x":140,"y":1250,"width":800,"height":40,"rotation":0,"zIndex":12,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#6b21a8; text-align:center; font-weight:bold;\">Please RSVP by August 1st</p>","plainText":"Please RSVP by August 1st","fontFamily":"Inter","fontSize":22,"color":"#6b21a8","textAlign":"center"}},
    {"id":"name-label","type":"text","x":140,"y":1310,"width":200,"height":30,"rotation":0,"zIndex":13,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Guest Name(s)</p>","plainText":"Guest Name(s)","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"name-field","type":"form-element","x":140,"y":1345,"width":800,"height":50,"rotation":0,"zIndex":14,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Name","placeholder":"Enter your full name","required":true}},
    {"id":"dietary-label","type":"text","x":140,"y":1415,"width":400,"height":30,"rotation":0,"zIndex":15,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Dietary Requirements</p>","plainText":"Dietary Requirements","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"dietary-field","type":"form-element","x":140,"y":1450,"width":800,"height":50,"rotation":0,"zIndex":16,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Dietary","placeholder":"Vegetarian, allergies, etc.","required":false}},
    {"id":"contact","type":"text","x":140,"y":1550,"width":800,"height":50,"rotation":0,"zIndex":17,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:center;\">Contact: emma.james.wedding@example.com</p>","plainText":"Contact: emma.james.wedding@example.com","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"center"}},
    {"id":"deco-heart","type":"shape","x":490,"y":1700,"width":100,"height":100,"rotation":0,"zIndex":18,"locked":true,"opacity":0.2,"content":{"shapeType":"circle","fillColor":"#c084fc"}}
]}',
    'wedding-classic',
    2,
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    canvas_json = EXCLUDED.canvas_json,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

INSERT INTO templates (name, event_type, category, canvas_json, slug, sort_order, is_active)
VALUES (
    'Modern Party',
    'party',
    'default',
    '{"width":1080,"height":1920,"backgroundColor":"#f0f9ff","elements":[
    {"id":"deco-bar","type":"shape","x":0,"y":0,"width":1080,"height":200,"rotation":0,"zIndex":1,"locked":true,"opacity":1,"content":{"shapeType":"rect","fillColor":"#0284c7"}},
    {"id":"title","type":"text","x":140,"y":40,"width":800,"height":80,"rotation":0,"zIndex":2,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:56px; color:#ffffff; text-align:center; font-weight:bold;\">PARTY TIME!</p>","plainText":"PARTY TIME!","fontFamily":"Inter","fontSize":56,"color":"#ffffff","textAlign":"center"}},
    {"id":"subtitle","type":"text","x":140,"y":130,"width":800,"height":40,"rotation":0,"zIndex":3,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#e0f2fe; text-align:center;\">Summer Bash 2025</p>","plainText":"Summer Bash 2025","fontFamily":"Inter","fontSize":24,"color":"#e0f2fe","textAlign":"center"}},
    {"id":"photo-box","type":"shape","x":240,"y":240,"width":600,"height":400,"rotation":0,"zIndex":4,"locked":false,"opacity":1,"content":{"shapeType":"rect","fillColor":"#bae6fd"}},
    {"id":"photo-text","type":"text","x":240,"y":410,"width":600,"height":40,"rotation":0,"zIndex":5,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#0369a1; text-align:center;\">[ Event Photo / Flyer ]</p>","plainText":"[ Event Photo / Flyer ]","fontFamily":"Inter","fontSize":18,"color":"#0369a1","textAlign":"center"}},
    {"id":"desc","type":"text","x":140,"y":680,"width":800,"height":60,"rotation":0,"zIndex":6,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#1f2937; text-align:center;\">Get ready for the hottest party of the summer! Music, drinks, and good vibes.</p>","plainText":"Get ready for the hottest party of the summer! Music, drinks, and good vibes.","fontFamily":"Inter","fontSize":22,"color":"#1f2937","textAlign":"center"}},
    {"id":"when-label","type":"text","x":140,"y":780,"width":200,"height":30,"rotation":0,"zIndex":7,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">WHEN</p>","plainText":"WHEN","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"when-value","type":"text","x":140,"y":815,"width":800,"height":40,"rotation":0,"zIndex":8,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Friday, July 18th at 9:00 PM</p>","plainText":"Friday, July 18th at 9:00 PM","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"where-label","type":"text","x":140,"y":875,"width":200,"height":30,"rotation":0,"zIndex":9,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">WHERE</p>","plainText":"WHERE","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"where-value","type":"text","x":140,"y":910,"width":800,"height":70,"rotation":0,"zIndex":10,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Skyline Rooftop Bar<br/>88th Floor, Tower Plaza, Miami</p>","plainText":"Skyline Rooftop Bar 88th Floor, Tower Plaza, Miami","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"music","type":"text","x":140,"y":1010,"width":800,"height":40,"rotation":0,"zIndex":11,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#0284c7; text-align:center; font-weight:bold;\">DJ Set by Marco V | Free Entry Before 11 PM</p>","plainText":"DJ Set by Marco V | Free Entry Before 11 PM","fontFamily":"Inter","fontSize":18,"color":"#0284c7","textAlign":"center"}},
    {"id":"rsvp-heading","type":"text","x":140,"y":1080,"width":800,"height":40,"rotation":0,"zIndex":12,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#0369a1; text-align:center; font-weight:bold;\">Reserve Your Spot</p>","plainText":"Reserve Your Spot","fontFamily":"Inter","fontSize":22,"color":"#0369a1","textAlign":"center"}},
    {"id":"name-label","type":"text","x":140,"y":1140,"width":200,"height":30,"rotation":0,"zIndex":13,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Your Name</p>","plainText":"Your Name","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"name-field","type":"form-element","x":140,"y":1175,"width":800,"height":50,"rotation":0,"zIndex":14,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Name","placeholder":"Enter your name","required":true}},
    {"id":"guests-label","type":"text","x":140,"y":1245,"width":300,"height":30,"rotation":0,"zIndex":15,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Bringing Friends?</p>","plainText":"Bringing Friends?","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"guests-field","type":"form-element","x":140,"y":1280,"width":800,"height":50,"rotation":0,"zIndex":16,"locked":false,"opacity":1,"content":{"fieldType":"number-input","label":"Guests","placeholder":"How many guests?","required":true}},
    {"id":"contact","type":"text","x":140,"y":1400,"width":800,"height":50,"rotation":0,"zIndex":17,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:center;\">Questions? DM us @summerbash or call (305) 555-7890</p>","plainText":"Questions? DM us @summerbash or call (305) 555-7890","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"center"}},
    {"id":"deco-circle","type":"shape","x":1000,"y":300,"width":50,"height":50,"rotation":0,"zIndex":18,"locked":true,"opacity":0.3,"content":{"shapeType":"circle","fillColor":"#0284c7"}}
]}',
    'party-modern',
    3,
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    canvas_json = EXCLUDED.canvas_json,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

INSERT INTO templates (name, event_type, category, canvas_json, slug, sort_order, is_active)
VALUES (
    'Baby Shower',
    'birthday',
    'default',
    '{"width":1080,"height":1920,"backgroundColor":"#ecfdf5","elements":[
    {"id":"deco-top","type":"shape","x":0,"y":0,"width":1080,"height":160,"rotation":0,"zIndex":1,"locked":true,"opacity":1,"content":{"shapeType":"rect","fillColor":"#10b981"}},
    {"id":"title","type":"text","x":140,"y":40,"width":800,"height":80,"rotation":0,"zIndex":2,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:56px; color:#ffffff; text-align:center; font-weight:bold;\">Baby Shower</p>","plainText":"Baby Shower","fontFamily":"Inter","fontSize":56,"color":"#ffffff","textAlign":"center"}},
    {"id":"subtitle","type":"text","x":140,"y":120,"width":800,"height":40,"rotation":0,"zIndex":3,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#d1fae5; text-align:center;\">A little one is on the way!</p>","plainText":"A little one is on the way!","fontFamily":"Inter","fontSize":24,"color":"#d1fae5","textAlign":"center"}},
    {"id":"photo-box","type":"shape","x":340,"y":200,"width":400,"height":400,"rotation":0,"zIndex":4,"locked":false,"opacity":1,"content":{"shapeType":"rect","fillColor":"#a7f3d0"}},
    {"id":"photo-text","type":"text","x":340,"y":380,"width":400,"height":40,"rotation":0,"zIndex":5,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#047857; text-align:center;\">[ Ultrasound Photo ]</p>","plainText":"[ Ultrasound Photo ]","fontFamily":"Inter","fontSize":18,"color":"#047857","textAlign":"center"}},
    {"id":"welcome","type":"text","x":140,"y":640,"width":800,"height":60,"rotation":0,"zIndex":6,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#1f2937; text-align:center;\">Join us to shower the parents-to-be with love and blessings.</p>","plainText":"Join us to shower the parents-to-be with love and blessings.","fontFamily":"Inter","fontSize":22,"color":"#1f2937","textAlign":"center"}},
    {"id":"when-label","type":"text","x":140,"y":740,"width":200,"height":30,"rotation":0,"zIndex":7,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">DATE & TIME</p>","plainText":"DATE & TIME","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"when-value","type":"text","x":140,"y":775,"width":800,"height":40,"rotation":0,"zIndex":8,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Sunday, March 8th at 2:00 PM</p>","plainText":"Sunday, March 8th at 2:00 PM","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"where-label","type":"text","x":140,"y":835,"width":200,"height":30,"rotation":0,"zIndex":9,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">LOCATION</p>","plainText":"LOCATION","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"where-value","type":"text","x":140,"y":870,"width":800,"height":70,"rotation":0,"zIndex":10,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">The Garden Terrace<br/>456 Bloom Lane, Austin</p>","plainText":"The Garden Terrace 456 Bloom Lane, Austin","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"registry","type":"text","x":140,"y":970,"width":800,"height":40,"rotation":0,"zIndex":11,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#059669; text-align:center; font-weight:bold;\">Gift Registry: BabyList.com/shower/littleone</p>","plainText":"Gift Registry: BabyList.com/shower/littleone","fontFamily":"Inter","fontSize":18,"color":"#059669","textAlign":"center"}},
    {"id":"rsvp-heading","type":"text","x":140,"y":1040,"width":800,"height":40,"rotation":0,"zIndex":12,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#047857; text-align:center; font-weight:bold;\">Please RSVP by February 20th</p>","plainText":"Please RSVP by February 20th","fontFamily":"Inter","fontSize":22,"color":"#047857","textAlign":"center"}},
    {"id":"name-label","type":"text","x":140,"y":1100,"width":200,"height":30,"rotation":0,"zIndex":13,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Your Name</p>","plainText":"Your Name","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"name-field","type":"form-element","x":140,"y":1135,"width":800,"height":50,"rotation":0,"zIndex":14,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Name","placeholder":"Enter your name","required":true}},
    {"id":"guests-label","type":"text","x":140,"y":1205,"width":300,"height":30,"rotation":0,"zIndex":15,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Number of Guests</p>","plainText":"Number of Guests","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"guests-field","type":"form-element","x":140,"y":1240,"width":800,"height":50,"rotation":0,"zIndex":16,"locked":false,"opacity":1,"content":{"fieldType":"number-input","label":"Guests","placeholder":"How many guests?","required":true}},
    {"id":"contact","type":"text","x":140,"y":1360,"width":800,"height":50,"rotation":0,"zIndex":17,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:center;\">Questions? Email hosts@babyshower.example.com</p>","plainText":"Questions? Email hosts@babyshower.example.com","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"center"}},
    {"id":"deco-circle","type":"shape","x":80,"y":180,"width":50,"height":50,"rotation":0,"zIndex":18,"locked":true,"opacity":0.2,"content":{"shapeType":"circle","fillColor":"#34d399"}}
]}',
    'baby-shower',
    4,
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    canvas_json = EXCLUDED.canvas_json,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

INSERT INTO templates (name, event_type, category, canvas_json, slug, sort_order, is_active)
VALUES (
    'Graduation',
    'birthday',
    'default',
    '{"width":1080,"height":1920,"backgroundColor":"#fffbeb","elements":[
    {"id":"deco-top","type":"shape","x":0,"y":0,"width":1080,"height":180,"rotation":0,"zIndex":1,"locked":true,"opacity":1,"content":{"shapeType":"rect","fillColor":"#f59e0b"}},
    {"id":"cap","type":"text","x":140,"y":30,"width":800,"height":60,"rotation":0,"zIndex":2,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:48px; color:#ffffff; text-align:center;\">Class of 2025</p>","plainText":"Class of 2025","fontFamily":"Inter","fontSize":48,"color":"#ffffff","textAlign":"center"}},
    {"id":"congrats","type":"text","x":140,"y":100,"width":800,"height":60,"rotation":0,"zIndex":3,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:36px; color:#78350f; text-align:center; font-weight:bold;\">Congratulations!</p>","plainText":"Congratulations!","fontFamily":"Inter","fontSize":36,"color":"#78350f","textAlign":"center"}},
    {"id":"graduate","type":"text","x":140,"y":220,"width":800,"height":60,"rotation":0,"zIndex":4,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:32px; color:#92400e; text-align:center;\">Alex Johnson''s Graduation</p>","plainText":"Alex Johnson''s Graduation","fontFamily":"Inter","fontSize":32,"color":"#92400e","textAlign":"center"}},
    {"id":"photo-box","type":"shape","x":340,"y":310,"width":400,"height":400,"rotation":0,"zIndex":5,"locked":false,"opacity":1,"content":{"shapeType":"rect","fillColor":"#fde68a"}},
    {"id":"photo-text","type":"text","x":340,"y":490,"width":400,"height":40,"rotation":0,"zIndex":6,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#b45309; text-align:center;\">[ Graduate Photo ]</p>","plainText":"[ Graduate Photo ]","fontFamily":"Inter","fontSize":18,"color":"#b45309","textAlign":"center"}},
    {"id":"degree","type":"text","x":140,"y":740,"width":800,"height":40,"rotation":0,"zIndex":7,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#1f2937; text-align:center;\">Bachelor of Science in Computer Science — Stanford University</p>","plainText":"Bachelor of Science in Computer Science — Stanford University","fontFamily":"Inter","fontSize":22,"color":"#1f2937","textAlign":"center"}},
    {"id":"when-label","type":"text","x":140,"y":820,"width":200,"height":30,"rotation":0,"zIndex":8,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">DATE & TIME</p>","plainText":"DATE & TIME","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"when-value","type":"text","x":140,"y":855,"width":800,"height":40,"rotation":0,"zIndex":9,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Saturday, June 21st at 11:00 AM</p>","plainText":"Saturday, June 21st at 11:00 AM","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"where-label","type":"text","x":140,"y":915,"width":200,"height":30,"rotation":0,"zIndex":10,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">LOCATION</p>","plainText":"LOCATION","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"where-value","type":"text","x":140,"y":950,"width":800,"height":70,"rotation":0,"zIndex":11,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Stanford Memorial Auditorium<br/>Stanford, CA</p>","plainText":"Stanford Memorial Auditorium Stanford, CA","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"reception","type":"text","x":140,"y":1050,"width":800,"height":40,"rotation":0,"zIndex":12,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#b45309; text-align:center;\">Reception to follow at the Faculty Club</p>","plainText":"Reception to follow at the Faculty Club","fontFamily":"Inter","fontSize":18,"color":"#b45309","textAlign":"center"}},
    {"id":"rsvp-heading","type":"text","x":140,"y":1120,"width":800,"height":40,"rotation":0,"zIndex":13,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#b45309; text-align:center; font-weight:bold;\">Please RSVP by June 10th</p>","plainText":"Please RSVP by June 10th","fontFamily":"Inter","fontSize":22,"color":"#b45309","textAlign":"center"}},
    {"id":"name-label","type":"text","x":140,"y":1180,"width":200,"height":30,"rotation":0,"zIndex":14,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Your Name</p>","plainText":"Your Name","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"name-field","type":"form-element","x":140,"y":1215,"width":800,"height":50,"rotation":0,"zIndex":15,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Name","placeholder":"Enter your name","required":true}},
    {"id":"guests-label","type":"text","x":140,"y":1285,"width":300,"height":30,"rotation":0,"zIndex":16,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Number of Guests</p>","plainText":"Number of Guests","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"guests-field","type":"form-element","x":140,"y":1320,"width":800,"height":50,"rotation":0,"zIndex":17,"locked":false,"opacity":1,"content":{"fieldType":"number-input","label":"Guests","placeholder":"How many guests?","required":true}},
    {"id":"contact","type":"text","x":140,"y":1440,"width":800,"height":50,"rotation":0,"zIndex":18,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:center;\">Questions? Contact family@graduation.example.com</p>","plainText":"Questions? Contact family@graduation.example.com","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"center"}},
    {"id":"deco-star","type":"shape","x":80,"y":200,"width":40,"height":40,"rotation":0,"zIndex":19,"locked":true,"opacity":0.3,"content":{"shapeType":"triangle","fillColor":"#f59e0b"}}
]}',
    'graduation',
    5,
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    canvas_json = EXCLUDED.canvas_json,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

INSERT INTO templates (name, event_type, category, canvas_json, slug, sort_order, is_active)
VALUES (
    'Corporate Event',
    'birthday',
    'default',
    '{"width":1080,"height":1920,"backgroundColor":"#f8fafc","elements":[
    {"id":"deco-top","type":"shape","x":0,"y":0,"width":1080,"height":12,"rotation":0,"zIndex":1,"locked":true,"opacity":1,"content":{"shapeType":"rect","fillColor":"#475569"}},
    {"id":"logo-text","type":"text","x":140,"y":40,"width":800,"height":40,"rotation":0,"zIndex":2,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:20px; color:#64748b; text-align:center; letter-spacing:4px;\">ACME CORPORATION</p>","plainText":"ACME CORPORATION","fontFamily":"Inter","fontSize":20,"color":"#64748b","textAlign":"center"}},
    {"id":"title","type":"text","x":140,"y":100,"width":800,"height":100,"rotation":0,"zIndex":3,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:52px; color:#1e293b; text-align:center; font-weight:bold;\">Annual Innovation Summit</p>","plainText":"Annual Innovation Summit","fontFamily":"Inter","fontSize":52,"color":"#1e293b","textAlign":"center"}},
    {"id":"tagline","type":"text","x":140,"y":210,"width":800,"height":40,"rotation":0,"zIndex":4,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#475569; text-align:center;\">Shaping the Future of Technology</p>","plainText":"Shaping the Future of Technology","fontFamily":"Inter","fontSize":22,"color":"#475569","textAlign":"center"}},
    {"id":"photo-box","type":"shape","x":240,"y":280,"width":600,"height":350,"rotation":0,"zIndex":5,"locked":false,"opacity":1,"content":{"shapeType":"rect","fillColor":"#e2e8f0"}},
    {"id":"photo-text","type":"text","x":240,"y":435,"width":600,"height":40,"rotation":0,"zIndex":6,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#64748b; text-align:center;\">[ Event Banner / Keynote Photo ]</p>","plainText":"[ Event Banner / Keynote Photo ]","fontFamily":"Inter","fontSize":18,"color":"#64748b","textAlign":"center"}},
    {"id":"about","type":"text","x":140,"y":670,"width":800,"height":60,"rotation":0,"zIndex":7,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:20px; color:#334155; text-align:center;\">Join industry leaders for a day of insights, networking, and innovation showcases.</p>","plainText":"Join industry leaders for a day of insights, networking, and innovation showcases.","fontFamily":"Inter","fontSize":20,"color":"#334155","textAlign":"center"}},
    {"id":"when-label","type":"text","x":140,"y":770,"width":200,"height":30,"rotation":0,"zIndex":8,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">DATE & TIME</p>","plainText":"DATE & TIME","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"when-value","type":"text","x":140,"y":805,"width":800,"height":40,"rotation":0,"zIndex":9,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Thursday, October 16th, 9:00 AM – 5:00 PM</p>","plainText":"Thursday, October 16th, 9:00 AM – 5:00 PM","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"where-label","type":"text","x":140,"y":865,"width":200,"height":30,"rotation":0,"zIndex":10,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:left;\">VENUE</p>","plainText":"VENUE","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"left"}},
    {"id":"where-value","type":"text","x":140,"y":900,"width":800,"height":70,"rotation":0,"zIndex":11,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:24px; color:#1f2937; text-align:left;\">Convention Center Hall A<br/>1000 Market Street, San Francisco</p>","plainText":"Convention Center Hall A 1000 Market Street, San Francisco","fontFamily":"Inter","fontSize":24,"color":"#1f2937","textAlign":"left"}},
    {"id":"agenda","type":"text","x":140,"y":1000,"width":800,"height":40,"rotation":0,"zIndex":12,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:18px; color:#475569; text-align:center;\">Keynotes | Panel Discussions | Networking Lunch | Demo Zone</p>","plainText":"Keynotes | Panel Discussions | Networking Lunch | Demo Zone","fontFamily":"Inter","fontSize":18,"color":"#475569","textAlign":"center"}},
    {"id":"rsvp-heading","type":"text","x":140,"y":1070,"width":800,"height":40,"rotation":0,"zIndex":13,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:22px; color:#1e293b; text-align:center; font-weight:bold;\">Secure Your Seat</p>","plainText":"Secure Your Seat","fontFamily":"Inter","fontSize":22,"color":"#1e293b","textAlign":"center"}},
    {"id":"name-label","type":"text","x":140,"y":1130,"width":200,"height":30,"rotation":0,"zIndex":14,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Full Name</p>","plainText":"Full Name","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"name-field","type":"form-element","x":140,"y":1165,"width":800,"height":50,"rotation":0,"zIndex":15,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Name","placeholder":"Enter your full name","required":true}},
    {"id":"company-label","type":"text","x":140,"y":1235,"width":300,"height":30,"rotation":0,"zIndex":16,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#4b5563; text-align:left;\">Company / Organization</p>","plainText":"Company / Organization","fontFamily":"Inter","fontSize":16,"color":"#4b5563","textAlign":"left"}},
    {"id":"company-field","type":"form-element","x":140,"y":1270,"width":800,"height":50,"rotation":0,"zIndex":17,"locked":false,"opacity":1,"content":{"fieldType":"text-input","label":"Company","placeholder":"Your company name","required":true}},
    {"id":"contact","type":"text","x":140,"y":1380,"width":800,"height":50,"rotation":0,"zIndex":18,"locked":false,"opacity":1,"content":{"html":"<p style=\"font-size:16px; color:#9ca3af; text-align:center;\">For inquiries: events@acme-corp.example.com | (415) 555-0199</p>","plainText":"For inquiries: events@acme-corp.example.com | (415) 555-0199","fontFamily":"Inter","fontSize":16,"color":"#9ca3af","textAlign":"center"}},
    {"id":"deco-line","type":"shape","x":440,"y":1480,"width":200,"height":4,"rotation":0,"zIndex":19,"locked":true,"opacity":1,"content":{"shapeType":"rect","fillColor":"#475569"}}
]}',
    'corporate',
    6,
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    event_type = EXCLUDED.event_type,
    category = EXCLUDED.category,
    canvas_json = EXCLUDED.canvas_json,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;
