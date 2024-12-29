import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layers, Database, Share2 } from "lucide-react";
import Image from "next/image";
import serviceImage from "@/assets/602shots_so.png";

interface ServiceProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const serviceList: ServiceProps[] = [
  {
    title: "Interactive Bit Visualization",
    description:
      "Manipulate register values through our intuitive bit viewer. Toggle individual bits, input hex, decimal, or binary values, and see real-time updates across all formats. Makes complex register manipulation simple and error-free.",
    icon: <Layers />, // or <Grid />
  },
  {
    title: "Comprehensive Register Database",
    description:
      "Access a clear, organized view of your device's complete memory map. Navigate through peripherals, registers, fields, and enumerations with our intuitive UI. Search, filter, and quickly find the registers you need.",
    icon: <Database />,
  },
  {
    title: "Seamless Device Management",
    description:
      "Import and share device configurations effortlessly through our JSON-based system. Perfect for team collaboration and project organization.",
    icon: <Share2 />, // or <Users />
  },
];

export const Services = () => {
  return (
    <section className="container py-24 sm:py-32 mx-auto">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              Client-Centric{" "}
            </span>
            Services
          </h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8 ">
            Simply upload your device specifications and instantly gain access
            to a visual interface that makes register manipulation
            straightforward and error-free.
          </p>

          <div className="flex flex-col gap-8">
            {serviceList.map(({ icon, title, description }: ServiceProps) => (
              <Card key={title}>
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
        <Image
          src={serviceImage}
          alt="About services"
          width={1000}
          height={1000}
        />
      </div>
    </section>
  );
};
