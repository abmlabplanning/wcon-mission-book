import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const groupId = formData.get('groupId') as string
    const missionId = formData.get('missionId') as string

    if (!file || !groupId || !missionId) {
      return NextResponse.json({ error: '필수 값이 없습니다' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다' }, { status: 400 })
    }

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 3MB 이하여야 합니다' }, { status: 400 })
    }

    const existingSubmissionId = formData.get('existingSubmissionId') as string | null

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${groupId}/${missionId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('mission-images')
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('mission-images')
      .getPublicUrl(path)

    if (existingSubmissionId) {
      const { error: updateError } = await supabaseAdmin
        .from('submissions')
        .update({ image_url: publicUrl, image_path: path, status: 'pending', score_awarded: 0, note: null })
        .eq('id', existingSubmissionId)
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      return NextResponse.json({ url: publicUrl, path, updated: true })
    }

    return NextResponse.json({ url: publicUrl, path })
  } catch {
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다' }, { status: 500 })
  }
}
