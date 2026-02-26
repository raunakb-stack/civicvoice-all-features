import { useState } from 'react';

export default function ImageGallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null); // index of open image

  if (!images.length) return null;

  const prev = () => setLightbox((i) => (i - 1 + images.length) % images.length);
  const next  = () => setLightbox((i) => (i + 1) % images.length);

  return (
    <>
      {/* Thumbnail grid */}
      <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {images.map((img, idx) => (
          <div
            key={img.publicId || idx}
            onClick={() => setLightbox(idx)}
            className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer group aspect-video"
          >
            <img
              src={img.url}
              alt={`Evidence ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition drop-shadow-lg">🔍</span>
            </div>
            {images.length > 3 && idx === 2 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{images.length - 3}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-400 mt-1">{images.length} photo{images.length !== 1 ? 's' : ''} attached</p>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-lg transition flex items-center justify-center"
          >
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            {lightbox + 1} / {images.length}
          </div>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full text-white text-xl transition flex items-center justify-center"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full text-white text-xl transition flex items-center justify-center"
              >
                ›
              </button>
            </>
          )}

          {/* Main image */}
          <img
            src={images[lightbox].url}
            alt={`Evidence ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightbox(idx); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                    idx === lightbox ? 'border-civic-400 scale-110' : 'border-white/20 hover:border-white/60'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
