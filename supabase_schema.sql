-- ========================================================
-- TEAMFLOW SUPABASE DATABASE SCHEMA & REALTIME SETUP SCRIPT
-- ========================================================

-- 1. Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  activity TEXT NOT NULL DEFAULT 'Badminton Tournament',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  number INT NOT NULL,
  name TEXT NOT NULL,
  lead_name TEXT NOT NULL,
  lead_avatar TEXT,
  note TEXT,
  color_scheme_id TEXT NOT NULL DEFAULT 'amber',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS note TEXT;

-- 3. Create levels table
CREATE TABLE IF NOT EXISTS public.levels (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (room_id, number)
);

-- 4. Create team_notes table
CREATE TABLE IF NOT EXISTS public.team_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  content TEXT,
  created_by_role TEXT NOT NULL DEFAULT 'host', -- 'host' | 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id)
);

CREATE INDEX IF NOT EXISTS idx_team_notes_room_id ON public.team_notes(room_id);
CREATE INDEX IF NOT EXISTS idx_team_notes_team_id ON public.team_notes(team_id);

-- 5. Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  level INT NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  student_code TEXT,
  status TEXT NOT NULL DEFAULT 'present',
  note TEXT,
  avatar TEXT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 0;

-- Roles are scoped to a participant within a room.
CREATE TABLE IF NOT EXISTS public.participant_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'assistant', 'host')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (room_id, participant_id)
);

ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS assistant_participant_id TEXT
  REFERENCES public.participants(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_unique_student_code_per_room
  ON public.participants(room_id, student_code)
  WHERE student_code IS NOT NULL;

-- 7. Store one immutable team-assignment snapshot per room and date
CREATE TABLE IF NOT EXISTS public.team_history_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  history_date DATE NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (room_id, history_date)
);

CREATE INDEX IF NOT EXISTS idx_team_history_snapshots_room_date
  ON public.team_history_snapshots(room_id, history_date DESC);

-- 8. Enable Full Replica Identity for Realtime tracking
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.teams REPLICA IDENTITY FULL;
ALTER TABLE public.levels REPLICA IDENTITY FULL;
ALTER TABLE public.team_notes REPLICA IDENTITY FULL;
ALTER TABLE public.participants REPLICA IDENTITY FULL;
ALTER TABLE public.participant_role REPLICA IDENTITY FULL;
ALTER TABLE public.team_history_snapshots REPLICA IDENTITY FULL;

-- 9. Add tables to Supabase Realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.rooms, public.teams, public.levels, public.team_notes, public.participants, public.participant_role, public.team_history_snapshots;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.participant_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_history_snapshots ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies
DROP POLICY IF EXISTS "Allow public read access to participant_role" ON public.participant_role;
DROP POLICY IF EXISTS "Allow public read access to rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public read access to teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public read access to levels" ON public.levels;
DROP POLICY IF EXISTS "Allow public read access to team_notes" ON public.team_notes;
DROP POLICY IF EXISTS "Allow public read access to participants" ON public.participants;
DROP POLICY IF EXISTS "Allow all access to rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all access to teams" ON public.teams;
DROP POLICY IF EXISTS "Allow all access to levels" ON public.levels;
DROP POLICY IF EXISTS "Allow all access to team_notes" ON public.team_notes;
DROP POLICY IF EXISTS "Allow all access to participants" ON public.participants;
DROP POLICY IF EXISTS "Allow all access to participant_role" ON public.participant_role;
DROP POLICY IF EXISTS "Allow public read access to team history snapshots" ON public.team_history_snapshots;
DROP POLICY IF EXISTS "Allow all access to team history snapshots" ON public.team_history_snapshots;

CREATE POLICY "Allow public read access to participant_role" ON public.participant_role FOR SELECT USING (true);
CREATE POLICY "Allow all access to participant_role" ON public.participant_role FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to levels" ON public.levels FOR SELECT USING (true);
CREATE POLICY "Allow public read access to team_notes" ON public.team_notes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to team history snapshots" ON public.team_history_snapshots FOR SELECT USING (true);

CREATE POLICY "Allow all access to rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to levels" ON public.levels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to team_notes" ON public.team_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to team history snapshots" ON public.team_history_snapshots FOR ALL USING (true) WITH CHECK (true);
