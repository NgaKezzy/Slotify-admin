/**
 * Image upload helper: asks the API for a pre-signed PUT URL
 * (`POST /api/v1/uploads/presign`), uploads the file straight to object storage
 * (MinIO / S3) and returns the public URL to store on the entity.
 * Used by `ImageUpload` and the settings gallery editor.
 */
import { api, unwrap } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

/** Storage folders the API accepts (`^(salons|services|avatars)$`); keeps the bucket layout in one place. */
export const UploadFolders = {
  salons: "salons",
  services: "services",
  avatars: "avatars",
} as const;

export type UploadFolder = (typeof UploadFolders)[keyof typeof UploadFolders];

/**
 * Uploads one image and returns its public URL.
 * @param file Browser `File` selected by the user.
 * @param folder Target folder in the bucket.
 * @throws ApiError when the presign call or the PUT to storage fails.
 */
export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  const presign = unwrap(
    await api.POST("/api/v1/uploads/presign", {
      body: { fileName: file.name, contentType: file.type, folder },
    })
  );
  const response = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!response.ok) {
    throw new ApiError(-1, `Upload failed (${response.status})`, response.status);
  }
  return presign.publicUrl;
}
