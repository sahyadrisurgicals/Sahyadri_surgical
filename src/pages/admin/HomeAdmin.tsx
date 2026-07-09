import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axisLogo from "@/assets/client-axis.svg";
import apolloLogo from "@/assets/client-apollo.svg";
import appleLogo from "@/assets/client-apple.svg";
import asthaLogo from "@/assets/client-astha.svg";
import diyaLogo from "@/assets/client-diya.svg";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fetchHomeContent, updateHomeContent, uploadFile } from "@/lib/api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type BannerSlideForm = {
  id: number;
  badge: string;
  title: string;
  description: string;
  pointsText: string;
  ctaLabel: string;
  ctaTo: string;
  icon: string;
  tone: string;
  backgroundImage: string;
  backgroundImageFile: File | null;
  isActive: boolean;
};

type TrustHighlightForm = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  isActive: boolean;
};

type ClientLogoForm = {
  id: number;
  name: string;
  logoKey: string;
  logoImageFile: File | null;
  isActive: boolean;
};

type HomeImageForm = {
  id: number;
  title: string;
  image: string;
  imageFile: File | null;
  alt: string;
  isActive: boolean;
};

type SeoForm = {
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image: string;
  og_image_file: File | null;
  canonical_url: string;
};

const toneOptions = [
  { label: "Indigo Aurora", value: "from-[#202d83] via-[#293a98] to-[#3249ad]" },
  { label: "Ocean Crest", value: "from-[#1f2b7d] via-[#2a3991] to-[#4256b6]" },
  { label: "Royal Pulse", value: "from-[#243084] via-[#30439d] to-[#4960bf]" },
  { label: "Sky Blue", value: "from-[#212f86] via-[#30429b] to-[#5368c2]" },
  { label: "Deep Blue", value: "from-[#1d2a79] via-[#2d3f98] to-[#455cb9]" },
];

const iconOptions = [
  { label: "Hospital Bed", value: "bed-double" },
  { label: "Delivery Truck", value: "truck" },
  { label: "Heart Pulse", value: "heart-pulse" },
  { label: "Accessibility", value: "accessibility" },
  { label: "Shield Check", value: "shield-check" },
  { label: "Home", value: "home" },
  { label: "Package", value: "package" },
  { label: "Chart", value: "chart-column" },
  { label: "Person Standing", value: "person-standing" },
  { label: "Shower", value: "shower-head" },
  { label: "Syringe", value: "syringe" },
  { label: "Wind", value: "wind" },
];

const logoPreviewMap: Record<string, string> = {
  axis: axisLogo,
  apollo: apolloLogo,
  apple: appleLogo,
  astha: asthaLogo,
  diya: diyaLogo,
};

const defaultSeo: SeoForm = {
  meta_title: "",
  meta_description: "",
  keywords: "",
  og_image: "",
  og_image_file: null,
  canonical_url: "",
};

let itemIdSeed = Date.now();

function nextItemId() {
  itemIdSeed += 1;
  return itemIdSeed;
}

function toText(value: unknown) {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

async function resolveUploadedImage(currentValue: string, file: File | null) {
  if (file) {
    const uploaded = await uploadFile(file);
    return uploaded.url;
  }

  return currentValue.trim();
}

function toBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    if (["1", "true", "yes", "on", "active", "enabled"].includes(normalized)) return true;
    if (["0", "false", "no", "off", "inactive", "disabled"].includes(normalized)) return false;
  }
  if (value == null) return fallback;
  return Boolean(value);
}

function linesFromValue(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return String(record.title || record.label || record.name || record.text || record.value || record.subtitle || "")
            .trim();
        }
        return String(item ?? "").trim();
      })
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    try {
      return linesFromValue(JSON.parse(trimmed));
    } catch {
      return value;
    }
  }

  return "";
}

function parseArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeBannerSlide(raw: unknown, index: number): BannerSlideForm {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawId = Number(record.id);
  const iconValue = toText(record.icon);
  const toneValue = toText(record.tone);

  return {
    id: Number.isFinite(rawId) ? rawId : nextItemId(),
    badge: toText(record.badge ?? record.badge_text),
    title: toText(record.title ?? record.heading),
    description: toText(record.description ?? record.subtitle),
    pointsText: linesFromValue(record.points),
    ctaLabel: toText(record.ctaLabel ?? record.cta_label ?? record.buttonText ?? record.button_text),
    ctaTo: toText(record.ctaTo ?? record.cta_to ?? record.link ?? record.href),
    icon: iconOptions.some((option) => option.value === iconValue) ? iconValue : iconOptions[index % iconOptions.length].value,
    tone: toneOptions.some((option) => option.value === toneValue) ? toneValue : toneOptions[index % toneOptions.length].value,
    backgroundImage: toText(record.backgroundImage ?? record.background_image ?? record.image),
    backgroundImageFile: null,
    isActive: toBoolean(record.is_active ?? record.isActive, true),
  };
}

