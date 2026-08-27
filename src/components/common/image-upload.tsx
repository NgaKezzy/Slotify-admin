"use client";

/**
 * Single-image picker with preview: uploads the chosen file through
 * `uploadImage()` (presigned PUT) and hands the public URL to the form via
 * `onChange`. Used for staff avatars, service images and the salon cover.
 */
import { ImagePlus, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toApiError } from "@/lib/api-error";
import { uploadImage, type UploadFolder } from "@/lib/upload";
import { cn } from "@/lib/utils";

/** Accepted MIME types for every image upload in the admin. */
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder: UploadFolder;
  /** Preview shape: square (avatars) or wide (covers, service images). */
  shape?: "square" | "wide";
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  shape = "wide",
  disabled,
  className,
}: ImageUploadProps) {
  const t = useTranslations("common.upload");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (error) {
      toast.error(t("failed", { message: toApiError(error).message }));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground",
          shape === "square" ? "size-20" : "h-24 w-40"
        )}
      >
        {value ? (
          // Storage URLs are dynamic, so next/image cannot optimise them.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-6" />
        )}
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? t("uploading") : t("choose")}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => onChange(undefined)}
          >
            <X className="size-3.5" />
            {t("remove")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
