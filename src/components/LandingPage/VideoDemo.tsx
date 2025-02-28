import { Card, CardContent } from "@/components/ui/card";
import dynamic from 'next/dynamic';

const demoVideoPath = '/demo.mp4';

interface VideoDemoProps {
  videoSrc?: string;
  title?: string;
  description?: string;
}

export const VideoDemo = ({
  videoSrc = demoVideoPath,
  title = "See BitSmith in Action",
  description = "Watch how BitSmith simplifies register management and device configuration."
}: VideoDemoProps) => {
  return (
    <section className="container py-12 mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold">
          {title}
        </h3>
        {description && (
          <p className="md:w-3/4 mx-auto mt-4 text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      <Card className="overflow-hidden bg-muted/50 border-2 border-primary/20">
        <CardContent className="p-0">
          <div className="aspect-video w-full">
            <video 
              controls
              className="w-full h-full object-cover"
              preload="metadata"
            >
              <source src={videoSrc} type="video/mp4" />
              {typeof videoSrc === 'string' && videoSrc.endsWith('.mp4') && (
                <source src={videoSrc.replace('.mp4', '.mov')} type="video/quicktime" />
              )}
              Your browser does not support the video tag.
            </video>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}; 