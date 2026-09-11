import React, { useState } from 'react';
import { Memory, MemoryCategory } from '../../types';
import { Volume2, Play, Video } from 'lucide-react';
import { soundController } from '../../utils/audio';

interface MemoriesGalleryProps {
  memories: Memory[];
  onOpenMemory: (memory: Memory) => void;
}

const CATEGORIES: MemoryCategory[] = ['All', 'Family', 'People', 'Places', 'Special Moments'];

export const MemoriesGallery: React.FC<MemoriesGalleryProps> = ({ memories, onOpenMemory }) => {
  const [activeCategory, setActiveCategory] = useState<MemoryCategory>('All');

  const filteredMemories = activeCategory === 'All'
    ? memories
    : memories.filter((m) => m.category === activeCategory);

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">Memories Gallery</h2>
        <p className="text-sm text-[#5A6E5D]">Heartfelt photos, family videos, and stories of loved ones & special places.</p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                soundController.playClick();
                setActiveCategory(cat);
              }}
              className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#5B825B] text-white shadow-xs'
                  : 'bg-white text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Memory Cards */}
      {filteredMemories.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#E0DCD3] shadow-xs text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#F0D8D6] text-[#C46A66] flex items-center justify-center mx-auto shadow-2xs">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#2D3A2F]">No memories saved yet</h3>
          <p className="text-xs text-[#5A6E5D] max-w-xs mx-auto leading-relaxed">
            Family members can upload photos, home videos, and loving voice notes from the Caregiver portal to preserve here for reminiscing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredMemories.map((m) => {
            const isVideo = m.mediaType === 'video' || Boolean(m.videoUrl);

            return (
              <div
                key={m.id}
                onClick={() => {
                  soundController.playClick();
                  onOpenMemory(m);
                }}
                className="group bg-white rounded-3xl overflow-hidden border border-[#E0DCD3] shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-[#F0D8D6]">
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Category & Media Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#2D3A2F] shadow-xs">
                      {m.category}
                    </span>
                    {isVideo && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E8B25C] text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                        <Video className="w-2.5 h-2.5" /> Video
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay for Videos */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-white/90 text-[#2D3A2F] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current translate-x-0.5 text-[#5B825B]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-[#2D3A2F] leading-tight line-clamp-1">{m.title}</h4>
                    {m.person && <p className="text-xs font-semibold text-[#5B825B] mt-0.5">{m.person}</p>}
                    <p className="text-xs text-[#5A6E5D] line-clamp-2 mt-1">{m.description}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#5B825B]">
                    <span className="flex items-center gap-1">
                      {isVideo ? <Video className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      {isVideo ? 'Watch Video' : 'Read'}
                    </span>
                    <span className="text-[#5A6E5D]">Tap to open →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
