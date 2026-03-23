-- =============================================
-- W공동체 Connect Mission Book - 초기 스키마
-- =============================================

-- ==================
-- 1. profiles 테이블
-- ==================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth 사용자 생성 시 자동으로 profiles에 INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==================
-- 2. groups 테이블 (조)
-- ==================
CREATE TABLE IF NOT EXISTS public.groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#2D5A27',
  order_num  INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==================
-- 3. missions 테이블
-- ==================
CREATE TABLE IF NOT EXISTS public.missions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  score       INTEGER NOT NULL DEFAULT 10,
  order_num   INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS missions_updated_at ON public.missions;
CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ====================
-- 4. submissions 테이블
-- ====================
CREATE TABLE IF NOT EXISTS public.submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  mission_id    UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  image_path    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  score_awarded INTEGER NOT NULL DEFAULT 0,
  approved_by   UUID REFERENCES auth.users(id),
  approved_at   TIMESTAMPTZ,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, mission_id)
);


-- ====================
-- 5. group_scores 뷰
-- ====================
CREATE OR REPLACE VIEW public.group_scores AS
SELECT
  g.id,
  g.name,
  g.color,
  g.order_num,
  COALESCE(SUM(s.score_awarded), 0)::INTEGER                         AS total_score,
  COUNT(s.id) FILTER (WHERE s.status = 'approved')::INTEGER          AS completed_missions
FROM public.groups g
LEFT JOIN public.submissions s ON g.id = s.group_id
GROUP BY g.id, g.name, g.color, g.order_num
ORDER BY total_score DESC, g.order_num ASC;


-- ========================
-- 6. RLS (Row Level Security)
-- ========================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_select_all" ON public.groups
  FOR SELECT USING (true);

CREATE POLICY "groups_manage_admin" ON public.groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "missions_select_active" ON public.missions
  FOR SELECT USING (is_active = true);

CREATE POLICY "missions_manage_admin" ON public.missions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_select_all" ON public.submissions
  FOR SELECT USING (true);

CREATE POLICY "submissions_insert_anon" ON public.submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "submissions_manage_admin" ON public.submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ========================
-- 7. Storage Bucket 설정
-- ========================
-- Supabase Dashboard에서 직접 생성하세요:
-- Bucket 이름: mission-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*


-- ========================
-- 8. 초기 데이터 (조 1~10)
-- ========================
INSERT INTO public.groups (name, color, order_num) VALUES
  ('1조', '#2D5A27', 1),
  ('2조', '#1565C0', 2),
  ('3조', '#6A1B9A', 3),
  ('4조', '#E65100', 4),
  ('5조', '#AD1457', 5),
  ('6조', '#00695C', 6),
  ('7조', '#4E342E', 7),
  ('8조', '#37474F', 8),
  ('9조', '#F57F17', 9),
  ('10조', '#880E4F', 10)
ON CONFLICT DO NOTHING;
