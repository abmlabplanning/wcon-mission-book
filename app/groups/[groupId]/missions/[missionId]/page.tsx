'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/src/components/layout/Header'
import { Button } from '@/src/components/ui/Button'
import { MissionSubmitModal } from '@/src/components/missions/MissionSubmitModal'
import { createClient } from '@/src/lib/supabase/client'
import { Mission, Group, Submission } from '@/src/types'
import { STATUS_LABELS } from '@/src/lib/constants'
import Image from 'next/image'

export default function MissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const missionId = params.missionId as string

  const [group, setGroup] = useState<Group | null>(null)
  const [mission, setMission] = useState<Mission | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const supabase = createClient()
    const [{ data: g }, { data: m }, { data: s }] = await Promise.all([
      supabase.from('groups').select('*').eq('id', groupId).single(),
      supabase.from('missions').select('*').eq('id', missionId).single(),
      supabase.from('submissions').select('*').eq('group_id', groupId).eq('mission_id', missionId).maybeSingle(),
    ])
    setGroup(g)
    setMission(m)
    setSubmission(s)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, missionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!group || !mission) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">미션을 찾을 수 없어요</p>
        <Button variant="outline" onClick={() => router.back()}>돌아가기</Button>
      </div>
    )
  }

  const isApproved = submission?.status === 'approved'
  const isPending = submission?.status === 'pending'
  const isRejected = submission?.status === 'rejected'

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <Header
        showBack
        backHref={`/groups/${groupId}`}
        title="미션 상세"
      />

      <div className="px-4 pt-4 space-y-4">
        {/* 미션 정보 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-xs font-medium text-gray-500">{group.name}</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-2">{mission.title}</h1>
          {mission.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{mission.description}</p>
          )}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: group.color }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            +{mission.score}점
          </div>
        </div>

        {/* 업로드된 이미지 (승인 여부 무관하게 표시) */}
        {submission?.image_url && (
          <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${
            isApproved ? 'border-green-500' :
            isPending  ? 'border-yellow-400' :
                         'border-red-400'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">인증 사진</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isApproved ? 'bg-green-100 text-green-700' :
                isPending  ? 'bg-yellow-100 text-yellow-700' :
                             'bg-red-100 text-red-700'
              }`}>
                {STATUS_LABELS[submission.status]}
              </span>
            </div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
              <Image
                src={submission.image_url}
                alt="인증 사진"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {isApproved && <p className="text-xs text-green-600 font-medium">✅ 인증 완료! +{submission.score_awarded}점 획득</p>}
            {isPending  && <p className="text-xs text-yellow-600">⏳ 관리자 확인 중이에요</p>}
            {isRejected && (
              <>
                <p className="text-xs text-red-500">❌ 인증이 반려되었어요</p>
                {submission.note && <p className="text-xs text-gray-500 mt-1">사유: {submission.note}</p>}
              </>
            )}
          </div>
        )}

        {/* 인증하기 버튼 — 제출 전이거나 반려된 경우만 */}
        {(!submission || isRejected) && (
          <Button fullWidth size="lg" onClick={() => setModalOpen(true)}>
            {isRejected ? '다시 인증하기' : '인증하기'}
          </Button>
        )}

        {isApproved && (
          <div className="text-center py-4">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-bold text-[#2D5A27]">미션 완료!</p>
          </div>
        )}
      </div>

      {/* 인증 모달 */}
      {modalOpen && (
        <MissionSubmitModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mission={mission}
          group={group}
          onSuccess={() => {
            fetchData()
          }}
          existingSubmissionId={isRejected ? submission?.id : undefined}
        />
      )}
    </div>
  )
}
