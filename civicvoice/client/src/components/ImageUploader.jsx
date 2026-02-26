import { useState, useRef, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const MAX_FILES  = 4;
const MAX_MB     = 10;
const ALLOWED    = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Format bytes → human-readable
const fmtBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

export default function ImageUploader({ value = [], onChange, maxFiles = MAX_FILES }) {
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState([]);   // array of { name, progress }
  const inputRef = useRef();

  // value = array of { url, publicId, bytes, format, width, height }

  const validateFiles = (files) => {
    const valid = [];
    for (const f of files) {
      if (!ALLOWED.includes(f.type)) { toast.error(`${f.name}: not a supported image type`); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { toast.error(`${f.name}: exceeds ${MAX_MB} MB`); continue; }
      if (value.length + valid.length >= maxFiles) { toast.error(`Max ${maxFiles} images allowed`); break; }
      valid.push(f);
    }
    return valid;
  };

  const uploadFiles = useCallback(async (files) => {
    const valid = validateFiles(Array.from(files));
    if (!valid.length) return;

    // Optimistic local previews
    const previews = valid.map((f) => ({
      name:     f.name,
      progress: 0,
      localUrl: URL.createObjectURL(f),
    }));
    setUploading((u) => [...u, ...previews]);

    const formData = new FormData();
    valid.forEach((f) => formData.append('images', f));

    try {
      const { data } = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploading((u) =>
            u.map((item) =>
              previews.find((p) => p.name === item.name) ? { ...item, progress: pct } : item
            )
          );
        },
      });

      // Remove optimistic previews and add real results
      setUploading((u) => u.filter((item) => !previews.find((p) => p.name === item.name)));
      onChange([...value, ...data.images]);
      toast.success(`✅ ${data.images.length} image${data.images.length > 1 ? 's' : ''} uploaded!`);
    } catch (err) {
      setUploading((u) => u.filter((item) => !previews.find((p) => p.name === item.name)));
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  }, [value, onChange]);

  const removeImage = async (img, idx) => {
    try {
      // Delete from Cloudinary
      await api.delete(`/upload/images/${encodeURIComponent(img.publicId)}`);
      onChange(value.filter((_, i) => i !== idx));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const remaining = maxFiles - value.length - uploading.length;

  return (
    <div className="space-y-3">
      {/* Drag-drop zone */}
      {remaining > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-civic-500 bg-civic-50 scale-[1.01]'
              : 'border-stone-300 hover:border-civic-400 hover:bg-stone-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />

          <div className="flex flex-col items-center gap-2">
            <div className={`text-4xl transition-transform duration-200 ${dragging ? 'scale-125' : ''}`}>
              📷
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700">
                {dragging ? 'Drop images here!' : 'Drag & drop photos, or click to browse'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                JPEG, PNG, WebP, GIF · Max {MAX_MB} MB each · Up to {maxFiles} images
              </p>
              <p className="text-xs text-civic-600 font-semibold mt-1">
                {remaining} slot{remaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading progress indicators */}
      {uploading.map((item, i) => (
        <div key={i} className="card p-3 flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
            {item.localUrl
              ? <img src={item.localUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-2xl">🖼</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-700 truncate mb-1.5">{item.name}</p>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-civic-500 rounded-full transition-all duration-200"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-1">{item.progress < 100 ? `${item.progress}%` : '⚙️ Processing…'}</p>
          </div>
        </div>
      ))}

      {/* Uploaded image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {value.map((img, idx) => (
            <div key={img.publicId || idx} className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-video">
              <img
                src={img.url}
                alt={`Evidence ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  {/* View full size */}
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 shadow transition text-sm"
                    title="View full size"
                  >
                    🔍
                  </a>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(img, idx); }}
                    className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow transition text-sm"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* File info badge */}
              {img.bytes && (
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-white text-xs font-mono flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <span>{img.format?.toUpperCase()}</span>
                  <span>{fmtBytes(img.bytes)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {(value.length > 0 || uploading.length > 0) && (
        <p className="text-xs text-stone-400 text-right">
          {value.length}/{maxFiles} image{value.length !== 1 ? 's' : ''} attached
        </p>
      )}
    </div>
  );
}
