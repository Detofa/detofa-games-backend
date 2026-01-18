import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    titleKey: "home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    titleKey: "about",
    path: "/about",
    newTab: false,
  },
  {
    id: 33,
    titleKey: "blog",
    path: "/blog",
    newTab: false,
  },
  {
    id: 3,
    titleKey: "support",
    path: "/contact",
    newTab: false,
  },
  {
    id: 5,
    titleKey: "detofaApp",
    path: "/download-apps",
    newTab: false,
  },
  {
    id: 4,
    titleKey: "pages",
    newTab: false,
    submenu: [
      {
        id: 41,
        titleKey: "aboutPage",
        path: "/about",
        newTab: false,
      },
      {
        id: 42,
        titleKey: "contactPage",
        path: "/contact",
        newTab: false,
      },
      // {
      //   id: 43,
      //   title: "Blog Grid Page",
      //   path: "/blog",
      //   newTab: false,
      // },
      // {
      //   id: 44,
      //   title: "Blog Sidebar Page",
      //   path: "/blog-sidebar",
      //   newTab: false,
      // },
      // {
      //   id: 45,
      //   title: "Blog Details Page",
      //   path: "/blog-details",
      //   newTab: false,
      // },
      {
        id: 46,
        titleKey: "signInPage",
        path: "/signin",
        newTab: false,
      },
      {
        id: 47,
        titleKey: "signUpPage",
        path: "/signup",
        newTab: false,
      },
      // {
      //   id: 48,
      //   title: "Error Page",
      //   path: "/error",
      //   newTab: false,
      // },
    ],
  },
];
export default menuData;
