"use client";
import type React from "react";
import { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const { status } = useSession();
  const [isActive, setIsActive] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Transform values for scroll animations
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0.0)", "rgba(255, 255, 255, 0.95)"],
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0.0)", "rgba(0, 0, 0, 0.1)"],
  );
  const headerBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(12px)"],
  );

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  console.log(status);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
  ];

  const handleClick = (element: string) => {
    setIsActive(element);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: headerBackground,
          borderBottom: `1px solid ${headerBorder}`,
          backdropFilter: headerBlur,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="from-primary to-primary/80 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br">
                    <span className="text-sm font-bold text-white">AI</span>
                  </div>
                  <div>
                    <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent">
                      Interview <span className="text-primary">AI</span>
                    </h1>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-1 lg:flex">
              {navLinks.map((link, index) => (
                <motion.div
                  key={`nav-link-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => handleClick(link.name)}
                    className={cn(
                      "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                      isActive === link.name
                        ? "text-primary bg-primary/10"
                        : "hover:text-primary hover:bg-primary/5 text-gray-600",
                    )}
                  >
                    {link.name}
                    {isActive === link.name && (
                      <motion.div
                        layoutId="activeTab"
                        className="bg-primary/10 absolute inset-0 rounded-lg"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden items-center space-x-3 lg:flex">
              {status === "authenticated" ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary bg-gradient-to-r shadow-lg"
                      asChild
                    >
                      <Link href="/dashboard">
                        Dashboard
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary bg-gradient-to-r shadow-lg"
                      asChild
                    >
                      <Link href="/sign-in">
                        Sign In
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMenu}
                  className="relative z-50"
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait">
                    {isMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={toggleMenu}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-40 h-full w-80 max-w-[85vw] border-l border-gray-200 bg-white/95 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                  <div className="flex items-center space-x-2">
                    <div className="from-primary to-primary/80 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br">
                      <span className="text-sm font-bold text-white">AI</span>
                    </div>
                    <span className="text-lg font-bold">Interview AI</span>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex-1 px-6 py-8">
                  <nav className="space-y-2">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={`mobile-nav-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => handleClick(link.name)}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                            isActive === link.name
                              ? "text-primary bg-primary/10 border-primary/20 border"
                              : "hover:text-primary hover:bg-primary/5 text-gray-700",
                          )}
                        >
                          {link.name}
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="space-y-3 border-t border-gray-200 p-6">
                  {status === "unauthenticated" ? (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full bg-transparent"
                        asChild
                      >
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button
                        size="lg"
                        className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary w-full bg-gradient-to-r shadow-lg"
                        asChild
                      >
                        <Link href="/sign-up">
                          Get Started
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary w-full bg-gradient-to-r shadow-lg"
                      asChild
                    >
                      <Link href="/dashboard">
                        Go to Dashboard
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Header;
