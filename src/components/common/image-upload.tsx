"use client";

/**
 * Single-image picker with preview: uploads the chosen file through
 * `uploadImage()` (presigned PUT) and hands the public URL to the form via
 * `onChange`. The empty state is a click-or-drop zone; once an image is set it
 * is shown at full size with change/remove actions on hover.
 * Used for staff avatars, service images and the salon cover.
 */
import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toApiError } from "@/lib/api-error";
import { uploadImage, type UploadFolder } from "@/lib/upload";
import { cn } from "@/lib/utils";

/** Accepted MIME types for every image upload in the admin. */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [isDragging, setIsDragging] = useState(false);
  const isBusy = disabled || isUploading;

  const handleFile = async (file: File | undefined) => {
    if (!file || isBusy) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("invalidType"));
      return;
    }
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

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };
  const onDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (!isBusy) setIsDragging(true);
  };

  const sizeClass = shape === "square" ? "size-28" : "aspect-[3/1] w-full max-w-2xl";

  return (
    <div className={cn("grid gap-2", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        disabled={isBusy}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {value ? (
        <div
          className={cn(
            "group relative overflow-hidden rounded-xl border bg-muted",
            sizeClass,
            shape === "square" && "rounded-full"
          )}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={() => setIsDragging(false)}
        >
          {/* Storage URLs are dynamic, so next/image cannot optimise them. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="size-full object-cover" />
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 bg-background/70 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
              (isUploading || isDragging) && "opacity-100",
              shape === "square" && "flex-col gap-1"
            )}
          >
            {isUploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => inputRef.current?.click()}
                >
                  <RefreshCw className="size-3.5" />
                  {t("change")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => onChange(undefined)}
                >
                  <Trash2 className="size-3.5" />
                  {t("remove")}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/40 text-center text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/70 hover:text-foreground focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            sizeClass,
            shape === "square" && "rounded-full",
            isDragging && "border-primary bg-primary/5 text-foreground",
            isBusy && "cursor-not-allowed opacity-60"
          )}
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : shape === "square" ? (
            <ImagePlus className="size-6" />
          ) : (
            <>
              <span className="flex size-10 items-center justify-center rounded-full bg-background shadow-sm">
                <UploadCloud className="size-5" />
              </span>
              <span className="text-sm font-medium text-foreground">{t("dropHint")}</span>
              <span className="text-xs">{t("formats")}</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
