import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchAboutContent, updateAboutContent, type AboutContent, uploadFile } from "@/lib/api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type AboutEditorForm = {
  hero: string;
  heroActive: boolean;
  overview: string;
  overviewActive: boolean;
  mission: string;
  missionActive: boolean;
  vision: string;
  visionActive: boolean;
  values: string;
  valuesActive: boolean;
  counters: string;
  countersActive: boolean;
  process: string;
  processActive: boolean;
  seo: string;
  seoActive: boolean;
};

const emptyState: AboutEditorForm = {
  hero: "{}",
  heroActive: true,
  overview: "{}",
  overviewActive: true,
  mission: "{}",
  missionActive: true,
  vision: "{}",
  visionActive: true,
  values: "[]",
  valuesActive: true,
  counters: "[]",
  countersActive: true,
  process: "[]",
  processActive: true,
  seo: "{}",
  seoActive: true,
};

function formatJson(value: unknown, fallback = "{}") {
  try {
    return JSON.stringify(value ?? JSON.parse(fallback), null, 2);
  } catch {
    return fallback;
  }
}

function parseJsonInput(value: string, fallback: unknown) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export default function AboutAdmin() {
  const [form, setForm] = useState<AboutEditorForm>(emptyState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAboutContent();
      const payload = data || ({} as AboutContent);
      const sections = payload.sections || {};
      setForm({
        hero: formatJson(payload.hero, "{}"),
        heroActive: Number(sections.hero?.is_active ?? 1) === 1,
        overview: formatJson(payload.overview, "{}"),
        overviewActive: Number(sections.overview?.is_active ?? 1) === 1,
        mission: formatJson(payload.mission, "{}"),
        missionActive: Number(sections.mission?.is_active ?? 1) === 1,
        vision: formatJson(payload.vision, "{}"),
        visionActive: Number(sections.vision?.is_active ?? 1) === 1,
        values: formatJson(payload.values, "[]"),
        valuesActive: Number(sections.values?.is_active ?? 1) === 1,
        counters: formatJson(payload.counters, "[]"),
        countersActive: Number(sections.counters?.is_active ?? 1) === 1,
        process: formatJson(payload.process, "[]"),
        processActive: Number(sections.process?.is_active ?? 1) === 1,
        seo: formatJson(payload.seo, "{}"),
        seoActive: Number(sections.seo?.is_active ?? 1) === 1,
      });
      setHeroImageFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load about content");
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
      const heroPayload = parseJsonInput(form.hero, {}) as Record<string, unknown>;
      if (heroImageFile) {
        const uploaded = await uploadFile(heroImageFile);
        heroPayload.image = uploaded.url;
      }

      await updateAboutContent({
        hero: heroPayload,
        heroActive: form.heroActive ? 1 : 0,
        overview: parseJsonInput(form.overview, {}),
        overviewActive: form.overviewActive ? 1 : 0,
        mission: parseJsonInput(form.mission, {}),
        missionActive: form.missionActive ? 1 : 0,
        vision: parseJsonInput(form.vision, {}),
        visionActive: form.visionActive ? 1 : 0,
        values: parseJsonInput(form.values, []),
        valuesActive: form.valuesActive ? 1 : 0,
        counters: parseJsonInput(form.counters, []),
        countersActive: form.countersActive ? 1 : 0,
        process: parseJsonInput(form.process, []),
        processActive: form.processActive ? 1 : 0,
        seo: parseJsonInput(form.seo, {}),
        seoActive: form.seoActive ? 1 : 0,
      });
      toast.success("About content updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save about content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="About">
      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">About Page Content</CardTitle>
            <p className="text-sm text-muted-foreground">Edit the structured sections used on the About page. JSON is stored exactly as rendered on the frontend.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading about content...
              </div>
            ) : (
              <>
                {[ 
                  { key: "hero", activeKey: "heroActive", label: "Hero", helper: "Main hero object with title, subtitle, CTA labels, and image." },
                  { key: "overview", activeKey: "overviewActive", label: "Overview", helper: "Overview object used in the intro card." },
                  { key: "mission", activeKey: "missionActive", label: "Mission", helper: "Mission object." },
                  { key: "vision", activeKey: "visionActive", label: "Vision", helper: "Vision object." },
                  { key: "values", activeKey: "valuesActive", label: "Why Choose Us", helper: "Array of value cards." },
                  { key: "counters", activeKey: "countersActive", label: "Experience Counters", helper: "Array of counters." },
                  { key: "process", activeKey: "processActive", label: "Process", helper: "Array of process steps." },
                  { key: "seo", activeKey: "seoActive", label: "About SEO", helper: "SEO object for the About page." },
                ].map((section) => (
                  <section key={section.key} className="space-y-3 rounded-2xl border border-border bg-muted/10 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                <h3 className="font-medium text-foreground">{section.label}</h3>
                <p className="text-xs text-muted-foreground">{section.helper}</p>
              </div>
                      <div className="flex items-center gap-3 rounded-full border border-border bg-background px-3 py-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Active</span>
                        <Switch
                          checked={form[section.activeKey as keyof AboutEditorForm] as boolean}
                          onCheckedChange={(checked) => setForm((prev) => ({ ...prev, [section.activeKey]: checked }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={section.key}>JSON</Label>
                      <Textarea
                        id={section.key}
                        className="min-h-[180px] font-mono text-sm"
                        value={form[section.key as keyof AboutEditorForm] as string}
                        onChange={(event) => setForm((prev) => ({ ...prev, [section.key]: event.target.value }))}
                      />
                    </div>
                    {section.key === "hero" && (
                      <div className="space-y-2">
                        <ImageUploadField
                          label="Hero Image"
                          value={String((parseJsonInput(form.hero, {}) as Record<string, unknown>).image ?? "")}
                          file={heroImageFile}
                          onFileChange={setHeroImageFile}
                          previewAlt="About page hero image"
                          helperText="Upload a hero image instead of pasting an image URL."
                        />
                      </div>
                    )}
                  </section>
                ))}

                <Button onClick={handleSave} disabled={saving} className="w-full bg-[#2c5aa1] hover:bg-[#244a88]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save About Content
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
