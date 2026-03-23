import { createClient } from '@/src/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 10

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalMissions },
    { count: totalGroups },
    { count: pendingCount },
    { count: approvedCount },
    { data: scores },
  ] = await Promise.all([
    supabase.from('missions').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('groups').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('group_scores').select('*').order('total_score', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: '승인 대기', value: pendingCount || 0, href: '/admin/approvals', color: '#F59E0B', urgent: (pendingCount || 0) > 0 },
    { label: '승인 완료', value: approvedCount || 0, href: '/admin/approvals', color: '#2D5A27' },
    { label: '활성 미션', value: totalMissions || 0, href: '/admin/missions', color: '#1565C0' },
    { label: '조 수', value: totalGroups || 0, href: '/admin/groups', color: '#6A1B9A' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black text-gray-900">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className={`bg-white rounded-2xl p-4 shadow-sm border ${stat.urgent ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'} active:scale-[0.98] transition-transform`}>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              {stat.urgent && <p className="text-xs text-yellow-600 font-medium mt-1">확인 필요 !</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* 빠른 메뉴 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-3">빠른 메뉴</h2>
        <div className="grid grid-cols-3 gap-2">
          <Link href="/admin/approvals">
            <div className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#EBF2E8] text-[#2D5A27]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">인증 승인</span>
            </div>
          </Link>
          <Link href="/admin/missions">
            <div className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-xs font-medium">미션 관리</span>
            </div>
          </Link>
          <Link href="/admin/groups">
            <div className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-purple-50 text-purple-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span className="text-xs font-medium">조 관리</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 점수 랭킹 */}
      {scores && scores.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">현재 점수 랭킹</h2>
          <div className="space-y-2">
            {scores.map((group, index) => (
              <div key={group.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm w-6 text-center">{['🥇', '🥈', '🥉'][index] || `${index + 1}`}</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="text-sm font-medium text-gray-800">{group.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: group.color }}>{group.total_score}점</span>
                  <span className="text-xs text-gray-400 ml-1">({group.completed_missions}개)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
