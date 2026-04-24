import { createClient } from '@/src/lib/supabase/server'
import { Header } from '@/src/components/layout/Header'
import { GroupCard } from '@/src/components/groups/GroupCard'
import { GroupScore } from '@/src/types'
import Link from 'next/link'

export const revalidate = 30

export default async function HomePage() {
  const supabase = await createClient()

  const { data: scores } = await supabase
    .from('group_scores')
    .select('*')
    .order('total_score', { ascending: false })
    .order('order_num', { ascending: true })

  const { data: recentPhotos } = await supabase
    .from('submissions')
    .select('id, image_url, groups(name, color), missions(title)')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(6)

  const groups: GroupScore[] = scores || []
  const topGroup = groups[0]

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <Header />

      {/* 히어로 섹션 */}
      <section className="text-center">
        {/* 리본 데코레이션 */}
        <div className="relative h-36 overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 375 144"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 다크 그린 메인 리본 */}
            <path
              d="M -50 48 C 30 8 120 105 210 58 C 290 15 320 82 420 42"
              stroke="#1A3A17"
              strokeWidth="44"
              fill="none"
              strokeLinecap="round"
            />
            {/* 옐로우-그린 리본 */}
            <path
              d="M -30 108 C 65 80 155 128 240 98 C 325 68 355 110 440 84"
              stroke="#7CB517"
              strokeWidth="32"
              fill="none"
              strokeLinecap="round"
            />
            {/* 블루 액센트 */}
            <path
              d="M 205 -18 C 250 28 295 4 342 40 C 368 60 385 46 418 62"
              stroke="#1565C0"
              strokeWidth="22"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          {/* 아래로 페이드 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F5F2EC]" />
        </div>

        {/* 텍스트 */}
        <div className="px-4 pb-5 -mt-1">
          <p className="text-xs font-bold tracking-widest text-[#2D5A27] mb-1">2026 W CONFERENCE</p>
          <h1 className="text-3xl font-black text-[#1A3A17] tracking-tight mb-1">CONNECT</h1>
          <p className="text-xs text-gray-500 mb-4">Mission Book</p>
          <div className="inline-block bg-[#2D5A27]/10 rounded-full px-4 py-1.5">
            <p className="text-xs text-[#2D5A27] font-medium">2026. 4. 24 ~ 26 · 파주 영산수련원</p>
          </div>
        </div>
      </section>

      {/* 현재 1위 배너 */}
      {topGroup && topGroup.total_score > 0 && (
        <section className="px-4 mb-4">
          <Link href={`/groups/${topGroup.id}`}>
            <div
              className="rounded-2xl p-4 text-white relative overflow-hidden active:scale-[0.98] transition-transform"
              style={{ backgroundColor: topGroup.color }}
            >
              <div className="relative z-10">
                <p className="text-xs font-medium opacity-80 mb-0.5">🏆 현재 1위</p>
                <p className="text-xl font-black">{topGroup.name}</p>
                <p className="text-2xl font-black">{topGroup.total_score.toLocaleString()}점</p>
                <p className="text-xs opacity-70 mt-1">{topGroup.completed_missions}개 미션 완료</p>
              </div>
              <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 300 90" preserveAspectRatio="xMidYMid slice">
                <path d="M -20 18 C 50 -8 130 65 200 30 C 260 0 290 45 340 18" stroke="white" strokeWidth="32" fill="none" strokeLinecap="round"/>
                <path d="M -10 68 C 60 48 140 85 210 62 C 270 42 300 70 350 52" stroke="white" strokeWidth="22" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </Link>
        </section>
      )}

      {/* 미션 가이드 */}
      <section className="px-4 mb-3">
        <div className="bg-[#2D5A27]/8 border border-[#2D5A27]/20 rounded-xl px-3.5 py-3">
          <p className="text-xs text-[#2D5A27] leading-relaxed">
            모든 미션은 사진으로 인증하며, 전체 조 인원 기준 특정 수 이상 사진에 보여져야 합니다.
          </p>
          <p className="text-xs text-[#2D5A27]/70 mt-1.5 leading-relaxed">
            조인원 - 인증인원 &nbsp;|&nbsp; 8인 : 6인 이상 &nbsp;·&nbsp; 7인 : 5인 이상 &nbsp;·&nbsp; 5~6인 : 4인 이상
          </p>
        </div>
      </section>

      {/* 조 선택 */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">조별 현황</h2>
          <span className="text-xs text-gray-400">클릭하여 미션 시작</span>
        </div>
        {groups.length > 0 ? (
          <div className="space-y-2.5">
            {groups.map((group, index) => (
              <GroupCard key={group.id} group={group} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🌿</p>
            <p className="text-sm text-gray-500">아직 조가 없어요</p>
            <p className="text-xs text-gray-400 mt-1">관리자에게 문의해주세요</p>
          </div>
        )}
      </section>

      {/* 추억지도 미리보기 */}
      {recentPhotos && recentPhotos.length > 0 && (
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">추억지도</h2>
            <Link href="/memory-map" className="text-xs text-[#2D5A27] font-medium">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {recentPhotos.map((photo) => {
              const group = photo.groups as unknown as { name: string; color: string } | null
              return (
                <Link key={photo.id} href="/memory-map">
                  <div
                    className="aspect-square rounded-xl overflow-hidden"
                    style={{ borderBottom: `3px solid ${group?.color || '#2D5A27'}` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.image_url}
                      alt={`${group?.name} 인증`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              )
            })}
          </div>
          <Link href="/memory-map">
            <div className="mt-2 text-center py-2.5 rounded-xl border border-gray-200 bg-white">
              <p className="text-xs text-gray-500 font-medium">추억지도 전체 보기 →</p>
            </div>
          </Link>
        </section>
      )}
    </div>
  )
}
