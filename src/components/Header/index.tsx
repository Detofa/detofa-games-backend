"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import { useUser } from "@/app/providers";

const Header = () => {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();

  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();
  const { isLoggedIn, status, setToken, setStatus } = useUser();
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setStatus(null);
    window.location.href = "/";
  }, [setToken, setStatus]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${lng}`);
    router.push(newPath);
  };

  return (
    <>
      <header
        className={`header top-0 left-0 z-40 flex w-full items-center ${
          sticky
            ? "dark:bg-gray-dark dark:shadow-sticky-dark shadow-sticky fixed z-9999 bg-white/80 backdrop-blur-xs transition"
            : "absolute bg-transparent"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4 xl:mr-12">
              <Link
                href="/"
                className={`header-logo block w-full ${
                  sticky ? "py-5 lg:py-2" : "py-8"
                } `}
              >
                <Image
                  src="/images/logo/logo-2.svg"
                  alt="logo"
                  width={140}
                  height={30}
                  className="w-full dark:hidden"
                />
                <Image
                  src="/images/logo/logo.svg"
                  alt="logo"
                  width={140}
                  height={30}
                  className="hidden w-full dark:block"
                />
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="ring-primary absolute top-1/2 right-4 z-50 block translate-y-[-50%] rounded-lg px-3 py-[6px] focus:ring-2 lg:hidden"
              >
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                    navbarOpen ? "top-[7px] rotate-45" : " "
                  }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                    navbarOpen ? "opacity-0" : " "
                  }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                    navbarOpen ? "top-[-8px] -rotate-45" : " "
                  }`}
                />
              </button>

              {/* Navigation Menu */}
              <nav
                id="navbarCollapse"
                className={`navbar border-body-color/50 dark:border-body-color/20 dark:bg-dark absolute right-0 z-30 w-[280px] rounded-lg border-[.5px] bg-white px-6 py-4 shadow-lg duration-300 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none ${
                  navbarOpen
                    ? "visibility top-full opacity-100"
                    : "invisible top-[120%] opacity-0"
                }`}
              >
                <ul className="block lg:flex lg:space-x-8 xl:space-x-10">
                  {menuData.map((menuItem, index) => (
                    <li key={index} className="group relative">
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          onClick={() => setNavbarOpen(false)}
                          className={`flex py-2 text-base font-medium transition-colors lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${
                            usePathName === menuItem.path
                              ? "text-primary dark:text-white"
                              : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                          }`}
                        >
                          {menuItem.titleKey
                            ? t(menuItem.titleKey)
                            : menuItem.title}
                        </Link>
                      ) : (
                        <>
                          <p
                            onClick={() => handleSubmenu(index)}
                            className="text-dark group-hover:text-primary flex cursor-pointer items-center justify-between py-2 text-base font-medium transition-colors lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 dark:text-white/70 dark:group-hover:text-white"
                          >
                            {menuItem.titleKey
                              ? t(menuItem.titleKey)
                              : menuItem.title}
                            <span className="pl-3">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 25 24"
                                className={`transition-transform duration-200 ${
                                  openIndex === index ? "rotate-180" : ""
                                }`}
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </p>
                          <div
                            className={`submenu dark:bg-dark relative top-full left-0 rounded-lg bg-white transition-all duration-300 group-hover:opacity-100 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-xl lg:group-hover:visible lg:group-hover:top-full ${
                              openIndex === index ? "block" : "hidden"
                            }`}
                          >
                            {menuItem.submenu?.map((submenuItem, index) =>
                              submenuItem.path ? (
                                <Link
                                  href={submenuItem.path}
                                  key={index}
                                  onClick={() => {
                                    setNavbarOpen(false);
                                    setOpenIndex(-1);
                                  }}
                                  className="text-dark hover:text-primary block rounded-md py-2.5 text-sm transition-colors lg:px-3 dark:text-white/70 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  {submenuItem.titleKey
                                    ? t(submenuItem.titleKey)
                                    : submenuItem.title}
                                </Link>
                              ) : null
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Mobile Menu Actions - Inside Navigation */}
                <div className="lg:hidden flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  {!isLoggedIn ? (
                    <>
                      <Link
                        href="/signin"
                        onClick={() => setNavbarOpen(false)}
                        className="w-full px-5 py-2.5 text-center text-sm font-semibold text-dark hover:text-primary transition-colors dark:text-white/70 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {t("signIn")}
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setNavbarOpen(false)}
                        className="w-full px-5 py-2.5 text-center text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300"
                      >
                        {t("signUp")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setNavbarOpen(false)}
                        className="w-full px-5 py-2.5 text-center text-sm font-semibold text-dark hover:text-primary transition-colors dark:text-white/70 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {t("account")}
                      </Link>
                      {status &&
                        (status === "ADMIN" || status.endsWith("ADMIN")) && (
                          <Link
                            href="/dashboard"
                            onClick={() => setNavbarOpen(false)}
                            className="w-full px-5 py-2.5 text-center text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300"
                          >
                            {t("dashboard")}
                          </Link>
                        )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setNavbarOpen(false);
                        }}
                        className="w-full px-5 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t("logout")}
                      </button>
                    </>
                  )}
                </div>
              </nav>

              {/* Action Buttons Section */}
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Language Switcher */}
                <div className="hidden lg:flex items-center gap-2">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      i18n.language === "en"
                        ? "bg-primary text-white"
                        : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage("fr")}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      i18n.language === "fr"
                        ? "bg-primary text-white"
                        : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                    }`}
                  >
                    FR
                  </button>
                </div>

                {/* Theme Toggler */}
                <div className="hidden lg:block">
                  <ThemeToggler />
                </div>

                {/* User Actions - Desktop */}
                <div className="hidden lg:flex items-center gap-3">
                  {!isLoggedIn ? (
                    <>
                      <Link
                        href="/signin"
                        className="px-5 py-2.5 text-sm font-semibold text-dark hover:text-primary transition-colors dark:text-white/70 dark:hover:text-white"
                      >
                        {t("signIn")}
                      </Link>
                      <Link
                        href="/signup"
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
                      >
                        {t("signUp")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account"
                        className="px-5 py-2.5 text-sm font-semibold text-dark hover:text-primary transition-colors dark:text-white/70 dark:hover:text-white"
                      >
                        {t("account")}
                      </Link>
                      {status &&
                        (status === "ADMIN" || status.endsWith("ADMIN")) && (
                          <Link
                            href="/dashboard"
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
                          >
                            {t("dashboard")}
                          </Link>
                        )}
                      <button
                        onClick={handleLogout}
                        className="px-5 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        {t("logout")}
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile Theme Toggler - Visible on mobile */}
                <div className="lg:hidden">
                  <ThemeToggler />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
