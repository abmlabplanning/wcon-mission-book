'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { login } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-widest text-[#2D5A27] mb-1">W공동체</p>
          <h1 className="text-2xl font-black text-[#1A3A17]">CONNECT</h1>
          <p className="text-xs text-gray-400 mt-1">관리자 로그인</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">이메일</label>
              <input
                type="email"
                name="email"
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2D5A27] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">비밀번호</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2D5A27] focus:bg-white transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              로그인
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
