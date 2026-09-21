import React, { useState, useRef } from 'react';
import { MediaLibraryModal } from './MediaLibraryModal';
import { useToast } from '../context/ToastContext';
import { soundFx } from '../utils/sound';
import { processAndUploadMedia, UploadProgressInfo } from '../utils/mediaUpload';
import { 
  Upload, 
  FolderOpen, 
  Link as LinkIcon, 
  X, 
  Loader2, 
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  allowVideo?: boolean;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  className?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  value,
  onChange,
  label = 'Image',
  helperText = 'Upload JPG, PNG, or WEBP from your device or select from Media Library',
  allowVideo = false,
  aspectRatio = 'square',
  className = ''
}) => {
  const toast = useToast();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    soundFx.playClick();

    try {
      const result = await processAndUploadMedia(file, {
        allowVideo,
        onProgress: (info) => {
          setUploadProgress(info);
        }
      });

      onChange(result.url);
      soundFx.playUploadSuccess();
      toast.success('Media uploaded successfully');
    } catch (err: any) {
      console.error('Media upload error:', err);
      soundFx.playError();
      toast.error(err.message || 'Media upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef1.current) fileInputRef1.current.value = '';
      if (fileInputRef2.current) fileInputRef2.current.value = '';
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    toast.success('Image URL applied');
    setIsUrlInputOpen(false);
    setCustomUrl('');
  };

  const handleRemove = () => {
    soundFx.playDelete();
    onChange('');
    toast.info('Image removed');
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[21/9]',
    auto: 'h-40'
  }[aspectRatio];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            {label}
          </label>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Upload & Preview Container */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 overflow-hidden">
        {value ? (
          <div className="space-y-3">
            {/* Visual Preview */}
            <div className={`relative w-full ${aspectClasses} rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center group`}>
              {value.includes('.mp4') || value.includes('.webm') ? (
                <video src={value} className="w-full h-full object-cover" controls />
              ) : (
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900/90 text-white text-xs font-bold border border-zinc-700 hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Replace from Library</span>
                </button>

                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5">
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{uploadProgress ? `${uploadProgress.percent}%` : 'Uploading...'}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef1}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleDeviceUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* URL Display */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 truncate">
              <span className="truncate max-w-[80%]" title={value}>
                {value}
              </span>
              <button
                type="button"
                onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                className="text-amber-400 hover:text-amber-300 shrink-0 ml-2"
              >
                Edit URL
              </button>
            </div>
          </div>
        ) : (
          /* Empty State: Choice Buttons */
          <div className="py-6 px-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <ImageIcon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Upload or Choose Media</p>
              <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">{helperText}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {/* Button 1: Device Upload */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/10">
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{uploadProgress ? `${uploadProgress.percent}%` : 'Uploading...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload From Device</span>
                  </>
                )}
                <input
                  ref={fileInputRef2}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleDeviceUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {/* Button 2: Choose from Media Library */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsLibraryOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Media Library</span>
              </button>

              {/* Button 3: Paste Image URL */}
              <button
                type="button"
                onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste URL</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Direct URL input */}
        {isUrlInputOpen && (
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shrink-0"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsUrlInputOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Media Library Modal integration */}
      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectMedia={(url) => {
          onChange(url);
          toast.success('Media selected from library');
        }}
        title={`Select ${label}`}
      />
    </div>
  );
};
