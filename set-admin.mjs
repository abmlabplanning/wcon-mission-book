/**
 * 관리자 권한 부여 스크립트
 * 실행: node set-admin.mjs 이메일@example.com
 */
import pg from 'pg'
const { Client } = pg

const email = process.argv[2]
if (!email) {
  console.error('사용법: node set-admin.mjs 이메일@example.com')
  process.exit(1)
}

const urls = [
  'postgresql://postgres:abmlabplanningWcon@db.ohultuhhdvrdvjlvzvwr.supabase.co:5432/postgres',
]

async function main() {
  let client
  for (const url of urls) {
    const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 })
    try { await c.connect(); client = c; break } catch { await c.end().catch(() => {}) }
  }
  if (!client) { console.error('DB 연결 실패'); process.exit(1) }

  const { rowCount } = await client.query(
    `UPDATE public.profiles SET role = 'admin' WHERE email = $1`, [email]
  )
  await client.end()

  if (rowCount > 0) {
    console.log(`✅ ${email} → 관리자 권한 부여 완료!`)
    console.log('   /login 에서 로그인 후 /admin 으로 접속하세요.')
  } else {
    console.log(`⚠️  ${email} 을 찾을 수 없습니다.`)
    console.log('   Authentication → Users 에서 먼저 계정을 생성해주세요.')
  }
}

main()
