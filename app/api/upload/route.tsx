import { NextRequest, NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';
import { uploadToR2 } from '@/lib/r2';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const siteId = 'jane-and-john'; // Hardcoded for MVP
  const template = formData.get('template') as string;
  const activePages = JSON.parse(formData.get('activePages') as string);
  const page = formData.get('page') as string;

  const pageData: Record<string, any> = {};
  const existing = await pb.collection('wedding_sites').getList(1, 1, { filter: `siteId = "${siteId}"` });
  const existingData = existing.items[0]?.data || {};

  // Process form data
  for (const [key, value] of formData.entries()) {
    console.log(`FormData entry: ${key}=${value}`); // Debug
    if (value instanceof File && value.size > 0) {
      const fileKey = `${siteId}/${page}/${key}_${Date.now()}.${value.name.split('.').pop()}`;
      const url = await uploadToR2(value, fileKey);
      if (key.startsWith('images')) {
        const index = parseInt(key.match(/\d+/)?.[0] || '0');
        pageData.images = pageData.images || [];
        pageData.images[index] = url;
      } else {
        pageData[key] = url;
      }
    } else if (key !== 'template' && key !== 'activePages' && key !== 'page') {
      pageData[key] = value; // Text fields
    }
  }

  console.log('Page data to save:', pageData); // Debug

  const updatedData = { ...existingData, [page]: pageData };
  if (existing.items.length > 0) {
    await pb.collection('wedding_sites').update(existing.items[0].id, {
      siteId,
      template,
      activePages,
      data: updatedData,
    });
  } else {
    await pb.collection('wedding_sites').create({
      siteId,
      template,
      activePages,
      data: updatedData,
    });
  }

  console.log('Updated data:', updatedData); // Debug
  return NextResponse.json({ success: true });
}