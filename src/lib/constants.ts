export const GROUP_COLORS = [
  '#2D5A27', // 다크 그린
  '#1565C0', // 블루
  '#6A1B9A', // 퍼플
  '#E65100', // 오렌지
  '#AD1457', // 핑크
  '#00695C', // 틸
  '#4E342E', // 브라운
  '#37474F', // 블루 그레이
  '#F57F17', // 옐로우
  '#880E4F', // 다크 핑크
]

export const STATUS_LABELS: Record<string, string> = {
  pending: '검토 중',
  approved: '승인',
  rejected: '반려',
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}
