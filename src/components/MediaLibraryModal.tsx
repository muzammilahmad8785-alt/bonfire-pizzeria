import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { MediaItem } from '../types';
import { useToast } from '../context/ToastContext';
import { soundFx } from '../utils/sound';
import { processAndUploadMedia, UploadProgressInfo } from '../utils/mediaUpload';
import { 
  X, 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Film, 
  ExternalLink,
  Loader2,
  HardDrive
} from 'lucide-react';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (url: string, item: MediaItem) => void;
  title?: string;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  title = 'Media Library'
}) => {
  const toast = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time listener on media collection
  useEffect(() => {
    if (!isOpen) return;

    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaItem));
        setMediaList(items);
      },
      (err) => {
        console.warn('Media library listener notice:', err);
      }
    );

    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  // Trace: file select → validation → storage upload → permanent URL → database save
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    soundFx.playClick();

    try {
      const total = files.length;
      for (let i = 0; i < total; i++) {
        const file = files[i];
        const filePrefix = total > 1 ? `[${i + 1}/${total}] ` : '';

        await processAndUploadMedia(file, {
          allowVideo: true,
          onProgress: (info) => {
            setUploadProgress({
              ...info,
              message: `${filePrefix}${info.message}`
            });
          }
        });
      }

      soundFx.playUploadSuccess();
      toast.success('Media uploaded successfully');
    } catch (err: any) {
      console.error('Media Library upload error:', err);
      soundFx.playError();
      toast.error(err.message || 'Media upload failed. Please try again.');
    } finally {
      // Loading ALWAYS stops on success or error
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDeleteMedia = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.name}" from Media Library?`)) return;

    soundFx.playDelete();
    try {
      await deleteDoc(doc(db, 'media', item.id));
      // Attempt Storage delete if applicable
      if (item.url.includes('firebasestorage.googleapis.com')) {
        try {
          const storageRef = ref(storage, item.url);
          await deleteObject(storageRef);
        } catch {}
      }
      toast.success('Media item deleted');
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleCopyUrl = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.info('Media URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-y-contain p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.playClick();
          onClose();
        }
      }}
    >
      <div 
        id="media-library-modal" 
        className="relative w-full max-w-4xl bg-[#121216] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] my-auto overflow-hidden animate-scaleUp"
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
              <p className="text-xs text-zinc-400">
                {onSelectMedia ? 'Click any item to select it for your form' : 'Manage restaurant uploaded images & videos'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Upload Button */}
        <div className="px-6 py-3 border-b border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/40">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search media by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${filterType === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('image')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${filterType === 'image' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
              >
                Images
              </button>
              <button
                onClick={() => setFilterType('video')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${filterType === 'video' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
              >
                Videos
              </button>
            </div>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgress ? `${uploadProgress.percent}%` : 'Uploading...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload From Device</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm"
              onChange={handleDeviceUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload Progress Indicator Bar */}
        {uploading && uploadProgress && (
          <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3 animate-fadeIn">
            <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress.percent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0">
              {uploadProgress.percent}%
            </span>
            <span className="text-[11px] text-zinc-300 truncate max-w-xs">
              {uploadProgress.message}
            </span>
          </div>
        )}

        {/* Media Grid Container */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-y-contain flex-1 min-h-[220px] touch-scroll">
          {filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-zinc-500">
                <ImageIcon className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-white">No media found</h4>
              <p className="text-xs text-zinc-400 max-w-sm">
                Upload images or videos from your device to use them across products, deals, and homepage sections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectMedia) {
                        soundFx.playClick();
                        onSelectMedia(item.url, item);
                        onClose();
                      }
                    }}
                    className={`group relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col transition-all ${
                      onSelectMedia ? 'cursor-pointer hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10' : ''
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
                      {item.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            loop
                          />
                          <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-amber-400">
                            <Film className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}

                      {/* Select Overlay on Hover if selection mode */}
                      {onSelectMedia && (
                        <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="px-3 py-1 rounded-full bg-amber-500 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg">
                            Select Media
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Media Info Footer */}
                    <div className="p-3 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-zinc-200 truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">
                          {item.type} {item.size ? `• ${(item.size / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleCopyUrl(item.url, item.id, e)}
                          title="Copy direct URL"
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteMedia(item, e)}
                          title="Delete from Media Library"
                          className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-400">
          <span>Total items: {filteredMedia.length}</span>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
