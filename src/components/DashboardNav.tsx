"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, InboxIcon, GlobeAltIcon, TagIcon } from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Products", href: "/dashboard/products", icon: TagIcon },
  { name: "Inboxes", href: "/dashboard/inboxes", icon: InboxIcon },
  { name: "Domains", href: "/dashboard/domains", icon: GlobeAltIcon },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-6 py-4">
      <ul className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white shadow-[0_10px_40px_-20px_rgba(15,118,255,0.6)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
