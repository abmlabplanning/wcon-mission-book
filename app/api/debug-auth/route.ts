import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  let profile = null
  let profileError = null
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
    profileError = error
  }

  return NextResponse.json({
    cookieCount: allCookies.length,
    cookieNames: allCookies.map(c => c.name),
    user: user ? { id: user.id, email: user.email } : null,
    userError: userError?.message,
    profile,
    profileError: profileError?.message,
  })
}
