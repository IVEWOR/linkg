"use client";
import React from "react";
import { Youtube, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const footerLinks = [
    {
      title: "Legal",
      links: [
        {
          title: "Privacy",
          url: "/privacy",
        },
        {
          title: "Terms",
          url: "/terms",
        },
      ],
    },
  ];

  return (
    <div className="relative -z-50">
      <div className="absolute bottom-0 left-0 right-0 -z-10 overflow-hidden">
        <div className="transform hover:scale-105 transition-all duration-700 animate-float">
          <Image
            src="/bg6.png"
            width={600}
            height={600}
            alt="background"
            className="mx-auto opacity-20 animate-pulse-green"
          />
        </div>
      </div>

      <footer className="glass-effect backdrop-blur-lg text-white border-t border-green-500/20 relative">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6">
              <Link href="#" className="flex items-center space-x-2 group">
                <div className="transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 animate-glow-green">
                  <Image
                    src="/linkgraphlogo.png"
                    width={100}
                    height={30}
                    alt="Linkgraph"
                  />
                </div>
              </Link>
              <p className="mt-4 max-w-md text-gray-300 leading-relaxed">
                The ultimate creator hub to showcase your complete digital
                identity.
              </p>
              <div className="mt-6 flex space-x-4">
                <Link
                  href="https://www.youtube.com/@programmersarealsohuman5909"
                  className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 p-2 rounded-lg hover:bg-green-500/10"
                >
                  <span className="sr-only">YouTube</span>
                  <Youtube className="h-6 w-6" />
                </Link>
                <Link
                  href="https://x.com/KaiLentit"
                  className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 p-2 rounded-lg hover:bg-green-500/10"
                >
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-6 w-6" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-6 grid grid-cols-2 gap-8 justify-items-end">
              {footerLinks.map((column, columnIndex) => (
                <div key={column.title} className="space-y-4">
                  <h3 className="font-semibold tracking-wider uppercase text-green-400 text-sm">
                    {column.title}
                  </h3>
                  <ul className="space-y-3">
                    {column.links.map((link, linkIndex) => (
                      <li key={`${link}_${linkIndex}`}>
                        <Link
                          href={link.url}
                          className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:translate-x-2 inline-block relative group"
                          style={{
                            animationDelay: `${
                              (columnIndex * 3 + linkIndex) * 0.1
                            }s`,
                          }}
                        >
                          {link.title}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-green-500/20 text-center text-gray-400">
            <p className="transition-all duration-300 hover:text-green-400 text-sm">
              &copy; {new Date().getFullYear()} LinkGraph. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
