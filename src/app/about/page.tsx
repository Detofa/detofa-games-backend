import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Detofa Enterprise",
  description:
    "Learn more about Detofa Enterprise, our mission, and our services in gaming and technology.",
};

const AboutPage = () => {
  return (
    <>
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
};

export default AboutPage;
