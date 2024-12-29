import { Hero } from "@/components/LandingPage/Hero";
import { HowItWorks } from "@/components/LandingPage/HowItWorks";
import { Navbar } from "@/components/LandingPage/Navbar";
import { Pricing } from "@/components/LandingPage/Pricing";
import { ScrollToTop } from "@/components/LandingPage/ScrollToTop";
import { Services } from "@/components/LandingPage/Services";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Services />
      <Pricing />
      <ScrollToTop />
    </>
  );
}

export default App;
