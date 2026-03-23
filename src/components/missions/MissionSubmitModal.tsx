'use client'

import { useState } from 'react'
import { Modal } from '@/src/components/ui/Modal'
import { ImageUploader } from '@/src/components/ui/ImageUploader'
import { Button } from '@/src/components/ui/Button'
import { createClient } from '@/src/lib/supabase/client'
import { Mission, Group } from '@/src/types'

interface MissionSubmitModalProps {
  isOpen: boolean
  onClose: () => void
  mission: Mission
  group: Group
  onSuccess: () => void
}

export function MissionSubmitModal({
  isOpen,
  onClose,
  mission,
  group,
  onSuccess,
}: MissionSubmitModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('사진을 선택해주세요')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. 이미지 업로드
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('groupId', group.id)
      formData.append('missionId', mission.id)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || '업로드 실패')
      }

      const { url, path } = await uploadRes.json()

      // 2. submissions에 INSERT
      const supabase = createClient()
      const { error: insertError } = await supabase.from('submissions').insert({
        group_id: group.id,
        mission_id: mission.id,
        image_url: url,
        image_path: path,
        status: 'pending',
        score_awarded: 0,
      })

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('이미 이 미션을 인증했어요!')
        }
        throw new Error(insertError.message)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="미션 인증하기">
      <div className="space-y-4">
        {/* 미션 정보 */}
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: `${group.color}15` }}
        >
          <p className="text-xs font-medium mb-0.5" style={{ color: group.color }}>
            {group.name} · +{mission.score}점
          </p>
          <p className="text-sm font-bold text-gray-900">{mission.title}</p>
          {mission.description && (
            <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
          )}
        </div>

        {/* 이미지 업로더 */}
        <ImageUploader onImageSelect={handleImageSelect} disabled={loading} />

        {/* 에러 메시지 */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* 제출 버튼 */}
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          loading={loading}
          disabled={!selectedFile || loading}
        >
          인증 제출하기
        </Button>

        <p className="text-xs text-gray-400 text-center">
          관리자 확인 후 점수가 부여돼요
        </p>
      </div>
    </Modal>
  )
}
