"use client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

enum PopularPlanType {
  NO = 0,
  YES = 1,
}

interface PricingProps {
  title: string;
  popular: PopularPlanType;
  price: number | string;
  description: string;
  buttonText: string;
  benefitList: string[];
}

interface PricingComponentProps {
  enablePurchase?: boolean;
}

const pricingList: PricingProps[] = [
  /*  {
    title: "Free",
    popular: 0,
    price: 0,
    description:
      "Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.",
    buttonText: "Get Started",
    benefitList: [
      "1 Team member",
      "2 GB Storage",
      "Upto 4 pages",
      "Community support",
      "lorem ipsum dolor",
    ],
  },
  */
  {
    title: "Individual",
    popular: 1,
    price: 10,
    description:
      "Perfect for developers and small teams working with hardware registers.",
    buttonText: "Start Free Trial",
    benefitList: [
      "Full register visualization tools",
      "100 device configurations",
      "JSON import/export capabilities",
      "Basic documentation storage",
      "Standard support",
      "Personal workspace",
    ],
  },
  {
    title: "Enterprise",
    popular: 0,
    price: "0", // or however you handle "Contact Us" pricing
    description:
      "Customized solutions for organizations requiring advanced features and support.",
    buttonText: "Contact Us",
    benefitList: [
      "Everything in Individual, plus:",
      "Priority technical support",
      "Custom integration support",
      "Priority access to upcoming features",
    ],
  },
];

export const Pricing = ({ enablePurchase = true }: PricingComponentProps) => {
  const router = useRouter();

  const handlePurchase = async (pricing: PricingProps) => {
    if (pricing.title === "Enterprise") {
      // Open email client with mailto link
      window.location.href = "mailto:nishant@cybersphereholdings.com";
      return;
    }

    if (!enablePurchase) {
      router.push("/home");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: pricing.title }),
      });
      const { url } = await response.json();
      console.log(url);
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <section id="pricing" className="container py-24 sm:py-32 mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center">
        Get
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Unlimited{" "}
        </span>
        Access
      </h2>
      <h3 className="text-xl text-center text-muted-foreground pt-4 pb-8">
        Streamline your hardware development workflow with our flexible pricing
        options
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-[1000px] mx-auto">
        {pricingList.map((pricing: PricingProps) => (
          <Card
            key={pricing.title}
            className={
              pricing.popular === PopularPlanType.YES
                ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex item-center justify-between">
                {pricing.title}
                {pricing.popular === PopularPlanType.YES ? (
                  <Badge variant="secondary" className="text-sm text-primary">
                    Most popular
                  </Badge>
                ) : null}
              </CardTitle>
              <div>
                {typeof pricing.price === "number" ? (
                  <div>
                    <span className="text-3xl font-bold">${pricing.price}</span>
                    <span className="text-muted-foreground"> /month</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold">Contact Us</span>
                )}
              </div>

              <CardDescription>{pricing.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                className="w-full"
                onClick={() => handlePurchase(pricing)}
              >
                {pricing.buttonText}
              </Button>
            </CardContent>

            <hr className="w-4/5 m-auto mb-4" />

            <CardFooter className="flex">
              <div className="space-y-4">
                {pricing.benefitList.map((benefit: string) => (
                  <span key={benefit} className="flex">
                    <Check className="text-green-500" />{" "}
                    <h3 className="ml-2">{benefit}</h3>
                  </span>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