function serializeBannerSlide(slide: BannerSlideForm) {
  const points = slide.pointsText
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: slide.id,
    badge: slide.badge.trim() || "Featured",
    title: slide.title.trim(),
    description: slide.description.trim(),
    points,
    ctaLabel: slide.ctaLabel.trim() || "Learn More",
    ctaTo: slide.ctaTo.trim() || "/contact",
    icon: slide.icon || "bed-double",
    tone: slide.tone || toneOptions[0].value,
    backgroundImage: slide.backgroundImage.trim(),
    is_active: slide.isActive ? 1 : 0,
  };
}

function createBlankBanner(): BannerSlideForm {
  return {
    id: nextItemId(),
    badge: "",
    title: "",
    description: "",
    pointsText: "",
    ctaLabel: "",
    ctaTo: "",
    icon: "bed-double",
    tone: toneOptions[0].value,
    backgroundImage: "",
    backgroundImageFile: null,
    isActive: true,
  };
}

function normalizeTrustHighlight(raw: unknown): TrustHighlightForm {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawId = Number(record.id);
  const iconValue = toText(record.icon);

  return {
    id: Number.isFinite(rawId) ? rawId : nextItemId(),
    title: toText(record.title),
    subtitle: toText(record.subtitle),
    icon: iconOptions.some((option) => option.value === iconValue)
      ? iconValue
      : iconValue || "truck",
    isActive: toBoolean(record.is_active ?? record.isActive, true),
  };
}

function serializeTrustHighlight(item: TrustHighlightForm) {
  return {
    id: item.id,
    title: item.title.trim(),
    subtitle: item.subtitle.trim(),
    icon: item.icon || "truck",
    is_active: item.isActive ? 1 : 0,
  };
}

function createBlankTrustHighlight(): TrustHighlightForm {
  return {
    id: nextItemId(),
    title: "",
    subtitle: "",
    icon: "truck",
    isActive: true,
  };
}

function normalizeClientLogo(raw: unknown): ClientLogoForm {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawId = Number(record.id);
  return {
    id: Number.isFinite(rawId) ? rawId : nextItemId(),
    name: toText(record.name ?? record.title ?? record.client_name),
    logoKey: toText(record.logoKey ?? record.logo_key ?? record.logo ?? record.image),
    logoImageFile: null,
    isActive: toBoolean(record.is_active ?? record.isActive, true),
  };
}

function serializeClientLogo(item: ClientLogoForm) {
  return {
    id: item.id,
    name: item.name.trim(),
    logoKey: item.logoKey.trim(),
    is_active: item.isActive ? 1 : 0,
  };
}

function createBlankClientLogo(): ClientLogoForm {
  return {
    id: nextItemId(),
    name: "",
    logoKey: "",
    logoImageFile: null,
    isActive: true,
  };
}

function resolveLogoPreview(logoKey: string) {
  if (logoPreviewMap[logoKey]) return logoPreviewMap[logoKey];
  return logoKey;
}

function normalizeHomeImage(raw: unknown): HomeImageForm {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawId = Number(record.id);
  return {
    id: Number.isFinite(rawId) ? rawId : nextItemId(),
    title: toText(record.title),
    image: toText(record.image ?? record.image_url ?? record.src),
    imageFile: null,
    alt: toText(record.alt ?? record.alt_text),
    isActive: toBoolean(record.is_active ?? record.isActive, true),
  };
}

function serializeHomeImage(item: HomeImageForm) {
  return {
    id: item.id,
    title: item.title.trim(),
    image: item.image.trim(),
    alt: item.alt.trim(),
    is_active: item.isActive ? 1 : 0,
  };
}

function createBlankHomeImage(): HomeImageForm {
  return {
    id: nextItemId(),
    title: "",
    image: "",
    imageFile: null,
    alt: "",
    isActive: true,
  };
}

