import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Eye, Database, Upload, Code } from "lucide-react";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <Eye />,
    title: "Visual Register Management",
    description:
      "Navigate complex register maps through an interactive visual interface. Toggle bits, modify values, and see changes in real-time across hex, decimal, and binary formats",
  },
  {
    icon: <Database />,
    title: "Smart Device Organization",
    description:
      "Effortlessly manage multiple devices with our structured database system. Search, filter, and access your entire register catalog with comprehensive device documentation at your fingertips",
  },
  {
    icon: <Upload />,
    title: "Seamless Device Configuration",
    description:
      "Add new devices effortlessly through our structured JSON import system or use our intuitive interface for manual configuration. Build your device register database with precision and ease.",
  },
  {
    icon: <Code />,
    title: "Development-Ready Output",
    description:
      "Generate production-ready header files and macros with a single click. Group registers by tags and export exactly what you need for your project, saving hours of manual configuration.\n (Coming Soon)",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32 mx-auto"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Whether you're debugging, developing, or documenting, BitSmith provides
        a clear path from complexity to clarity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card key={title} className="bg-muted/50">
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
