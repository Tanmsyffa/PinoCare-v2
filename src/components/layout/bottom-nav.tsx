"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Heart, BookHeart, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pino", label: "Galeri", icon: Heart },
  { href: "/journal", label: "Jurnal", icon: BookHeart },
  { href: "/me", label: "Profil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/unlock") {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 px-6">
      <div className="mx-auto max-w-md">
        <div
          className="flex items-center justify-around px-2 py-1.5"
          style={{
            background: "rgba(255, 249, 240, 0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(244, 167, 167, 0.3)",
            borderRadius: "40px",
            boxShadow: "0 10px 30px -10px rgba(244, 167, 167, 0.25)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center gap-1 py-1"
                >
                  <div
                    className="flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: isActive
                        ? "#FFD1D1"
                        : "transparent",
                    }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      color={isActive ? "var(--color-text-main)" : "var(--color-brand-pink-dark)"}
                      fill={isActive ? "transparent" : "none"}
                    />
                  </div>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-bold"
                      style={{
                        color: "#635858",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
