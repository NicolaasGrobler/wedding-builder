import { NextRequest, NextResponse } from "next/server";
import pb from "@/lib/pocketbase";
import { uploadToR2 } from "@/lib/r2";
import { templateConfigs } from "@/lib/templateConfigs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const siteId = formData.get("siteId") as string;
  const template = formData.get("template") as string;
  const page = formData.get("page") as string;
  const active = formData.get("active") === "true";

  if (!siteId) {
    return NextResponse.json({ success: false, error: "Site ID is required" }, { status: 400 });
  }

  const pageData: Record<string, any> = { active };
  const existing = await pb.collection("wedding_sites").getList(1, 1, { filter: `siteId = "${siteId}"` });
  const existingData = existing.items[0]?.data || {};

  // Get displayName from templateConfigs if it’s a new page
  const defaultDisplayName = templateConfigs[template]?.pages[page]?.displayName || page.charAt(0).toUpperCase() + page.slice(1);
  pageData.displayName = existingData[page]?.displayName || defaultDisplayName;

  // Process form data
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      const fileKey = `${siteId}/${page}/${key}_${Date.now()}.${value.name.split(".").pop()}`;
      const url = await uploadToR2(value, fileKey);
      if (key.startsWith("images[")) {
        const index = parseInt(key.match(/\d+/)?.[0] || "0");
        pageData.images = pageData.images || [];
        pageData.images[index] = url;
      } else {
        pageData[key] = url;
      }
    } else if (key !== "siteId" && key !== "template" && key !== "page" && key !== "active") {
      pageData[key] = value; // Text fields
    }
  }

  const updatedData = { ...existingData, [page]: pageData };
  if (existing.items.length > 0) {
    await pb.collection("wedding_sites").update(existing.items[0].id, {
      siteId,
      template,
      data: updatedData,
    });
  } else {
    await pb.collection("wedding_sites").create({
      siteId,
      template,
      data: updatedData,
    });
  }

  return NextResponse.json({ success: true });
}