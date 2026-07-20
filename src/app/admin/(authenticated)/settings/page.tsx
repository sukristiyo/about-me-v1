"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import SocialLinksManager from "@/components/admin/settings/SocialLinksManager";
import ChangePasswordForm from "@/components/admin/settings/ChangePasswordForm";

const settingsSchema = z.object({
  nameEn: z.string().min(1, "Site name is required"),
  aboutTextEn: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  location: z.string().optional(),
  subtitleEn: z.string().optional(),
  cvUrl: z.string().optional(),
});

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      nameEn: "",
      aboutTextEn: "",
      profilePhotoUrl: "",
      email: "",
      phone: "",
      birthDate: "",
      location: "",
      subtitleEn: "",
      cvUrl: "",
    },
  });

  // Fetch initial settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            form.reset({
              nameEn: data.nameEn || "",
              aboutTextEn: data.aboutTextEn || "",
              profilePhotoUrl: data.profilePhotoUrl || "",
              email: data.email || "",
              phone: data.phone || "",
              birthDate: data.birthDate || "",
              location: data.location || "",
              subtitleEn: data.subtitleEn || "",
              cvUrl: data.cvUrl || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    fetchSettings();
  }, [form]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Upload failed");
      }
      
      const data = await res.json();
      form.setValue("profilePhotoUrl", data.url, { shouldDirty: true });
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to save settings");
      }
      
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while saving settings");
    } finally {
      setIsLoading(false);
    }
  }

  const profilePhotoUrl = form.watch("profilePhotoUrl");
  const cvUrl = form.watch("cvUrl");
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "cv");

    setIsUploadingCv(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Upload failed");
      }
      
      const data = await res.json();
      form.setValue("cvUrl", data.url, { shouldDirty: true });
      toast.success("CV uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload CV");
    } finally {
      setIsUploadingCv(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Site Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your portfolio details and preferences</p>
      </div>

      <div className="p-8 rounded-2xl border border-border bg-card backdrop-blur-xl shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Profile Photo Upload */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-border">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center group shadow-2xl shrink-0">
                {profilePhotoUrl ? (
                  <Image src={profilePhotoUrl} alt="Profile" fill className="object-cover" />
                ) : (
                  <User className="h-12 w-12 text-zinc-600" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 text-foreground hover:scale-110 transition-transform" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-lg font-medium text-foreground">Profile Photo</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto md:mx-0">
                  This photo will be displayed on your portfolio and dashboard. Click the image to upload a new one.
                </p>
                {isUploading && <span className="text-xs text-primary flex items-center gap-1 justify-center md:justify-start mt-2"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</span>}
              </div>
            </div>

            {/* CV Upload */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-border">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center group shadow-xl shrink-0">
                {cvUrl ? (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-primary/10">
                    <Save className="h-8 w-8 text-primary mb-1" />
                    <span className="text-[10px] font-bold text-primary">PDF READY</span>
                  </div>
                ) : (
                  <Save className="h-8 w-8 text-zinc-600" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer">
                    <Upload className="h-6 w-6 text-white hover:scale-110 transition-transform" />
                    <input type="file" className="hidden" accept="application/pdf" onChange={handleCvUpload} disabled={isUploadingCv} />
                  </label>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-lg font-medium text-foreground">Resume / CV (PDF)</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto md:mx-0">
                  Upload your CV in PDF format. A download button will appear in your sidebar. Maximum 5MB.
                </p>
                {cvUrl && (
                  <a href={cvUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2">
                    View Current CV
                  </a>
                )}
                {isUploadingCv && <span className="text-xs text-primary flex items-center gap-1 justify-center md:justify-start mt-2"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</span>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe's Portfolio" className="bg-muted border-border text-foreground focus-visible:ring-primary h-12" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Subtitle / Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="DevOps · SRE · Cloud Engineer" className="bg-muted border-border text-foreground focus-visible:ring-primary h-12" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="hello@johndoe.com" className="bg-muted border-border text-foreground focus-visible:ring-primary h-12" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+62 821-xxxx-xxxx" className="bg-muted border-border text-foreground focus-visible:ring-primary h-12" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Birth Date</FormLabel>
                      <FormControl>
                        <Input placeholder="September 26, 1999" className="bg-muted border-border text-foreground focus-visible:ring-primary h-12" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Jakarta, Indonesia" className="bg-muted border-border text-foreground focus-visible:ring-primary h-12" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="aboutTextEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Site Description / Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief description about you and your work..." 
                        className="bg-muted border-border text-foreground focus-visible:ring-primary min-h-[120px] resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <SocialLinksManager />
      <ChangePasswordForm />
    </div>
  );
}
