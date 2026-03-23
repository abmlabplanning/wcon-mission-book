/**
 * W공동체 Connect Mission Book - DB 자동 설정 스크립트
 * 실행: node setup-db.mjs
 */
import pg from 'pg'
const { Client } = pg

const DB_URL = 'postgresql://postgres.ohultuhhdvrdvjlvzvwr:abmlabplanning!!Wcon@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres'
const SUPABASE_URL = 'https://ohultuhhdvrdvjlvzvwr.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odWx0dWhoZHZyZHZqbHZ6dndyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDE2MDg3MiwiZXhwIjoyMDg5NzM2ODcyfQ.K7LzO7XaF4MM0IqSz67TtA5ABG2mNG8kx2-zcZknbnI'

async function connectDB() {
  const urls = [
    // ! → %21 URL 인코딩
    'postgresql://postgres:abmlabplanningWcon@db.ohultuhhdvrdvjlvzvwr.supabase.co:5432/postgres',
  ]
  for (const url of urls) {
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 })
    try {
      await client.connect()
      console.log('✅ DB 연결 성공!\n')
      return client
    } catch (e) {
      await client.end().catch(() => {})
    }
  }
  throw new Error('DB 연결 실패. 네트워크 또는 비밀번호를 확인해주세요.')
}

const SQL_STEPS = [
  {
    name: 'profiles 테이블',
    sql: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email      TEXT UNIQUE NOT NULL,
        role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'handle_new_user 함수 + trigger',
    sql: `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, role) VALUES (new.id, new.email, 'user');
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
  },
  {
    name: 'groups 테이블',
    sql: `
      CREATE TABLE IF NOT EXISTS public.groups (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       TEXT NOT NULL,
        color      TEXT NOT NULL DEFAULT '#2D5A27',
        order_num  INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'missions 테이블',
    sql: `
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
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
      DROP TRIGGER IF EXISTS missions_updated_at ON public.missions;
      CREATE TRIGGER missions_updated_at
        BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    `
  },
  {
    name: 'submissions 테이블',
    sql: `
      CREATE TABLE IF NOT EXISTS public.submissions (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id      UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
        mission_id    UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
        image_url     TEXT NOT NULL,
        image_path    TEXT NOT NULL,
        status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        score_awarded INTEGER NOT NULL DEFAULT 0,
        approved_by   UUID REFERENCES auth.users(id),
        approved_at   TIMESTAMPTZ,
        note          TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (group_id, mission_id)
      );
    `
  },
  {
    name: 'group_scores 뷰',
    sql: `
      CREATE OR REPLACE VIEW public.group_scores AS
      SELECT g.id, g.name, g.color, g.order_num,
        COALESCE(SUM(s.score_awarded), 0)::INTEGER AS total_score,
        COUNT(s.id) FILTER (WHERE s.status = 'approved')::INTEGER AS completed_missions
      FROM public.groups g
      LEFT JOIN public.submissions s ON g.id = s.group_id
      GROUP BY g.id, g.name, g.color, g.order_num
      ORDER BY total_score DESC, g.order_num ASC;
    `
  },
  {
    name: 'RLS 활성화 + 정책',
    sql: `
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_select_own') THEN CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid()=id); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_select_admin') THEN CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='admin')); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_update_own') THEN CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid()=id); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='groups_select_all') THEN CREATE POLICY "groups_select_all" ON public.groups FOR SELECT USING (true); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='groups_manage_admin') THEN CREATE POLICY "groups_manage_admin" ON public.groups FOR ALL USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='admin')); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='missions_select_active') THEN CREATE POLICY "missions_select_active" ON public.missions FOR SELECT USING (is_active=true); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='missions_manage_admin') THEN CREATE POLICY "missions_manage_admin" ON public.missions FOR ALL USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='admin')); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='submissions_select_all') THEN CREATE POLICY "submissions_select_all" ON public.submissions FOR SELECT USING (true); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='submissions_insert_anon') THEN CREATE POLICY "submissions_insert_anon" ON public.submissions FOR INSERT WITH CHECK (true); END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='submissions_manage_admin') THEN CREATE POLICY "submissions_manage_admin" ON public.submissions FOR ALL USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='admin')); END IF;
      END $$;
    `
  },
  {
    name: '1조~10조 초기 데이터',
    sql: `
      INSERT INTO public.groups (name, color, order_num) VALUES
        ('1조','#2D5A27',1),('2조','#1565C0',2),('3조','#6A1B9A',3),
        ('4조','#E65100',4),('5조','#AD1457',5),('6조','#00695C',6),
        ('7조','#4E342E',7),('8조','#37474F',8),('9조','#F57F17',9),
        ('10조','#880E4F',10)
      ON CONFLICT DO NOTHING;
    `
  },
]

async function createStorageBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      id: 'mission-images',
      name: 'mission-images',
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ['image/jpeg','image/png','image/webp','image/heic','image/gif','image/jpg'],
    }),
  })
  const data = await res.json()
  if (res.ok || data.error === 'The resource already exists') return true
  throw new Error(data.error || JSON.stringify(data))
}

async function main() {
  console.log('🚀 W공동체 Connect Mission Book - DB 자동 설정\n')
  console.log('📡 DB 연결 중...')

  let client
  try {
    client = await connectDB()
  } catch (e) {
    console.error('❌', e.message)
    console.log('\n💡 해결방법: Supabase Dashboard → Project Settings → Database')
    console.log('   에서 비밀번호를 재설정 후 다시 실행해주세요.')
    process.exit(1)
  }

  for (const step of SQL_STEPS) {
    process.stdout.write(`  [SQL] ${step.name} ... `)
    try {
      await client.query(step.sql)
      console.log('✅')
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log('✅ (이미 존재)')
      } else {
        console.log('⚠️  ' + e.message.slice(0, 100))
      }
    }
  }

  await client.end()

  // Storage 버킷
  process.stdout.write('\n  [Storage] mission-images 버킷 ... ')
  try {
    await createStorageBucket()
    console.log('✅')
  } catch (e) {
    console.log('⚠️  ' + e.message)
  }

  console.log('\n✨ 설정 완료!\n')
  console.log('📌 마지막 단계 - 관리자 계정 생성:')
  console.log('   1. Supabase → Authentication → Users → Add user')
  console.log('   2. 로그인 후 관리자 권한 부여 (아래 명령어 실행):')
  console.log('      node set-admin.mjs 관리자@이메일.com\n')
}

main()
