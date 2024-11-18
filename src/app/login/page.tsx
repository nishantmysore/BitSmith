'use client'
import { useSession, signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useEffect } from "react"
import { Suspense } from "react"

function LoginContent() {
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
      <div className="grid place-items-center h-screen w-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="grid place-items-center min-h-screen w-screen">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full border-2"
            variant="outline"
            onClick={() => signIn('google')}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="grid place-items-center h-screen w-screen">
        <p>Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
