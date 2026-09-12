import React, { useState } from 'react';
import { Memory, MemoryCategory } from '../../types';
import { Volume2, Play, Video, Mic, Sparkles } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { AudioDiaryRecorder } from './AudioDiaryRecorder';
import { useLanguage } from '../../context/LanguageContext';

interface MemoriesGalleryProps {
  memories: Memory[];
  patientName?: string;
  onOpenMemory: (memory: Memory) => void;
  onAddMemory?: (memory: Memory) => void;
}

const CATEGORIES: MemoryCategory[] = ['All', 'Voice Diary', 'Family', 'People', 'Places', 'Special Moments'];

export const MemoriesGallery: React.FC<MemoriesGalleryProps> = ({ 
  memories, 
  patientName = 'Friend',
  onOpenMemory,
  onAddMemory
}) => {
  const { t, tx } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<MemoryCategory>('All');
  const [showRecorder, setShowRecorder] = useState(false);

  const getCategoryLabel = (cat: MemoryCategory) => {
    switch (cat) {
      case 'All': return tx('All', 'सभी', 'সকলো');
      case 'Voice Diary': return tx('Voice Diary', 'आवाज़ डायरी', 'কণ্ঠ ডায়েৰী');
      case 'Family': return tx('Family', 'परिवार', 'পৰিয়াল');
      case 'People': return tx('People', 'अपने लोग', 'আপোন মানুহ');
      case 'Places': return tx('Places', 'स्थान', 'ঠাইসমূহ');
      case 'Special Moments': return tx('Special Moments', 'ख़ास पल', 'বিশেষ মুহূৰ্ত');
      default: return cat;
    }
  };

  const filteredMemories = activeCategory === 'All'
    ? memories
    : memories.filter((m) => m.category === activeCategory);

  const handleSaveDiary = (newMemory: Memory) => {
    if (onAddMemory) {
      onAddMemory(newMemory);
    }
    setShowRecorder(false);
  };

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#2D3A2F]">{t('memoriesTitle')}</h2>
          <p className="text-sm text-[#5A6E5D]">{t('memoriesSub')}</p>
        </div>

        {/* Record Voice Diary Trigger Button */}
        <button
          onClick={() => {
            soundController.playClick();
            setShowRecorder(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-[#5B825B] text-white font-black text-xs flex items-center gap-2 hover:bg-[#4d704d] active:scale-95 shadow-xs transition-all shrink-0"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span>{t('recordMemory')}</span>
        </button>
      </div>

      {/* Voice Diary Quick Prompt Banner */}
      <div 
        onClick={() => {
          soundController.playClick();
          setShowRecorder(true);
        }}
        className="p-4 rounded-3xl bg-gradient-to-r from-[#EAF1E8] to-[#F5F2EB] border border-[#d2e2d0] flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shadow-xs shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-[#5B825B] tracking-wider">
                {tx('Spoken Audio Diary', 'बोलकर आवाज़ डायरी', 'কণ্ঠৰে কোৱা ডায়েৰী')}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#5B825B]/15 text-[10px] font-bold text-[#5B825B]">
                {tx('Speech-to-Text', 'आवाज़ से लिखावट', 'কথাৰ পৰা লেখালৈ')}
              </span>
            </div>
            <h3 className="font-extrabold text-base text-[#2D3A2F] leading-tight mt-0.5">
              {tx("Record your thoughts or today's stories", 'अपने विचार या आज की कोई बात रिकॉर्ड करें', 'আপোনাৰ মনৰ কথা বা আজিৰ অভিজ্ঞতা ৰেকৰ্ড কৰক')}
            </h3>
            <p className="text-xs text-[#5A6E5D]">
              {tx('Tap here to talk. Your voice will be preserved as a memory entry.', 'बोलने के लिए यहाँ दबाएँ। आपकी आवाज़ याद के रूप में सहेज ली जाएगी।', 'কথা ক’বলৈ ইয়াত টিপক। আপোনাৰ কণ্ঠ স্মৃতি হিচাপে সংৰক্ষণ কৰা হ’ব।')}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#5B825B] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{tx('Record Now', 'अभी रिकॉर्ड करें', 'এতিয়াই ৰেকৰ্ড কৰক')}</span>
        </div>
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
              {getCategoryLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Grid of Memory Cards */}
      {filteredMemories.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#E0DCD3] shadow-xs text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center mx-auto shadow-2xs">
            {activeCategory === 'Voice Diary' ? <Mic className="w-8 h-8" /> : <Video className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-black text-[#2D3A2F]">
            {activeCategory === 'Voice Diary' 
              ? tx('No voice diaries recorded yet', 'अभी कोई आवाज़ डायरी रिकॉर्ड नहीं हुई है', 'এতিয়ালৈ কোনো কণ্ঠ ডায়েৰী ৰেকৰ্ড হোৱা নাই')
              : tx('No memories saved yet', 'अभी कोई यादें सहेजी नहीं गई हैं', 'এতিয়ালৈ কোনো স্মৃতি সংৰক্ষণ কৰা হোৱা নাই')}
          </h3>
          <p className="text-xs text-[#5A6E5D] max-w-xs mx-auto leading-relaxed">
            {activeCategory === 'Voice Diary' 
              ? tx('Tap the Record button above to start your first spoken audio journal!', 'अपनी पहली बोलती डायरी शुरू करने के लिए ऊपर दिए गए रिकॉर्ड बटन को दबाएँ!', 'আপোনাৰ প্ৰথমটো কণ্ঠ ডায়েৰী আৰম্ভ কৰিবলৈ ওপৰৰ ৰেকৰ্ড বুটামটো টিপক!') 
              : tx('Family members can upload photos, home videos, and loving voice notes to preserve here.', 'परिवार के सदस्य यहाँ सहेजने के लिए तस्वीरें, वीडियो और प्यार भरे संदेश जोड़ सकते हैं।', 'পৰিয়ালৰ সদস্যসকলে ইয়াত স্মৃতি সংৰক্ষণৰ বাবে ফটো, ভিডিঅ’ আৰু মৰমৰ কণ্ঠ বাৰ্তা যোগ কৰিব পাৰে।')}
          </p>
          {activeCategory === 'Voice Diary' && (
            <button
              onClick={() => {
                soundController.playClick();
                setShowRecorder(true);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#5B825B] text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs"
            >
              <Mic className="w-4 h-4" />
              <span>{tx('Record First Audio Diary', 'पहली ऑडियो डायरी रिकॉर्ड करें', 'প্ৰথমটো কণ্ঠ ডায়েৰী ৰেকৰ্ড কৰক')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredMemories.map((m) => {
            const isVideo = m.mediaType === 'video' || Boolean(m.videoUrl);
            const isVoiceDiary = m.isVoiceDiary || m.mediaType === 'audio' || Boolean(m.audioUrl);

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
                      {getCategoryLabel(m.category)}
                    </span>
                    {isVideo && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E8B25C] text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                        <Video className="w-2.5 h-2.5" /> {tx('Video', 'वीडियो', 'ভিডিঅ’')}
                      </span>
                    )}
                    {isVoiceDiary && (
                      <span className="px-2 py-0.5 rounded-full bg-[#5B825B] text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                        <Mic className="w-2.5 h-2.5" /> {tx('Voice', 'आवाज़', 'কণ্ঠস্বৰ')}
                      </span>
                    )}
                    {m.voiceSnippet && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E8B25C] text-[#3D2504] text-[10px] font-black flex items-center gap-1 shadow-xs">
                        <Mic className="w-2.5 h-2.5" /> {m.voiceRecordedBy || tx('Family Voice', 'पारिवारिक आवाज़', 'পৰিয়ালৰ কণ্ঠ')}
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

                  {/* Mic Overlay for Voice Diaries */}
                  {isVoiceDiary && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-[#5B825B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Volume2 className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-[#2D3A2F] leading-tight line-clamp-1">{m.title}</h4>
                    {m.person && <p className="text-xs font-semibold text-[#5B825B] mt-0.5">{m.person}</p>}
                    {m.voicePromptText ? (
                      <p className="text-xs text-[#8C651E] font-medium italic line-clamp-2 mt-1 bg-[#FFF9E6] px-2 py-0.5 rounded-lg border border-[#F0DC9D]/60">
                        "{m.voicePromptText}"
                      </p>
                    ) : (
                      <p className="text-xs text-[#5A6E5D] line-clamp-2 mt-1">{m.description}</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#5B825B]">
                    <span className="flex items-center gap-1">
                      {isVideo ? (
                        <>
                          <Video className="w-3.5 h-3.5" /> {tx('Watch Video', 'वीडियो देखें', 'ভিডিঅ’ চাওক')}
                        </>
                      ) : isVoiceDiary ? (
                        <>
                          <Mic className="w-3.5 h-3.5" /> {tx('Listen & Read', 'सुनें व पढ़ें', 'শুনক আৰু পঢ়ক')}
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> {tx('Read', 'पढ़ें', 'পঢ়ক')}
                        </>
                      )}
                    </span>
                    <span className="text-[#5A6E5D]">{tx('Tap to open →', 'खोलें →', 'খোলক →')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Audio Diary Recorder Modal */}
      {showRecorder && (
        <AudioDiaryRecorder
          patientName={patientName}
          onSave={handleSaveDiary}
          onClose={() => setShowRecorder(false)}
        />
      )}
    </div>
  );
};

