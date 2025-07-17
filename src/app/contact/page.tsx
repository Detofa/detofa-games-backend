import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Detofa Enterprise",
  description:
    "Contact Detofa Enterprise for support, project inquiries, or partnership opportunities.",
};

const ContactPage = () => {
  return <Contact />;
};

export default ContactPage;
