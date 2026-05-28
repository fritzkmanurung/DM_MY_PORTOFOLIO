'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !email.trim()) {
    return { error: 'Email harus diisi' }
  }

  if (!password || password.length < 6) {
    return { error: 'Password harus minimal 6 karakter' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

  if (error) {
    return { error: error.message }
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/portal-rahasia')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Auth getUser error:', error.message)
    return null
  }
  return user
}
