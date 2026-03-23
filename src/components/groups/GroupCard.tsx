import Link from 'next/link'
import { GroupScore } from '@/src/types'

interface GroupCardProps {
  group: GroupScore
  rank: number
}

export function GroupCard({ group, rank }: GroupCardProps) {
  const rankEmojis = ['🥇', '🥈', '🥉']
  const rankLabel = rank <= 3 ? rankEmojis[rank - 1] : `${rank}위`

  return (
    <Link href={`/groups/${group.id}`}>
      <div
        className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
        style={{ borderLeftWidth: 4, borderLeftColor: group.color }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 조 아이콘 */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: group.color }}
            >
              {group.name.replace('조', '')}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">{group.name}</p>
              <p className="text-xs text-gray-400">{group.completed_missions}개 미션 완료</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-lg font-black" style={{ color: group.color }}>
                {group.total_score.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">점</p>
            </div>
            <span className="text-xl">{rankLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
