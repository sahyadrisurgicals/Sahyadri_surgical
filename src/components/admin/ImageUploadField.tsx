import { useEffect, useState } from "react";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  previewAlt: string;
  helperText?: string;
};

export function ImageUploadField({ label, value, file, onFileChange, previewAlt, helperText }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [file]);

  const resolvedPreview = file ? preview : value;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Choose an image file</p>
            <p className="text-xs text-muted-foreground">
              {helperText || "The selected file will upload when you save."}
            </p>
          </div>
          <Input type="file" accept="image/*" className="max-w-xs" onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
        </div>

        {resolvedPreview ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
            <img src={resolvedPreview} alt={previewAlt} className="h-48 w-full object-cover" />
          </div>
        ) : (
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">No image selected</span>
              <UploadCloud className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
