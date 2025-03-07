"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface MinimalistNavbarProps {
  siteId: string;
  pages: Record<string, { active: boolean; displayName?: string }>;
}

export default function MinimalistNavbar({ siteId, pages }: MinimalistNavbarProps) {
  const pathname = usePathname();
  const activePages = Object.entries(pages)
    .filter(([_, pageData]) => pageData.active)
    .map(([page, pageData]) => ({ page, displayName: pageData.displayName || page.charAt(0).toUpperCase() + page.slice(1) }));

  return (
    <nav className="bg-white border-b p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href={`/sites/${siteId}/home`} className="text-lg font-semibold text-gray-800">
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
                  buttonVariants({ variant: isActive ? "outline" : "ghost" }),
                  "text-gray-800 hover:text-gray-600"
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