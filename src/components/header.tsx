'use client'

import { ModeToggle } from "@/components/ModeToggle"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function Header() {
  const { data: session } = useSession()

  return (
    <div className="w-full border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        <div className="text-2xl font-bold">BitSmith</div>
        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Sign out
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
