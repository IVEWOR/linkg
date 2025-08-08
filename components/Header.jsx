"use client";

import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import AuthModal from "@/components/auth/AuthModal";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState({
    loggedIn: false,
    username: null,
    email: null,
  });

  const [authOpen, setAuthOpen] = useState(false);

  // ── scroll blur
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── lock body when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  // ── fetch session (client probe so it works even if SSR cache misses)
  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const json = await res.json();
      if (json.loggedIn) {
        setSession({
          loggedIn: true,
          username: json.dbUser?.username ?? null,
          email: json.authUser?.email ?? null,
        });
      } else {
        setSession({ loggedIn: false, username: null, email: null });
      }
    } catch {
      setSession({ loggedIn: false, username: null, email: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // ── auth actions
  const supabaseRef = useRef(null);
  const getSupabase = () =>
    (supabaseRef.current ??= getSupabaseBrowserClient());

  const signOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    await fetchSession();
    router.refresh();
  };

  const profileHref =
    session.loggedIn && session.username ? `/${session.username}` : "/profiles";

  const navLinks = [
    { name: "Blog", href: "#" },
    { name: "Profile", href: profileHref },
  ];

  return (
    <div className="sticky top-0 z-50 backdrop-blur-3xl">
      <ScrollReveal>
        <header className="max-w-full">
          <nav
            className={`glass-effect border-b border-green-500/20 shadow-lg transition-all duration-500 ${
              isScrolled ? "glass-effect-green" : "glass-effect"
            }`}
          >
            <div className="container mx-auto flex items-center justify-between h-18 px-8">
              {/* logo */}
              <Link
                href="/"
                className="flex items-center space-x-2 text-white group"
              >
                <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 animate-glow-green">
                  <Image
                    src="/linkgraphlogo.png"
                    width={100}
                    height={30}
                    alt="Linkgraph"
                  />
                </div>
              </Link>

              {/* desktop nav */}
              <div className="hidden md:flex items-center space-x-4">
                {navLinks.map((link, i) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-gray-300 hover:text-green-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative group"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </div>

              {/* CTA (desktop) */}
              <div className="hidden md:flex items-center space-x-2">
                {loading ? (
                  <div className="h-8 w-24 animate-pulse rounded-xl bg-white/10" />
                ) : session.loggedIn ? (
                  <>
                    <Link
                      href={profileHref}
                      className="text-sm font-semibold px-4 py-1.5 rounded-xl text-gray-200 hover:text-white hover:bg-green-500/10 transition-all"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={signOut}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 animate-glow-green"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 animate-glow-green"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* mobile trigger */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden text-white p-2 transition-all duration-300 hover:bg-green-500/10 rounded-lg"
              >
                <span className="sr-only">Open menu</span>
                <Menu className="h-6 w-6 transition-transform duration-300 hover:rotate-90" />
              </button>
            </div>
          </nav>
        </header>
      </ScrollReveal>

      {/* mobile panel */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-500 backdrop-blur-2xl ease-in-out ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="absolute inset-0 backdrop-blur-xl bg-transparent">
          <div className="flex flex-col h-full px-8 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <Image
                  src="/linkgraphlogo.png"
                  width={100}
                  height={30}
                  alt="Linkgraph"
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white p-2 transition-all duration-300 hover:bg-green-500/10 rounded-lg"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6 transition-transform duration-300 hover:rotate-90" />
              </button>
            </div>

            <nav className="flex flex-col items-start space-y-6 mt-16">
              {navLinks.map((link, i) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-2xl font-medium text-gray-300 hover:text-green-400 transition-all duration-300 transform hover:translate-x-2 ${
                    isMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                  style={{ transitionDelay: isMenuOpen ? `${i * 0.1}s` : "0s" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {loading ? (
              <div
                className={`mt-auto w-full rounded-full h-12 bg-white/10 animate-pulse ${
                  isMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: isMenuOpen ? "0.3s" : "0s" }}
              />
            ) : session.loggedIn ? (
              <div className="mt-auto flex w-full gap-2">
                <Link
                  href={profileHref}
                  className={`flex-1 text-center rounded-full border border-green-500/40 text-white text-lg font-semibold px-4 py-3 hover:bg-green-500/10 transition-all ${
                    isMenuOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: isMenuOpen ? "0.25s" : "0s" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className={`w-40 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold text-center px-4 py-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] ${
                    isMenuOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: isMenuOpen ? "0.3s" : "0s" }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setAuthOpen(true);
                }}
                className={`mt-auto w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold text-center px-4 py-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] ${
                  isMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: isMenuOpen ? "0.3s" : "0s" }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={async (username) => {
          setAuthOpen(false);
          await fetchSession();
          router.push(`/${username}`);
          router.refresh();
        }}
      />
    </div>
  );
}
