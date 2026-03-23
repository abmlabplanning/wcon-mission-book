export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Group {
  id: string
  name: string
  color: string
  order_num: number
  created_at: string
}

export interface Mission {
  id: string
  title: string
  description: string | null
  score: number
  order_num: number
  is_active: boolean
  created_at: string
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  group_id: string
  mission_id: string
  image_url: string
  image_path: string
  status: SubmissionStatus
  score_awarded: number
  approved_by: string | null
  approved_at: string | null
  note: string | null
  created_at: string
  // 조인 데이터
  group?: Group
  mission?: Mission
}

export interface GroupScore {
  id: string
  name: string
  color: string
  order_num: number
  total_score: number
  completed_missions: number
}

export interface MissionWithStatus extends Mission {
  submission?: Submission | null
}
