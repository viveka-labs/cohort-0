-- =============================================================================
-- Seed Data: AI Tools and Tech Stack Tags
-- =============================================================================

-- AI Tools (13)
INSERT INTO ai_tools (name, slug) VALUES
  ('Claude', 'claude'),
  ('GPT-4', 'gpt-4'),
  ('Cursor', 'cursor'),
  ('GitHub Copilot', 'github-copilot'),
  ('v0', 'v0'),
  ('Bolt', 'bolt'),
  ('Replit Agent', 'replit-agent'),
  ('Midjourney', 'midjourney'),
  ('Stable Diffusion', 'stable-diffusion'),
  ('Whisper', 'whisper'),
  ('ElevenLabs', 'elevenlabs'),
  ('Gemini', 'gemini'),
  ('Lovable', 'lovable')
ON CONFLICT (slug) DO NOTHING;

-- Tech Stack Tags (15)
INSERT INTO tech_stack_tags (name, slug) VALUES
  ('Next.js', 'nextjs'),
  ('React', 'react'),
  ('Python', 'python'),
  ('TypeScript', 'typescript'),
  ('JavaScript', 'javascript'),
  ('Tailwind CSS', 'tailwindcss'),
  ('Supabase', 'supabase'),
  ('Node.js', 'nodejs'),
  ('PostgreSQL', 'postgresql'),
  ('Vercel', 'vercel'),
  ('Firebase', 'firebase'),
  ('Swift', 'swift'),
  ('Flutter', 'flutter'),
  ('Rust', 'rust'),
  ('Go', 'go')
ON CONFLICT (slug) DO NOTHING;
