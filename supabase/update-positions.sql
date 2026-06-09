-- ============================================
-- Update SOASA Executive Positions
-- ============================================
-- Run this ONLY IF you already deployed and need to update position names
-- If you haven't deployed yet, just run schema.sql

-- Update the slug and title for president position
UPDATE positions
SET
  slug = 'president-vp',
  title = 'President & Vice President'
WHERE slug = 'president-ticket';

-- Update treasurer title
UPDATE positions
SET title = 'Treasurer / Financial Secretary'
WHERE slug = 'treasurer';

-- Update PRO titles to clarify main/deputy
UPDATE positions
SET title = 'Public Relations Officer (Main)'
WHERE slug = 'pro';

UPDATE positions
SET title = 'Public Relations Officer (Deputy)'
WHERE slug = 'deputy-pro';

-- Update Organizer titles to clarify main/deputy
UPDATE positions
SET title = 'Organizer (Main)'
WHERE slug = 'organizer';

UPDATE positions
SET title = 'Organizer (Deputy)'
WHERE slug = 'deputy-organizer';

-- Verify the updates
SELECT slug, title, sort_order
FROM positions
ORDER BY sort_order;

-- ============================================
-- Expected Result:
-- ============================================
-- slug                  | title                              | sort_order
-- ---------------------|------------------------------------|------------
-- president-vp         | President & Vice President          | 10
-- secretary            | Secretary                           | 20
-- treasurer            | Treasurer / Financial Secretary     | 30
-- pro                  | Public Relations Officer (Main)     | 40
-- deputy-pro           | Public Relations Officer (Deputy)   | 50
-- organizer            | Organizer (Main)                    | 60
-- deputy-organizer     | Organizer (Deputy)                  | 70
-- welfare              | Welfare Chairperson                 | 80
-- electoral-commissioner| Electoral Commissioner              | 90
