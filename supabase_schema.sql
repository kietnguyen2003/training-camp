-- ========================================================
-- TEAMFLOW SUPABASE DATABASE SCHEMA & REALTIME SETUP SCRIPT
-- ========================================================

-- 1. Create user_roles (profiles) table linked to auth.users
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'host' | 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a user_roles record upon new Google Sign-In signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  activity TEXT NOT NULL DEFAULT 'Badminton Tournament',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  number INT NOT NULL,
  name TEXT NOT NULL,
  lead_name TEXT NOT NULL,
  lead_avatar TEXT,
  color_scheme_id TEXT NOT NULL DEFAULT 'amber',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create participants table
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

-- 5. Enable Full Replica Identity for Realtime tracking
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.teams REPLICA IDENTITY FULL;
ALTER TABLE public.participants REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- 6. Add tables to Supabase Realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.rooms, public.teams, public.participants, public.user_roles;

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
CREATE POLICY "Allow public read access to user_roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own role" ON public.user_roles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow users to insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow public read access to rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to participants" ON public.participants FOR SELECT USING (true);

CREATE POLICY "Allow all access to rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);
