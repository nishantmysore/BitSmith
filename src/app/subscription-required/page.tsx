'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Pricing } from "@/components/LandingPage/Pricing";

export default function SubscriptionRequired() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not logged in, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // If logged in, check subscription status
    if (status === 'authenticated') {
      fetch('/api/check-subscription')
        .then(async (response) => {
          const data = await response.json();
          
          // If subscription is active, redirect to home
          if (data.active) {
            router.push('/home');
          }
        })
        .catch((error) => {
          console.error('Error checking subscription:', error);
        });
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="grid place-items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          Subscription Required
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          Your subscription has expired or is inactive. Please choose a plan to continue.
        </p>
        <Pricing enablePurchase={true} />
      </div>
    </div>
  );
} 