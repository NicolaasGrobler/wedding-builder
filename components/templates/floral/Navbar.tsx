"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface FloralNavbarProps {
  siteId: string;
  pages: Record<string, { active: boolean; displayName?: string }>;
}

export default function FloralNavbar({ siteId, pages }: FloralNavbarProps) {
  const pathname = usePathname();
  const activePages = Object.entries(pages)
    .filter(([_, pageData]) => pageData.active)
    .map(([page, pageData]) => ({ page, displayName: pageData.displayName || page.charAt(0).toUpperCase() + page.slice(1) }));

  return (
    <nav className="bg-pink-100 p-4 shadow-md">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href={`/sites/${siteId}/home`} className="text-lg font-bold text-pink-800">
          {pages.home?.title || "Wedding Site"}
        </Link>
        <div className="space-x-4">
          {activePages.map(({ page, displayName }) => {
            const href = `/sites/${siteId}/${page}`;
            const isActive = pathname === href;
            return (
              <Link
                key={page}
                href={href}
                className={cn(
                  buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                  "text-pink-800 hover:text-pink-600 bg-pink-200/50"
                )}
              >
                {displayName}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}