import pb from '@/lib/pocketbase';
import templates from '@/components/templates';

export async function generateStaticParams() {
  const sites = await pb.collection('wedding_sites').getFullList();
  const params = sites.flatMap((site) =>
    site.activePages.map((page: string) => ({
      siteId: site.siteId,
      page,
    }))
  );
  console.log('Generated params:', params);
  return params;
}

export default async function Page({ params }: { params: { siteId: string; page: string } }) {
  const { siteId, page } = await params; // Fix for Next.js 15
  console.log('Params:', { siteId, page });

  try {
    const site = await pb.collection('wedding_sites').getFirstListItem(`siteId="${siteId}"`, { requestKey: null });
    if (!site) {
      console.error(`No site found for siteId: ${siteId}`);
      return <div>No site found</div>;
    }

    const { data, template } = site;
    console.log('Site data:', { data, template });

    const pageData = data[page] || {};
    console.log('Page data:', pageData);

    const TemplateComponent = templates[template]?.[page.charAt(0).toUpperCase() + page.slice(1)];
    if (!TemplateComponent) {
      console.error(`Template not found for ${template}.${page.charAt(0).toUpperCase() + page.slice(1)}`);
      return <div>Template not found</div>;
    }

    return <TemplateComponent {...pageData} />;
  } catch (error) {
    console.error('Error fetching site:', error);
    return <div>Error loading page</div>;
  }
}