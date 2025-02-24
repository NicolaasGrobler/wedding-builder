'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { templateConfigs } from '@/lib/templateConfigs';

export default function Dashboard() {
  const [template, setTemplate] = useState('minimalist');
  const [activePages, setActivePages] = useState<string[]>(['home']);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const form = new FormData();
    form.append('template', template);
    form.append('activePages', JSON.stringify(activePages));
    form.append('page', activePages[0]);
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));

    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (res.ok) {
      alert('Site saved!');
      setPreviews({});
      setFormData({});
    } else {
      console.error('Save failed:', await res.text());
    }
  };

  const handleFileChange = (field: string, file: File | null, index?: number) => {
    if (file) {
      if (index !== undefined) {
        const images = formData[field] || [];
        images[index] = file;
        setFormData({ ...formData, [field]: images });
        setPreviews({ ...previews, [`${field}-${index}`]: URL.createObjectURL(file) });
      } else {
        setFormData({ ...formData, [field]: file });
        setPreviews({ ...previews, [field]: URL.createObjectURL(file) });
      }
    }
  };

  const fields = templateConfigs[template][activePages[0]].fields;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Wedding Site Editor</h1>
      <Select onValueChange={setTemplate} defaultValue="minimalist">
        <SelectTrigger><SelectValue placeholder="Select Template" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="minimalist">Minimalist</SelectItem>
          <SelectItem value="floral">Floral</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => setActivePages([value])} defaultValue="home" className="mt-4">
        <SelectTrigger><SelectValue placeholder="Select Active Page" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="home">Home</SelectItem>
          <SelectItem value="our-story">Our Story</SelectItem>
          <SelectItem value="gallery">Gallery</SelectItem>
          <SelectItem value="rsvp">RSVP</SelectItem>
          <SelectItem value="accommodation">Accommodation</SelectItem>
          <SelectItem value="details">Details</SelectItem>
        </SelectContent>
      </Select>
      <div className="mt-4 space-y-4">
        {fields.map((field: any) => {
          if (typeof field === 'string') {
            if (field === 'title' || field === 'subtitle') {
              return <Input key={field} placeholder={field} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} />;
            }
            if (field === 'welcomeText' || field === 'text') {
              return <Textarea key={field} placeholder={field} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} />;
            }
          } else if (field.type === 'image') {
            return (
              <div key={field.name} className="space-y-2">
                <label>{field.name}</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(field.name, e.target.files?.[0] || null)}
                />
                {previews[field.name] && (
                  <img src={previews[field.name]} alt={`${field.name} preview`} className="w-32 h-32 object-cover rounded" />
                )}
              </div>
            );
          } else if (field.type === 'images') {
            return (
              <div key={field.name} className="space-y-2">
                <label>{field.name}</label>
                {Array.from({ length: field.max }).map((_, i) => (
                  <div key={`${field.name}-${i}`} className="space-y-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(field.name, e.target.files?.[0] || null, i)}
                    />
                    {previews[`${field.name}-${i}`] && (
                      <img src={previews[`${field.name}-${i}`]} alt={`Image ${i + 1}`} className="w-32 h-32 object-cover rounded" />
                    )}
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
      <Button onClick={handleSubmit} className="mt-4">Save</Button>
    </div>
  );
}