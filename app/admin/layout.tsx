import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      {/* 관리자 헤더 */}
      <header className="sticky top-0 z-40 bg-[#1A3A17] text-white">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 01-.517.608 7.45 7.45 0 00-.478.198.798.798 0 01-.796-.064l-.453-.324a1.875 1.875 0 00-2.416.2l-.243.243a1.875 1.875 0 00-.2 2.416l.324.453a.798.798 0 01.064.796 7.448 7.448 0 00-.198.478.798.798 0 01-.608.517l-.549.091A1.875 1.875 0 002.25 11.828v.344c0 .916.663 1.699 1.567 1.85l.549.091a.798.798 0 01.608.517c.065.162.136.321.198.478a.798.798 0 01-.064.796l-.324.453a1.875 1.875 0 00.2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 01.796-.064c.157.062.316.133.478.198a.798.798 0 01.517.608l.091.549c.15.904.933 1.567 1.85 1.567h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 01.517-.608 7.52 7.52 0 00.478-.198.798.798 0 01.796.064l.453.324a1.875 1.875 0 002.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 01-.064-.796c.062-.157.133-.316.198-.478a.798.798 0 01.608-.517l.549-.091A1.875 1.875 0 0021.75 12.172v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 01-.608-.517 7.507 7.507 0 00-.198-.478.798.798 0 01.064-.796l.324-.453a1.875 1.875 0 00-.2-2.416l-.243-.243a1.875 1.875 0 00-2.416-.2l-.453.324a.798.798 0 01-.796.064 7.462 7.462 0 00-.478-.198.798.798 0 01-.517-.608l-.091-.549c-.15-.904-.933-1.567-1.85-1.567h-.344zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-bold">관리자</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link href="/admin/approvals" className="px-3 py-1.5 text-xs rounded-lg hover:bg-white/10 transition-colors">
              승인
            </Link>
            <Link href="/admin/missions" className="px-3 py-1.5 text-xs rounded-lg hover:bg-white/10 transition-colors">
              미션
            </Link>
            <Link href="/admin/groups" className="px-3 py-1.5 text-xs rounded-lg hover:bg-white/10 transition-colors">
              조
            </Link>
            <Link href="/" className="px-3 py-1.5 text-xs rounded-lg hover:bg-white/10 transition-colors">
              사이트
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-4 py-4">
        {children}
      </main>
    </div>
  )
}
