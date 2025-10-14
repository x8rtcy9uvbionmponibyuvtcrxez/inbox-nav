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
    <nav className="flex-1 px-4 py-2">
      <ul className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
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