function normalizeSeo(raw: unknown): SeoForm {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    meta_title: toText(record.meta_title ?? record.title),
    meta_description: toText(record.meta_description ?? record.description),
    keywords: toText(record.keywords),
    og_image: toText(record.og_image),
    og_image_file: null,
    canonical_url: toText(record.canonical_url),
  };
}

function serializeSeo(form: SeoForm) {
  return {
    meta_title: form.meta_title.trim(),
    meta_description: form.meta_description.trim(),
    keywords: form.keywords.trim(),
    og_image: form.og_image.trim(),
    canonical_url: form.canonical_url.trim(),
  };
}

function BannerSlideEditor({
  slide,
  index,
  onChange,
  onDelete,
}: {
  slide: BannerSlideForm;
  index: number;
  onChange: (next: BannerSlideForm) => void;
  onDelete: () => void;
}) {
  const setField = <K extends keyof BannerSlideForm>(key: K, value: BannerSlideForm[K]) => {
    onChange({ ...slide, [key]: value });
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              Banner {index + 1}
            </Badge>
            <p className="text-sm text-muted-foreground">Fill these fields with plain text. Use one line per point.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{slide.isActive ? "Active" : "Inactive"}</span>
              <Switch checked={slide.isActive} onCheckedChange={(checked) => setField("isActive", checked)} />
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete} className="shrink-0">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`badge-${slide.id}`}>Badge</Label>
            <Input
              id={`badge-${slide.id}`}
              value={slide.badge}
              onChange={(event) => setField("badge", event.target.value)}
              placeholder="Limited Time Combo Offers"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`ctaLabel-${slide.id}`}>CTA Text</Label>
            <Input
              id={`ctaLabel-${slide.id}`}
              value={slide.ctaLabel}
              onChange={(event) => setField("ctaLabel", event.target.value)}
              placeholder="View Combo Deals"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`title-${slide.id}`}>Title</Label>
            <Input
              id={`title-${slide.id}`}
              value={slide.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Buy Hospital Bed and Save More"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`description-${slide.id}`}>Description</Label>
            <Textarea
              id={`description-${slide.id}`}
              value={slide.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Short banner description"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`points-${slide.id}`}>Points</Label>
            <Textarea
              id={`points-${slide.id}`}
              value={slide.pointsText}
              onChange={(event) => setField("pointsText", event.target.value)}
              placeholder={"Air bed up to 25% off\nFood table up to 25% off\nIV stand up to 25% off"}
              className="min-h-[120px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Use one point per line. Commas also work if that is easier for you.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ctaTo-${slide.id}`}>CTA Link</Label>
            <Input
              id={`ctaTo-${slide.id}`}
              value={slide.ctaTo}
              onChange={(event) => setField("ctaTo", event.target.value)}
              placeholder="/products?mode=buy"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={slide.icon} onValueChange={(value) => setField("icon", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={slide.tone} onValueChange={(value) => setField("tone", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <ImageUploadField
              label="Background Image"
              value={slide.backgroundImage}
              file={slide.backgroundImageFile}
              onFileChange={(file) => setField("backgroundImageFile", file)}
              previewAlt={slide.title || "Hero slide preview"}
              helperText="Upload a background image for this hero slide."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrustHighlightEditor({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: TrustHighlightForm;
  index: number;
  onChange: (next: TrustHighlightForm) => void;
  onDelete: () => void;
}) {
  const setField = <K extends keyof TrustHighlightForm>(key: K, value: TrustHighlightForm[K]) => {
    onChange({ ...item, [key]: value });
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              Highlight {index + 1}
            </Badge>
            <p className="text-sm text-muted-foreground">Short trust card shown below the hero banner.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{item.isActive ? "Active" : "Inactive"}</span>
            <Switch checked={item.isActive} onCheckedChange={(checked) => setField("isActive", checked)} />
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`trust-title-${item.id}`}>Title</Label>
            <Input
              id={`trust-title-${item.id}`}
              value={item.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Express Delivery"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={item.icon} onValueChange={(value) => setField("icon", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="truck">Delivery Truck</SelectItem>
                <SelectItem value="indian-rupee">Indian Rupee</SelectItem>
                <SelectItem value="shield-check">Shield Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`trust-subtitle-${item.id}`}>Subtitle</Label>
            <Input
              id={`trust-subtitle-${item.id}`}
              value={item.subtitle}
              onChange={(event) => setField("subtitle", event.target.value)}
              placeholder="Same day in most cities"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientLogoEditor({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: ClientLogoForm;
  index: number;
  onChange: (next: ClientLogoForm) => void;
  onDelete: () => void;
}) {
  const setField = <K extends keyof ClientLogoForm>(key: K, value: ClientLogoForm[K]) => {
    onChange({ ...item, [key]: value });
  };

  const previewSrc = resolveLogoPreview(item.logoKey);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              Client {index + 1}
            </Badge>
            <p className="text-sm text-muted-foreground">Use a logo key like `apollo` or paste a direct image URL.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{item.isActive ? "Active" : "Inactive"}</span>
            <Switch checked={item.isActive} onCheckedChange={(checked) => setField("isActive", checked)} />
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`client-name-${item.id}`}>Client Name</Label>
            <Input
              id={`client-name-${item.id}`}
              value={item.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Apollo Hospitals"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`client-logo-${item.id}`}>Logo Key</Label>
            <Input
              id={`client-logo-${item.id}`}
              value={item.logoKey}
              onChange={(event) => setField("logoKey", event.target.value)}
              placeholder="apollo"
            />
          </div>
        </div>

        <div className="space-y-2">
          <ImageUploadField
            label="Logo Image"
            value={previewSrc}
            file={item.logoImageFile}
            onFileChange={(file) => setField("logoImageFile", file)}
            previewAlt={item.name || "Client logo"}
            helperText="Upload a custom logo image or keep using the logo key."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function HomeImageEditor({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: HomeImageForm;
  index: number;
  onChange: (next: HomeImageForm) => void;
  onDelete: () => void;
}) {
  const setField = <K extends keyof HomeImageForm>(key: K, value: HomeImageForm[K]) => {
    onChange({ ...item, [key]: value });
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              Image {index + 1}
            </Badge>
            <p className="text-sm text-muted-foreground">Add supporting images or homepage visuals here.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{item.isActive ? "Active" : "Inactive"}</span>
            <Switch checked={item.isActive} onCheckedChange={(checked) => setField("isActive", checked)} />
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`home-image-title-${item.id}`}>Title</Label>
            <Input
              id={`home-image-title-${item.id}`}
              value={item.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Home care setup"
            />
          </div>

          <div className="md:col-span-2">
            <ImageUploadField
              label="Image"
              value={item.image}
              file={item.imageFile}
              onFileChange={(file) => setField("imageFile", file)}
              previewAlt={item.alt || item.title || "Home image"}
              helperText="Choose a supporting image for this homepage card."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`home-image-alt-${item.id}`}>Alt Text</Label>
            <Input
              id={`home-image-alt-${item.id}`}
              value={item.alt}
              onChange={(event) => setField("alt", event.target.value)}
              placeholder="Image alt text"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SeoSection({
  active,
  onActiveChange,
  value,
  onChange,
}: {
  active: boolean;
  onActiveChange: (next: boolean) => void;
  value: SeoForm;
  onChange: (next: SeoForm) => void;
}) {
  const setField = <K extends keyof SeoForm>(key: K, nextValue: SeoForm[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-xl">Home SEO</CardTitle>
            <p className="text-sm text-muted-foreground">Edit the homepage SEO settings with normal form fields.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{active ? "Active" : "Inactive"}</span>
            <Switch checked={active} onCheckedChange={onActiveChange} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="seo-title">Meta Title</Label>
          <Input id="seo-title" value={value.meta_title} onChange={(event) => setField("meta_title", event.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="seo-description">Meta Description</Label>
          <Textarea
            id="seo-description"
            className="min-h-[110px]"
            value={value.meta_description}
            onChange={(event) => setField("meta_description", event.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="seo-keywords">Keywords</Label>
          <Input id="seo-keywords" value={value.keywords} onChange={(event) => setField("keywords", event.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <ImageUploadField
            label="OG Image"
            value={value.og_image}
            file={value.og_image_file}
            onFileChange={(file) => setField("og_image_file", file)}
            previewAlt="Home page SEO preview"
            helperText="Upload the sharing image used for homepage SEO cards."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-canonical">Canonical URL</Label>
          <Input id="seo-canonical" value={value.canonical_url} onChange={(event) => setField("canonical_url", event.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomeAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroSlidesActive, setHeroSlidesActive] = useState(true);
  const [slides, setSlides] = useState<BannerSlideForm[]>([]);
  const [trustHighlightsActive, setTrustHighlightsActive] = useState(true);
  const [trustHighlights, setTrustHighlights] = useState<TrustHighlightForm[]>([]);
  const [clientLogosActive, setClientLogosActive] = useState(true);
  const [clientLogos, setClientLogos] = useState<ClientLogoForm[]>([]);
  const [homeImagesActive, setHomeImagesActive] = useState(true);
  const [homeImages, setHomeImages] = useState<HomeImageForm[]>([]);
  const [seoActive, setSeoActive] = useState(true);
  const [seo, setSeo] = useState<SeoForm>(defaultSeo);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHomeContent({ all: true });
      const sections = (data.sections || {}) as Record<string, unknown>;
      const heroSection = sections.hero_slides as Record<string, unknown> | undefined;
      const trustSection = sections.trust_highlights as Record<string, unknown> | undefined;
      const logosSection = sections.client_logos as Record<string, unknown> | undefined;
      const imagesSection = sections.home_images as Record<string, unknown> | undefined;
      const seoSection = sections.seo as Record<string, unknown> | undefined;

      setHeroSlidesActive(toBoolean(heroSection?.is_active, true));
      setTrustHighlightsActive(toBoolean(trustSection?.is_active, true));
      setClientLogosActive(toBoolean(logosSection?.is_active, true));
      setHomeImagesActive(toBoolean(imagesSection?.is_active, true));
      setSeoActive(toBoolean(seoSection?.is_active, true));

      setSlides(parseArray(data.heroSlides).map(normalizeBannerSlide));
      setTrustHighlights(parseArray(data.trustHighlights).map(normalizeTrustHighlight));
      setClientLogos(parseArray(data.clientLogos).map(normalizeClientLogo));
      setHomeImages(parseArray(data.homeImages).map(normalizeHomeImage));
      setSeo(normalizeSeo(data.seo));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load home content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addSlide = () => setSlides((current) => [...current, createBlankBanner()]);
  const addTrustHighlight = () => setTrustHighlights((current) => [...current, createBlankTrustHighlight()]);
  const addClientLogo = () => setClientLogos((current) => [...current, createBlankClientLogo()]);
  const addHomeImage = () => setHomeImages((current) => [...current, createBlankHomeImage()]);

  const handleDelete = (message: string, onConfirm: () => void) => {
    if (!window.confirm(message)) return;
    onConfirm();
    toast.success("Item removed");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const heroSlides = (
        await Promise.all(
          slides.map(async (slide) => {
            const backgroundImage = await resolveUploadedImage(slide.backgroundImage, slide.backgroundImageFile);
            return {
              ...serializeBannerSlide(slide),
              backgroundImage,
            };
          })
        )
      ).filter((slide) => String(slide.title || "").trim().length > 0);

      const trustHighlightsPayload = trustHighlights
        .map(serializeTrustHighlight)
        .filter((item) => String(item.title || "").trim().length > 0 || String(item.subtitle || "").trim().length > 0);

      const clientLogosPayload = (
        await Promise.all(
          clientLogos.map(async (item) => {
            const logoKey = await resolveUploadedImage(item.logoKey, item.logoImageFile);
            return {
              ...serializeClientLogo(item),
              logoKey,
            };
          })
        )
      ).filter((item) => String(item.name || "").trim().length > 0 || String(item.logoKey || "").trim().length > 0);

      const homeImagesPayload = (
        await Promise.all(
          homeImages.map(async (item) => {
            const image = await resolveUploadedImage(item.image, item.imageFile);
            return {
              ...serializeHomeImage(item),
              image,
            };
          })
        )
      ).filter((item) => String(item.title || "").trim().length > 0 || String(item.image || "").trim().length > 0);

      const seoPayload = {
        ...serializeSeo(seo),
        og_image: await resolveUploadedImage(seo.og_image, seo.og_image_file),
      };

      await updateHomeContent({
        heroSlides,
        heroSlidesActive: heroSlidesActive ? 1 : 0,
        trustHighlights: trustHighlightsPayload,
        trustHighlightsActive: trustHighlightsActive ? 1 : 0,
        clientLogos: clientLogosPayload,
        clientLogosActive: clientLogosActive ? 1 : 0,
        homeImages: homeImagesPayload,
        homeImagesActive: homeImagesActive ? 1 : 0,
        seo: seoPayload,
        seoActive: seoActive ? 1 : 0,
      });

      toast.success("Home content updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save home content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Home">
      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="font-display text-2xl">Home Page Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  The hero banner and the rest of the homepage sections are now edited with normal fields instead of JSON.
                </p>
              </div>
              <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
                Form-based editor
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading home content...
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-dashed border-[#cfd7eb] bg-[#f7faff] p-4 text-sm text-slate-600">
                  Banner slides, trust cards, client logos, homepage images, and SEO settings can all be edited here without JSON.
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background p-4">
                  <div>
                    <p className="font-medium text-foreground">Hero Banner</p>
                    <p className="text-sm text-muted-foreground">Turn the full slider on or off for the homepage.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{heroSlidesActive ? "Active" : "Inactive"}</span>
                    <Switch checked={heroSlidesActive} onCheckedChange={setHeroSlidesActive} />
                  </div>
                </div>

                <div className="space-y-4">
                  {slides.length ? (
                    slides.map((slide, index) => (
                      <BannerSlideEditor
                        key={slide.id}
                        slide={slide}
                        index={index}
                        onChange={(next) => setSlides((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)))}
                        onDelete={() =>
                          handleDelete("Delete this banner slide?", () => {
                            setSlides((current) => current.filter((_, itemIndex) => itemIndex !== index));
                          })
                        }
                      />
                    ))
                  ) : (
                    <Card className="border-dashed border-border/70 bg-muted/20">
                      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                        <p className="font-medium text-foreground">No banner slides yet</p>
                        <p className="text-sm text-muted-foreground">Add a new slide to start building the homepage hero section.</p>
                        <Button type="button" onClick={addSlide} className="bg-[#2c5aa1] hover:bg-[#244a88]">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Banner
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="outline" onClick={addSlide}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Banner Slide
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="font-display text-xl">Trust Highlights</CardTitle>
                <p className="text-sm text-muted-foreground">Cards shown below the hero banner.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{trustHighlightsActive ? "Active" : "Inactive"}</span>
                <Switch checked={trustHighlightsActive} onCheckedChange={setTrustHighlightsActive} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {trustHighlights.length ? (
              trustHighlights.map((item, index) => (
                <TrustHighlightEditor
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={(next) => setTrustHighlights((current) => current.map((row, rowIndex) => (rowIndex === index ? next : row)))}
                  onDelete={() =>
                    handleDelete("Delete this trust highlight?", () => {
                      setTrustHighlights((current) => current.filter((_, rowIndex) => rowIndex !== index));
                    })
                  }
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No trust highlights yet.
              </div>
            )}
            <Button type="button" variant="outline" onClick={addTrustHighlight}>
              <Plus className="mr-2 h-4 w-4" />
              Add Highlight
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="font-display text-xl">Client Logos</CardTitle>
                <p className="text-sm text-muted-foreground">Trusted client strip shown on the homepage.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{clientLogosActive ? "Active" : "Inactive"}</span>
                <Switch checked={clientLogosActive} onCheckedChange={setClientLogosActive} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientLogos.length ? (
              clientLogos.map((item, index) => (
                <ClientLogoEditor
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={(next) => setClientLogos((current) => current.map((row, rowIndex) => (rowIndex === index ? next : row)))}
                  onDelete={() =>
                    handleDelete("Delete this client logo?", () => {
                      setClientLogos((current) => current.filter((_, rowIndex) => rowIndex !== index));
                    })
                  }
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No client logos yet.
              </div>
            )}
            <Button type="button" variant="outline" onClick={addClientLogo}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client Logo
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="font-display text-xl">Home Images</CardTitle>
                <p className="text-sm text-muted-foreground">Homepage support visuals or image cards.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{homeImagesActive ? "Active" : "Inactive"}</span>
                <Switch checked={homeImagesActive} onCheckedChange={setHomeImagesActive} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {homeImages.length ? (
              homeImages.map((item, index) => (
                <HomeImageEditor
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={(next) => setHomeImages((current) => current.map((row, rowIndex) => (rowIndex === index ? next : row)))}
                  onDelete={() =>
                    handleDelete("Delete this home image?", () => {
                      setHomeImages((current) => current.filter((_, rowIndex) => rowIndex !== index));
                    })
                  }
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No home images yet.
              </div>
            )}
            <Button type="button" variant="outline" onClick={addHomeImage}>
              <Plus className="mr-2 h-4 w-4" />
              Add Home Image
            </Button>
          </CardContent>
        </Card>

        <SeoSection active={seoActive} onActiveChange={setSeoActive} value={seo} onChange={setSeo} />

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={saving} className="min-w-[200px] bg-[#2c5aa1] hover:bg-[#244a88]">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Home Content
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
