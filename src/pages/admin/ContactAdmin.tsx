import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchContactSettings, updateContactSettings, type ContactSettings } from "@/lib/api";

type ContactForm = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  business_hours: string;
  map_iframe: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
};

const emptyState: ContactForm = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  business_hours: "",
  map_iframe: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

export default function ContactAdmin() {
  const [form, setForm] = useState<ContactForm>(emptyState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchContactSettings();
      const socialLinks = typeof data.social_links === "object" && data.social_links ? (data.social_links as Record<string, string>) : {};
      const payload = data || ({} as ContactSettings);
      setForm({
        phone: payload.phone || "",
        whatsapp: payload.whatsapp || "",
        email: payload.email || "",
        address: payload.address || "",
        business_hours: payload.business_hours || "",
        map_iframe: payload.map_iframe || "",
        facebook: socialLinks.facebook || "",
        instagram: socialLinks.instagram || "",
        linkedin: socialLinks.linkedin || "",
        youtube: socialLinks.youtube || "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load contact settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContactSettings({
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        address: form.address,
        business_hours: form.business_hours,
        map_iframe: form.map_iframe,
        social_links: {
          facebook: form.facebook,
          instagram: form.instagram,
          linkedin: form.linkedin,
          youtube: form.youtube,
        },
      });
      toast.success("Contact settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save contact settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Contact">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Contact Details</CardTitle>
            <p className="text-sm text-muted-foreground">Manage the phone, WhatsApp, email, address, and business hours displayed on the website.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading contact settings...
              </div>
            ) : (
              <>
                {[
                  ["phone", "Phone Number"],
                  ["whatsapp", "WhatsApp Number"],
                  ["email", "Email Address"],
                  ["business_hours", "Business Hours"],
                  ["facebook", "Facebook URL"],
                  ["instagram", "Instagram URL"],
                  ["linkedin", "LinkedIn URL"],
                  ["youtube", "YouTube URL"],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      value={form[key as keyof ContactForm]}
                      onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    className="min-h-[110px]"
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                  />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-[#2c5aa1] hover:bg-[#244a88]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Contact Settings
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Google Map Embed</CardTitle>
            <p className="text-sm text-muted-foreground">Paste the iframe URL for the contact page map section.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="map_iframe">Map Iframe URL</Label>
              <Textarea
                id="map_iframe"
                className="min-h-[180px]"
                value={form.map_iframe}
                onChange={(event) => setForm((prev) => ({ ...prev, map_iframe: event.target.value }))}
              />
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              The frontend uses this value directly. Make sure the iframe comes from a trusted Google Maps embed.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
