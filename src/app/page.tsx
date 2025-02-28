import { Hero } from "@/components/LandingPage/Hero";
import { HowItWorks } from "@/components/LandingPage/HowItWorks";
import { Navbar } from "@/components/LandingPage/Navbar";
import { Pricing } from "@/components/LandingPage/Pricing";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Services } from "@/components/LandingPage/Services";
import { VideoDemo } from "@/components/LandingPage/VideoDemo";

function App() {
  return (
    <div>
      <Navbar />
      <div className="px-10">
      <Hero />
      <HowItWorks />
      <VideoDemo/>
      <Services />
      <Pricing enablePurchase={false} />
      <ScrollToTop />
    </div>
    </div>
  );
}

export default App;
