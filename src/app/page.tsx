import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detofa Enterprise - Develop Exceptional Talent of Africa",
  description: "A forward-thinking technology company dedicated to unlocking Africa's digital potential through mobile gaming, web development, and mobile applications.",
  // other metadata
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />

      <AboutSectionOne />
      <AboutSectionTwo />

      <Pricing />
      <Blog />
      <Contact />
    </>
  );
}
