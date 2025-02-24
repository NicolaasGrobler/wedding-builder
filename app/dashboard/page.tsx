"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { getThemes, getPagesForTheme } from "@/lib/templateConfigs";
import pb from "@/lib/pocketbase";

export default function Dashboard() {
  const [template, setTemplate] = useState("minimalist");
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [siteId, setSiteId] = useState<string>("");
  const [isNewSite, setIsNewSite] = useState(false);

  const themes = getThemes();
  const pages = getPagesForTheme(template);

  useEffect(() => {
    const fetchSiteIds = async () => {
      try {
        const sites = await pb.collection("wedding_sites").getFullList({ fields: "siteId" });
        const ids = sites.map((site) => site.siteId);
        setSiteIds(ids);
        if (ids.length > 0) setSiteId(ids[0]);
      } catch (error) {
        console.error("Error fetching site IDs:", error);
      }
    };
    fetchSiteIds();
  }, []);

  const handleSubmit = async (page: string) => {
    if (!siteId) {
      alert("Please select or enter a site ID.");
      return;
    }

    const form = new FormData();
    form.append("siteId", siteId);
    form.append("template", template);
    form.append("page", page);
    form.append("active", String(formData[page]?.active || pages[page].activeByDefault));

    const pageData = formData[page] || {};
    Object.entries(pageData).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file: File, index: number) => {
          if (file) form.append(`images[${index}]`, file);
        });
      } else if (key !== "active") {
        form.append(key, value);
      }
    });

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      alert(`Page ${page} saved for site ${siteId}!`);
      setPreviews((prev) => ({ ...prev, [page]: {} }));
      if (isNewSite && !siteIds.includes(siteId)) {
        setSiteIds([...siteIds, siteId]);
        setIsNewSite(false);
      }
    } else {
      console.error("Save failed:", await res.text());
    }
  };

  const handleFileChange = (page: string, field: string, file: File | null, index?: number) => {
    if (file) {
      const pageData = formData[page] || {};
      if (index !== undefined) {
        const images = pageData[field] || [];
        images[index] = file;
        setFormData({ ...formData, [page]: { ...pageData, [field]: images } });
        setPreviews({ ...previews, [`${page}-${field}-${index}`]: URL.createObjectURL(file) });
      } else {
        setFormData({ ...formData, [page]: { ...pageData, [field]: file } });
        setPreviews({ ...previews, [`${page}-${field}`]: URL.createObjectURL(file) });
      }
    }
  };

  const toggleActive = (page: string) => {
    const pageData = formData[page] || {};
    setFormData({ ...formData, [page]: { ...pageData, active: !pageData.active } });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Wedding Site Editor</h1>

      {/* Site ID Selection or Creation */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={isNewSite ? "outline" : "default"}
            onClick={() => setIsNewSite(false)}
          >
            Select Existing Site
          </Button>
          <Button
            variant={isNewSite ? "default" : "outline"}
            onClick={() => {
              setIsNewSite(true);
              setSiteId("");
            }}
          >
            Create New Site
          </Button>
        </div>

        {isNewSite ? (
          <Input
            placeholder="Enter new site ID (e.g., jane-and-john)"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            className="mt-2"
          />
        ) : (
          <Select value={siteId} onValueChange={setSiteId} disabled={siteIds.length === 0}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={siteIds.length === 0 ? "No sites available" : "Select a site"} />
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

      {/* Template Selection */}
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

      {/* Pages Accordion */}
      <Accordion type="single" collapsible className="mt-4">
        {Object.entries(pages).map(([page, { fields, displayName }]) => (
          <AccordionItem key={page} value={page}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>{displayName || page.charAt(0).toUpperCase() + page.slice(1)}</span>
                <input
                  type="checkbox"
                  checked={formData[page]?.active ?? pages[page].activeByDefault}
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [page]: { ...formData[page], [field]: e.target.value },
                            })
                          }
                        />
                      );
                    }
                    if (field === "welcomeText" || field === "text") {
                      return (
                        <Textarea
                          key={field}
                          placeholder={field}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [page]: { ...formData[page], [field]: e.target.value },
                            })
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
                          onChange={(e) => handleFileChange(page, field.name, e.target.files?.[0] || null)}
                        />
                        {previews[`${page}-${field.name}`] && (
                          <img
                            src={previews[`${page}-${field.name}`]}
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
                          <div key={`${field.name}-${i}`} className="space-y-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(page, field.name, e.target.files?.[0] || null, i)}
                            />
                            {previews[`${page}-${field.name}-${i}`] && (
                              <img
                                src={previews[`${page}-${field.name}-${i}`]}
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
                <Button onClick={() => handleSubmit(page)}>Save {page}</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}