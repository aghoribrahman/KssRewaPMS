import * as React from 'react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      // Fallback: Use the localized preview as the URL if the storage fails 
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
      <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-[2rem] p-10 bg-neutral-50/50 hover:bg-white hover:border-primary/30 transition-all duration-500 overflow-hidden">
        {preview ? (
          <div className="relative group/preview overflow-hidden rounded-2xl premium-shadow">
            <img src={preview} alt="Upload preview" className="max-h-64 rounded-2xl object-cover transition-transform duration-700 group-hover/preview:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
               <Button 
                 variant="secondary" 
                 className="rounded-xl font-bold bg-white text-neutral-900 hover:bg-white/90" 
                 onClick={handleClear}
               >
                 Change Photo
               </Button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-4 w-full">
            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl border border-neutral-100 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <span className="text-lg font-black text-neutral-900 block">{label}</span>
              <span className="text-sm font-medium text-neutral-400">Click to capture or upload patient photo</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-500 rounded-full">JPG</span>
              <span className="px-3 py-1 bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-500 rounded-full">PNG</span>
              <span className="px-3 py-1 bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-500 rounded-full">MAX 5MB</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-3 text-base font-black text-primary bg-primary/5 p-5 rounded-2xl border border-primary/10 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Syncing with Cloud Storage...</span>
        </div>
      )}
    </div>
  );
}

