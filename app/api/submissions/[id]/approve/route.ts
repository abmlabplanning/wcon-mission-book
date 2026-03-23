import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { action, note } = await request.json()

  if (!['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: '잘못된 액션입니다' }, { status: 400 })
  }

  // 미션 점수 조회
  const { data: submission } = await supabaseAdmin
    .from('submissions')
    .select('*, missions(score)')
    .eq('id', id)
    .single()

  if (!submission) {
    return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 })
  }

  const score = action === 'approved'
    ? (submission.missions as { score: number })?.score || 0
    : 0

  const { error } = await supabaseAdmin
    .from('submissions')
    .update({
      status: action,
      score_awarded: score,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      note: note || null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, score_awarded: score })
}
