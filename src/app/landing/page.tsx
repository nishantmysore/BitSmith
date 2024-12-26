import { Features } from "@/components/LandingPage/Features";
import { Footer } from "@/components/LandingPage/Footer";
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
      <Features />
      <Services />
      <Pricing />
      <Footer />
      <ScrollToTop />
      {/*
      <Navbar />
      <Hero />
      <Sponsors />
      <About />
      <HowItWorks />
      <Features />
      <Services />
      <Cta />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
      <ScrollToTop />
    */}
    </>
  );
}

export default App;
