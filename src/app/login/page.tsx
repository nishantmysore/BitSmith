'use client'

import { useSession, signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
      router.refresh()
    }
  }, [status, session, router, callbackUrl])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-6 space-y-6 bg-white rounded-lg shadow-lg dark:bg-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to continue</p>
        </div>
        <Button 
          className="w-full"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  )
}
