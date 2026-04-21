import * as React from 'react';
import { useState } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  folder: string;
  label?: string;
}

export function ImageUpload({ onUploadComplete, folder, label = "Upload Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      onUploadComplete(url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      // Fallback: Use the localized preview as the URL if the storage fails 
      // (This is primarily for demonstration/development convenience if Storage isn't configured)
      onUploadComplete(reader.result as string);
      toast.info("Could not connect to Cloud Storage. Using local preview.", {
        description: "You can proceed, but the image won't persist across sessions."
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-2xl p-6 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
        {preview ? (
          <div className="relative group overflow-hidden rounded-xl">
            <img src={preview} alt="Upload preview" className="max-h-48 rounded-xl object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
               <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20" onClick={handleClear}>Clear</Button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-neutral-100 flex items-center justify-center mb-1">
              <Camera className="w-6 h-6 text-neutral-400" />
            </div>
            <span className="text-sm font-medium text-neutral-600">{label} <span className="text-[10px] text-neutral-400 font-normal uppercase tracking-wider ml-1">(Optional)</span></span>
            <span className="text-xs text-neutral-400">JPG, PNG up to 5MB</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/10 p-3 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading to CareFlow Storage...</span>
        </div>
      )}
    </div>
  );
}
