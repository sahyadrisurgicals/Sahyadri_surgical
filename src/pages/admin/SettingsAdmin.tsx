import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { changeAdminPassword, fetchSiteSettings, updateSiteSettings } from "@/lib/api";

const defaultSettings = {
  site_name: "Sahyadri Surgical",
  logo_text: "SS",
  footer_credit: "Designed by Webakoof",
  footer_copyright: "2026 Sahyadri Surgical. All Rights Reserved.",
  call_number: "+919876543210",
  whatsapp_number: "919876543210",
  whatsapp_message: "Hi, I want to inquire about medical equipment",
  primary_city: "Pune",
  support_email: "info@sahyadrisurgicals.com",
  support_phone: "+91 98765 43210",
  social_links: JSON.stringify({ facebook: "", instagram: "", linkedin: "", youtube: "" }, null, 2),
};

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSiteSettings();
      const normalized: Record<string, string> = { ...defaultSettings };
      Object.entries(data || {}).forEach(([key, value]) => {
        normalized[key] = typeof value === "string" ? value : JSON.stringify(value, null, 2);
      });
      if (!normalized.social_links) {
        normalized.social_links = defaultSettings.social_links;
      }
      setSettings(normalized);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load site settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const socialLinksValue = useMemo(() => settings.social_links || defaultSettings.social_links, [settings.social_links]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const socialLinks = JSON.parse(settings.social_links || "{}");
      await updateSiteSettings({
        site_name: settings.site_name,
        logo_text: settings.logo_text,
        footer_credit: settings.footer_credit,
        footer_copyright: settings.footer_copyright,
        call_number: settings.call_number,
        whatsapp_number: settings.whatsapp_number,
        whatsapp_message: settings.whatsapp_message,
        primary_city: settings.primary_city,
        support_email: settings.support_email,
        support_phone: settings.support_phone,
        social_links: socialLinks,
      });
      toast.success("Site settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save site settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password should be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      await changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Site Settings</CardTitle>
            <p className="text-sm text-muted-foreground">Update branding, contact, and footer details used across the site.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading settings...
              </div>
            ) : (
              <>
                {[
                  ["site_name", "Site Name"],
                  ["logo_text", "Logo Text"],
                  ["footer_credit", "Footer Credit"],
                  ["footer_copyright", "Footer Copyright"],
                  ["call_number", "Call Number"],
                  ["whatsapp_number", "WhatsApp Number"],
                  ["whatsapp_message", "WhatsApp Message"],
                  ["primary_city", "Primary City"],
                  ["support_email", "Support Email"],
                  ["support_phone", "Support Phone"],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      value={settings[key] || ""}
                      onChange={(event) => setSettings((prev) => ({ ...prev, [key]: event.target.value }))}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="social_links">Social Links JSON</Label>
                  <Textarea
                    id="social_links"
                    className="min-h-[140px] font-mono text-sm"
                    value={socialLinksValue}
                    onChange={(event) => setSettings((prev) => ({ ...prev, social_links: event.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep this as valid JSON, for example {`{ "facebook": "", "instagram": "" }`}.
                  </p>
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
                      Save Site Settings
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Change Password</CardTitle>
            <p className="text-sm text-muted-foreground">Update the admin login password securely.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={passwordSaving} className="w-full bg-[#2c5aa1] hover:bg-[#244a88]">
              {passwordSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
