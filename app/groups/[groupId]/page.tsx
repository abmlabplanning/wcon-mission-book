import { createClient } from '@/src/lib/supabase/server'
import { Header } from '@/src/components/layout/Header'
import { MissionCard } from '@/src/components/missions/MissionCard'
import { MissionWithStatus } from '@/src/types'
import { notFound } from 'next/navigation'

export const revalidate = 10

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupPage({ params }: PageProps) {
  const { groupId } = await params
  const supabase = await createClient()

  const [{ data: group }, { data: missions }, { data: submissions }] = await Promise.all([
    supabase.from('groups').select('*').eq('id', groupId).single(),
    supabase.from('missions').select('*').eq('is_active', true).order('order_num'),
    supabase.from('submissions').select('*').eq('group_id', groupId),
  ])

  if (!group) notFound()

  const submissionMap = new Map(submissions?.map((s) => [s.mission_id, s]) || [])

  const missionsWithStatus: MissionWithStatus[] = (missions || []).map((m) => ({
    ...m,
    submission: submissionMap.get(m.id) || null,
  }))

  const completedCount = missionsWithStatus.filter((m) => m.submission?.status === 'approved').length
  const totalScore = missionsWithStatus
    .filter((m) => m.submission?.status === 'approved')
    .reduce((sum, m) => sum + (m.submission?.score_awarded || 0), 0)

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <Header
        showBack
        backHref="/"
        title={group.name}
      />

      {/* 조 헤더 */}
      <section className="px-4 pt-4 pb-4">
        <div
          className="rounded-2xl p-4 text-white relative overflow-hidden"
          style={{ backgroundColor: group.color }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
                {group.name.replace('조', '')}
              </div>
              <div>
                <p className="text-xl font-black">{group.name}</p>
                <p className="text-xs opacity-80">W공동체 Connect</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-black">{totalScore}</p>
                <p className="text-xs opacity-70">총 점수</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-black">{completedCount}/{missionsWithStatus.length}</p>
                <p className="text-xs opacity-70">미션 완료</p>
              </div>
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-[0.13]" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid slice">
            <path d="M -20 22 C 55 -6 140 72 210 35 C 270 4 295 52 350 22" stroke="white" strokeWidth="36" fill="none" strokeLinecap="round"/>
            <path d="M -10 72 C 65 50 150 90 225 66 C 288 45 310 75 360 55" stroke="white" strokeWidth="24" fill="none" strokeLinecap="round"/>
            <path d="M 180 -12 C 220 22 258 6 300 34" stroke="white" strokeWidth="16" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      {/* 진행 바 */}
      <section className="px-4 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>진행률</span>
            <span className="font-bold" style={{ color: group.color }}>
              {missionsWithStatus.length > 0
                ? Math.round((completedCount / missionsWithStatus.length) * 100)
                : 0}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: missionsWithStatus.length > 0
                  ? `${(completedCount / missionsWithStatus.length) * 100}%`
                  : '0%',
                backgroundColor: group.color,
              }}
            />
          </div>
        </div>
      </section>

      {/* 미션 목록 */}
      <section className="px-4 mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          미션 목록 ({missionsWithStatus.length}개)
        </h2>
        {missionsWithStatus.length > 0 ? (
          <div className="space-y-2.5">
            {missionsWithStatus.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                groupId={groupId}
                groupColor={group.color}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm text-gray-500">미션을 준비 중이에요</p>
          </div>
        )}
      </section>
    </div>
  )
}
