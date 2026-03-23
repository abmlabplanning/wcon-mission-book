import Link from 'next/link'
import { MissionWithStatus } from '@/src/types'
import { STATUS_LABELS } from '@/src/lib/constants'

interface MissionCardProps {
  mission: MissionWithStatus
  groupId: string
  groupColor: string
}

export function MissionCard({ mission, groupId, groupColor }: MissionCardProps) {
  const submission = mission.submission
  const isApproved = submission?.status === 'approved'
  const isPending = submission?.status === 'pending'

  return (
    <Link href={`/groups/${groupId}/missions/${mission.id}`}>
      <div className={`
        bg-white rounded-2xl p-4 shadow-sm border transition-transform active:scale-[0.98]
        ${isApproved ? 'border-green-200 bg-green-50/50' : 'border-gray-100'}
      `}>
        <div className="flex items-start gap-3">
          {/* 완료 체크 */}
          <div className={`
            mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
            ${isApproved
              ? 'bg-green-500 text-white'
              : isPending
                ? 'bg-yellow-400 text-white'
                : 'border-2 border-gray-200'
            }
          `}>
            {isApproved && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isPending && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-semibold text-sm leading-snug ${isApproved ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {mission.title}
              </p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {submission && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isApproved ? 'bg-green-100 text-green-700' :
                    isPending ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {STATUS_LABELS[submission.status]}
                  </span>
                )}
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: groupColor }}
                >
                  +{mission.score}
                </span>
              </div>
            </div>
            {mission.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{mission.description}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
