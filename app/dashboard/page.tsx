"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getThemes, getPagesForTheme } from "@/lib/templateConfigs";
import pb from "@/lib/pocketbase";
import templates from "@/components/templates";

export default function Dashboard() {
  const [template, setTemplate] = useState("minimalist");
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>(
    {}
  );
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [siteId, setSiteId] = useState<string>("");
  const [isNewSite, setIsNewSite] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string | null>("home");

  const themes = getThemes();
  const pages = getPagesForTheme(template);

  useEffect(() => {
    const fetchSiteIds = async () => {
      try {
        const sites = await pb
          .collection("wedding_sites")
          .getFullList({ fields: "siteId" });
        const ids = sites.map((site) => site.siteId);
        setSiteIds(ids);
        if (ids.length > 0 && !isNewSite) setSiteId(ids[0]);
      } catch (error) {
        console.error("Error fetching site IDs:", error);
      }
    };
    fetchSiteIds();
  }, []);

  useEffect(() => {
    if (siteId) {
      const fetchSiteData = async () => {
        try {
          const site = await pb
            .collection("wedding_sites")
            .getFirstListItem(`siteId="${siteId}"`, { requestKey: null });
          if (site && site.data) {
            setFormData(site.data);
            Object.entries(site.data).forEach(([page, pageData]) => {
              Object.entries(pageData).forEach(([key, value]) => {
                if (
                  typeof value === "string" &&
                  (key === "heroImage" ||
                    key === "bgImage" ||
                    key === "storyImage")
                ) {
                  setPreviews((prev) => ({
                    ...prev,
                    [`${page}-${key}`]: value,
                  }));
                } else if (key === "images" && Array.isArray(value)) {
                  value.forEach((img: string, i: number) => {
                    setPreviews((prev) => ({
                      ...prev,
                      [`${page}-${key}-${i}`]: img,
                    }));
                  });
                }
              });
            });
          }
        } catch (error) {
          console.error("Error fetching site data:", error);
        }
      };
      fetchSiteData();
    }
  }, [siteId]);

  const handleSaveAll = async () => {
    if (!siteId) {
      alert("Please select or enter a site ID.");
      return;
    }

    const pagesToSave = Object.keys(pages);
    for (const page of pagesToSave) {
      const form = new FormData();
      form.append("siteId", siteId);
      form.append("template", template);
      form.append("page", page);
      form.append(
        "active",
        String(formData[page]?.active || pages[page].activeByDefault)
      );

      const pageData = formData[page] || {};
      Object.entries(pageData).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          value.forEach((file: File | string, index: number) => {
            if (file instanceof File) form.append(`images[${index}]`, file);
            else if (typeof file === "string")
              form.append(`images[${index}]`, file);
          });
        } else if (key !== "active" && value instanceof File) {
          form.append(key, value);
        } else if (key !== "active" && typeof value !== "object") {
          form.append(key, value);
        }
      });

      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        console.error(`Save failed for ${page}:`, await res.text());
        alert(`Failed to save page: ${page}`);
        return;
      }
    }

    alert(`Site ${siteId} saved successfully!`);
    setPreviews({});
    if (isNewSite && !siteIds.includes(siteId)) {
      setSiteIds([...siteIds, siteId]);
      setIsNewSite(false);
    }
  };

  const handleFileChange = (
    page: string,
    field: string,
    file: File | null,
    index?: number
  ) => {
    if (file) {
      const pageData = formData[page] || {};
      if (index !== undefined) {
        const images = pageData[field] || [];
        images[index] = file;
        setFormData({ ...formData, [page]: { ...pageData, [field]: images } });
        setPreviews({
          ...previews,
          [`${page}-${field}-${index}`]: URL.createObjectURL(file),
        });
      } else {
        setFormData({ ...formData, [page]: { ...pageData, [field]: file } });
        setPreviews({
          ...previews,
          [`${page}-${field}`]: URL.createObjectURL(file),
        });
      }
    }
  };

  const handleTextChange = (page: string, field: string, value: string) => {
    setFormData({ ...formData, [page]: { ...formData[page], [field]: value } });
  };

  const toggleActive = (page: string) => {
    const pageData = formData[page] || {};
    setFormData({
      ...formData,
      [page]: { ...pageData, active: !pageData.active },
    });
  };

  const toPascalCase = (str: string) =>
    str
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

  const renderPreview = () => {
    if (!selectedPage || !siteId) {
      return (
        <div className="text-center text-muted-foreground">
          Select a page and site ID to preview
        </div>
      );
    }

    const pageData = formData[selectedPage] || {};
    const componentName = toPascalCase(selectedPage);
    const TemplateComponent = templates[template]?.[componentName];
    const NavbarComponent = templates[template]?.Navbar;

    if (!TemplateComponent || !NavbarComponent) {
      return (
        <div className="text-center text-destructive">
          Template or Navbar not found
        </div>
      );
    }

    const previewProps = Object.fromEntries(
      Object.entries(pageData).map(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          return [
            key,
            value.map((file: File | string, i: number) =>
              typeof file === "string"
                ? file
                : previews[`${selectedPage}-${key}-${i}`] || ""
            ),
          ];
        } else if (value instanceof File) {
          return [key, previews[`${selectedPage}-${key}`] || ""];
        } else if (typeof value === "string") {
          return [key, value];
        }
        return [key, value];
      })
    );

    const navbarPages = Object.fromEntries(
      Object.entries(pages).map(([page, { displayName }]) => [
        page,
        {
          active: formData[page]?.active ?? pages[page].activeByDefault,
          displayName:
            formData[page]?.displayName ||
            displayName ||
            page.charAt(0).toUpperCase() + page.slice(1),
          title:
            formData[page]?.title ||
            (page === "home" ? "Wedding Site" : undefined),
        },
      ])
    );

    return (
      <div className="flex flex-col h-full">
        <NavbarComponent siteId={siteId} pages={navbarPages} />
        <main className="flex-grow p-4 overflow-auto">
          <TemplateComponent {...previewProps} />
        </main>
      </div>
    );
  };

  const handleValueChange = (value: string | null) => {
    setSelectedPage(value || "home");
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top Navigation */}
      <header className="p-4 bg-background border-b shrink-0">
        <h1 className="text-2xl font-bold">Wedding Site Editor</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-auto">
        {/* Left Column: Forms */}
        <div className="md:w-1/2 space-y-4 p-4 overflow-auto">
          <div>
            <div className="flex items-center space-x-2">
              <Button
                variant={isNewSite ? "outline" : "default"}
                onClick={() => {
                  setIsNewSite(false);
                  if (siteIds.length > 0) setSiteId(siteIds[0]);
                  else setSiteId("");
                }}
              >
                Select Existing Site
              </Button>
              <Button
                variant={isNewSite ? "default" : "outline"}
                onClick={() => {
                  setIsNewSite(true);
                  setSiteId("");
                  setFormData({});
                  setPreviews({});
                  setSelectedPage("home");
                }}
              >
                Create New Site
              </Button>
            </div>
            {isNewSite ? (
              <Input
                placeholder="Enter new site ID (e.g., jane-and-john)"
                value={siteId}
                onChange={(e) =>
                  setSiteId(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                className="mt-2"
              />
            ) : (
              <Select
                value={siteId}
                onValueChange={setSiteId}
                disabled={siteIds.length === 0}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={
                      siteIds.length === 0
                        ? "No sites available"
                        : "Select a site"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {siteIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Select onValueChange={setTemplate} value={template}>
            <SelectTrigger>
              <SelectValue placeholder="Select Template" />
            </SelectTrigger>
            <SelectContent>
              {themes.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Accordion
            type="single"
            collapsible
            value={selectedPage}
            onValueChange={handleValueChange}
          >
            {Object.entries(pages).map(([page, { fields, displayName }]) => (
              <AccordionItem key={page} value={page}>
                <AccordionTrigger onClick={() => setSelectedPage(page)}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {displayName ||
                        page.charAt(0).toUpperCase() + page.slice(1)}
                    </span>
                    <input
                      type="checkbox"
                      checked={
                        formData[page]?.active ?? pages[page].activeByDefault
                      }
                      onChange={() => toggleActive(page)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {fields.map((field: any) => {
                      if (typeof field === "string") {
                        if (field === "title" || field === "subtitle") {
                          return (
                            <Input
                              key={field}
                              placeholder={field}
                              value={formData[page]?.[field] || ""}
                              onChange={(e) =>
                                handleTextChange(page, field, e.target.value)
                              }
                            />
                          );
                        }
                        if (field === "welcomeText" || field === "text") {
                          return (
                            <Textarea
                              key={field}
                              placeholder={field}
                              value={formData[page]?.[field] || ""}
                              onChange={(e) =>
                                handleTextChange(page, field, e.target.value)
                              }
                            />
                          );
                        }
                      } else if (field.type === "image") {
                        return (
                          <div key={field.name} className="space-y-2">
                            <label>{field.name}</label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(
                                  page,
                                  field.name,
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            {previews[`${page}-${field.name}`] && (
                              <img
                                src={previews[`${page}-${field.name}`]}
                                alt={`${field.name} preview`}
                                className="w-32 h-32 object-cover rounded"
                              />
                            )}
                            {!previews[`${page}-${field.name}`] &&
                              formData[page]?.[field.name] && (
                                <img
                                  src={formData[page]?.[field.name]}
                                  alt={`${field.name} preview`}
                                  className="w-32 h-32 object-cover rounded"
                                />
                              )}
                          </div>
                        );
                      } else if (field.type === "images") {
                        return (
                          <div key={field.name} className="space-y-2">
                            <label>{field.name}</label>
                            {Array.from({ length: field.max }).map((_, i) => (
                              <div
                                key={`${field.name}-${i}`}
                                className="space-y-1"
                              >
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileChange(
                                      page,
                                      field.name,
                                      e.target.files?.[0] || null,
                                      i
                                    )
                                  }
                                />
                                {previews[`${page}-${field.name}-${i}`] && (
                                  <img
                                    src={previews[`${page}-${field.name}-${i}`]}
                                    alt={`Image ${i + 1}`}
                                    className="w-32 h-32 object-cover rounded"
                                  />
                                )}
                                {!previews[`${page}-${field.name}-${i}`] &&
                                  formData[page]?.[field.name]?.[i] && (
                                    <img
                                      src={formData[page]?.[field.name]?.[i]}
                                      alt={`Image ${i + 1}`}
                                      className="w-32 h-32 object-cover rounded"
                                    />
                                  )}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Right Column: Preview */}
        <div className="md:w-1/2 border-l overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted">
            <h2 className="text-xl">Website Preview</h2>
          </div>
          <div className="flex-1 overflow-auto">{renderPreview()}</div>
        </div>
      </div>

      {/* Footer with Save Button */}
      <footer className="p-4 bg-background border-t shrink-0">
        <Button onClick={handleSaveAll} className="w-full md:w-auto">
          Save Entire Site
        </Button>
      </footer>
    </div>
  );
}
