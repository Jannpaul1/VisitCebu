import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
const supabaseUrl = configuredSupabaseUrl
  ? /^[a-z][a-z\d+.-]*:\/\//i.test(configuredSupabaseUrl)
    ? configuredSupabaseUrl
    : `https://${configuredSupabaseUrl.replace(/^\/\//, '')}`
  : undefined
const validSupabaseUrl = (() => {
  if (!supabaseUrl || !supabasePublishableKey) return false
  try {
    const parsedUrl = new URL(supabaseUrl)
    return ['http:', 'https:'].includes(parsedUrl.protocol) && parsedUrl.hostname.includes('.') && !parsedUrl.hostname.includes('_')
  } catch {
    return false
  }
})()

export const isSupabaseConfigured = validSupabaseUrl

let supabaseClient: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured || !supabaseUrl || !supabasePublishableKey) return null

  try {
    supabaseClient ??= createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  } catch {
    return null
  }

  return supabaseClient
}
