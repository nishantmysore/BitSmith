"use client";

import { useState, useEffect } from "react";
import { User } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SubscriptionData {
  subscriptionId: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
}

interface AccountClientProps {
  user: User;
}

export default function AccountClient({ user }: AccountClientProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch("/api/get-subscription");
      const data = await response.json();
      setSubscription(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.subscriptionId) return;

    setCancelLoading(true);
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId: subscription.subscriptionId }),
      });

      if (response.ok) {
        await fetchSubscriptionData();
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Profile Information</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-medium text-foreground">Name:</span>{" "}
              {user.name}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Subscription Details</h3>
          <div className="text-sm space-y-2">
            {subscription ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      subscription.status === "active" ? "default" : "secondary"
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>
                {subscription.currentPeriodEnd && (
                  <p>
                    <span className="font-medium">Subscription Ends:</span>{" "}
                    {new Date(
                      subscription.currentPeriodEnd,
                    ).toLocaleDateString()}
                  </p>
                )}
                {subscription.status === "active" && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                    className="mt-4"
                  >
                    {cancelLoading ? "Canceling..." : "Cancel Subscription"}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No active subscription</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
