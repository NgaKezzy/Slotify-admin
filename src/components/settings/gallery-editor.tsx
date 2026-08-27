"use client";

/**
 * Salon gallery editor: multi-file upload through the presign flow, reorder
 * with up/down buttons, remove, and save the ordered URL list with `PUT .../images`.
 */
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import type { SalonDetail } from "@/hooks/use-salons";
import { useUpdateSalonImages } from "@/hooks/use-settings";
import { toApiError } from "@/lib/api-error";
import { toastApiError } from "@/lib/form-errors";
import { UploadFolders, uploadImage } from "@/lib/upload";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export function GalleryEditor({ salon }: { salon: SalonDetail }) {
  const t = useTranslations("settings.gallery");
  const tCommon = useTranslations("common");
  const update = useUpdateSalonImages(salon.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(salon.images ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [syncedImages, setSyncedImages] = useState(salon.images);

  // Reload the local list when the salon detail refreshes (e.g. after saving).
  if (syncedImages !== salon.images) {
    setSyncedImages(salon.images);
    setImages(salon.images ?? []);
  }

  const move = (index: number, direction: -1 | 1) =>
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    toast.info(t("uploading", { count: files.length }));
    try {
      const urls = await Promise.all(
        [...files].map((file) => uploadImage(file, UploadFolders.salons))
      );
      setImages((current) => [...current, ...urls]);
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const save = () =>
    update.mutate(images, { onSuccess: () => toast.success(t("saved")), onError: toastApiError });

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {images.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="grid gap-2 rounded-lg border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-video w-full rounded-md object-cover" />
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tCommon("moveUp")}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tCommon("moveDown")}
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tCommon("remove")}
                  onClick={() => setImages((c) => c.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={save} disabled={update.isPending || isUploading}>
          {update.isPending ? tCommon("saving") : tCommon("save")}
        </Button>
      </CardFooter>
    </Card>
  );
}
