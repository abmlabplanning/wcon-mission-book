import Link from 'next/link'
import localFont from 'next/font/local'

const mamablock = localFont({
  src: '../../../public/fonts/mamablock.ttf',
  display: 'swap',
})

interface HeaderProps {
  title?: string
  showBack?: boolean
  backHref?: string
  rightElement?: React.ReactNode
}

export function Header({ title, showBack, backHref = '/', rightElement }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F5F2EC]/95 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="w-10">
          {showBack && (
            <Link href={backHref} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
          )}
        </div>

        <div className="flex-1 text-center">
          {title ? (
            <span className="text-sm font-bold text-gray-900">{title}</span>
          ) : (
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-xs font-bold text-[#2D5A27] tracking-widest">W공동체</span>
              <span className="text-xs text-gray-400">·</span>
              <span className={`text-xs text-gray-700 ${mamablock.className}`}>CONNECT</span>
            </Link>
          )}
        </div>

        <div className="w-10 flex justify-end">
          {rightElement}
        </div>
      </div>
    </header>
  )
}
