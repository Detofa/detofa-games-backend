import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Revolutionizing Mobile Gaming in Africa",
    paragraph:
      "Discover how Detofa Games is transforming the mobile gaming landscape by combining entertainment with real-world value through our innovative points system.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "David Kamau",
      image: "/images/blog/author-01.png",
      designation: "Product Manager",
    },
    tags: ["gaming"],
    publishDate: "2023",
  },
  {
    id: 2,
    title: "Empowering African Developers Through Technology",
    paragraph:
      "Learn about our commitment to developing exceptional talent across Africa and how we're creating opportunities in the digital technology sector.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "Amara Okafor",
      image: "/images/blog/author-02.png",
      designation: "Tech Lead",
    },
    tags: ["development"],
    publishDate: "2023",
  },
  {
    id: 3,
    title: "Full-Cycle Development: Our Approach to Digital Solutions",
    paragraph:
      "Explore how our comprehensive development services, from UI/UX design to deployment and support, are helping businesses across Africa grow and innovate.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Sarah Mensah",
      image: "/images/blog/author-03.png",
      designation: "Solutions Architect",
    },
    tags: ["technology"],
    publishDate: "2023",
  },
];
export default blogData;
