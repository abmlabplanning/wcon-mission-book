'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/Button'
import Image from 'next/image'

interface SubmissionWithDetails {
  id: string
  image_url: string
  status: string
  created_at: string
  note: string | null
  groups: { name: string; color: string }
  missions: { title: string; score: number }
}

export default function ApprovalsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('submissions')
      .select('id, image_url, status, created_at, note, groups(name, color), missions(title, score)')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setSubmissions((data as unknown as SubmissionWithDetails[]) || [])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    setLoading(true)
    fetchSubmissions()
  }, [fetchSubmissions])

  const handleAction = async (id: string, action: 'approved' | 'rejected', note?: string) => {
    setProcessingId(id)
    const res = await fetch(`/api/submissions/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    })
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
    }
    setProcessingId(null)
    setRejectingId(null)
    setRejectNote('')
  }

  const tabs = [
    { key: 'pending' as const, label: '대기 중', color: 'text-yellow-600' },
    { key: 'approved' as const, label: '승인 완료', color: 'text-green-600' },
    { key: 'rejected' as const, label: '반려', color: 'text-red-500' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black text-gray-900">인증 관리</h1>

      {/* 탭 */}
      <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === tab.key
                ? 'bg-[#2D5A27] text-white'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">
            {filter === 'pending' ? '✅' : filter === 'approved' ? '📋' : '❌'}
          </p>
          <p className="text-sm text-gray-500">
            {filter === 'pending' ? '대기 중인 인증이 없어요' :
             filter === 'approved' ? '승인된 인증이 없어요' : '반려된 인증이 없어요'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* 사진 */}
              <div className="relative w-full aspect-video bg-gray-100">
                <Image
                  src={s.image_url}
                  alt="인증 사진"
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: s.groups?.color || '#2D5A27' }}
                >
                  {s.groups?.name}
                </div>
              </div>

              {/* 정보 */}
              <div className="p-3">
                <p className="text-sm font-bold text-gray-900">{s.missions?.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  +{s.missions?.score}점 · {new Date(s.created_at).toLocaleDateString('ko-KR')}
                </p>

                {s.note && (
                  <p className="text-xs text-red-500 mt-1">사유: {s.note}</p>
                )}

                {/* 승인/거절 버튼 (대기 중인 경우만) */}
                {filter === 'pending' && (
                  <>
                    {rejectingId === s.id ? (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="반려 사유 (선택)"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-red-400"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            fullWidth
                            loading={processingId === s.id}
                            onClick={() => handleAction(s.id, 'rejected', rejectNote)}
                          >
                            반려 확인
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            fullWidth
                            onClick={() => setRejectingId(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          fullWidth
                          loading={processingId === s.id}
                          onClick={() => handleAction(s.id, 'approved')}
                        >
                          ✓ 승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          fullWidth
                          onClick={() => setRejectingId(s.id)}
                        >
                          반려
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
