import pb from "@/lib/pocketbase";
import templates from "@/components/templates";

const toPascalCase = (str: string) =>
  str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export async function generateStaticParams() {
  const sites = await pb.collection("wedding_sites").getFullList();
  const params = sites.flatMap((site) =>
    Object.entries(site.data)
      .filter(([_, pageData]: [string, any]) => pageData.active)
      .map(([page]) => ({
        siteId: site.siteId,
        page,
      }))
  );
  return params;
}

export default async function Page({ params }: { params: { siteId: string; page: string } }) {
  const { siteId, page } = await params;
  try {
    const site = await pb.collection("wedding_sites").getFirstListItem(`siteId="${siteId}"`, { requestKey: null });
    if (!site || !site.data[page]?.active) {
      return <div>Page not found or inactive</div>;
    }

    const { data, template } = site;
    const pageData = data[page] || {};

    const componentName = toPascalCase(page);
    const TemplateComponent = templates[template]?.[componentName];
    const NavbarComponent = templates[template]?.Navbar;

    if (!TemplateComponent) {
      console.error(`Template not found for ${template}.${componentName}`);
      return <div>Template not found</div>;
    }
    if (!NavbarComponent) {
      console.error(`Navbar not found for template ${template}`);
      return <div>Navbar not found</div>;
    }

    return (
      <div className="flex flex-col min-h-screen">
        <NavbarComponent siteId={siteId} pages={data} />
        <main className="flex-grow">
          <TemplateComponent {...pageData} />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching site:", error);
    return <div>Error loading page</div>;
  }
}