"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { getThemes, getPagesForTheme } from "@/lib/templateConfigs";

export default function Dashboard() {
  const [template, setTemplate] = useState("minimalist");
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({}); // { page: { field: value } }
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const themes = getThemes();
  const pages = getPagesForTheme(template);

  const handleSubmit = async (page: string) => {
    const form = new FormData();
    form.append("template", template);
    form.append("page", page);
    form.append("active", String(formData[page]?.active || pages[page].activeByDefault));

    const pageData = formData[page] || {};
    Object.entries(pageData).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        // Append each file individually with an indexed key
        value.forEach((file: File, index: number) => {
          if (file) form.append(`images[${index}]`, file);
        });
      } else if (key !== "active") {
        form.append(key, value);
      }
    });

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      alert(`Page ${page} saved!`);
      setPreviews((prev) => ({ ...prev, [page]: {} }));
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
      <Select onValueChange={setTemplate} defaultValue="minimalist">
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

      <Accordion type="single" collapsible className="mt-4">
        {Object.entries(pages).map(([page, { fields }]) => (
          <AccordionItem key={page} value={page}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>{page.charAt(0).toUpperCase() + page.slice(1)}</span>
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