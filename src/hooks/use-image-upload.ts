import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseImageUploadOptions {
  bucket: string;
  maxSizeMB?: number;
}

export function useImageUpload({ bucket, maxSizeMB = 5 }: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (selected.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const upload = async (userId: string): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file);

    if (error) {
      toast.error("Failed to upload image");
      setUploading(false);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUploading(false);
    return data.publicUrl;
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  return { uploading, preview, file, handleFileSelect, upload, clear };
}
