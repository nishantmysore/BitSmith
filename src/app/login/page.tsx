"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useEffect } from "react";
import { Suspense } from "react";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Ensure the callback URL is safe to redirect to
      const safeCallbackUrl =
        callbackUrl.startsWith("/") ||
        callbackUrl.startsWith(window.location.origin)
          ? callbackUrl
          : "/";

      router.push(safeCallbackUrl);
      router.refresh();
    }
  }, [status, session, router, callbackUrl]);

  const handleSignIn = () => {
    signIn("google", {
      callbackUrl,
      redirect: true,
    });
  };

  if (status === "loading") {
    return (
      <div className="grid place-items-center h-screen w-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid place-items-center min-h-screen w-screen">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Welcome
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {error === "Callback" ? "Authentication failed" : error}
            </p>
          )}
          <Button
            className="w-full border-2"
            variant="outline"
            onClick={handleSignIn}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid place-items-center h-screen w-screen">
          <p>Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
