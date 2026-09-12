import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Square, Music, Sparkles } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface RelaxationMusicProps {
  onBack: () => void;
}

type TrackType = 'nature' | 'harp' | 'flute' | 'singing_bowl' | 'raga_yaman';

interface TrackItem {
  id: TrackType;
  title: string;
  subtitle: string;
  mood: string;
  color: string;
  tag?: string;
}

export const RelaxationMusic: React.FC<RelaxationMusicProps> = ({ onBack }) => {
  const { t, isHindi } = useLanguage();
  const [activeTrack, setActiveTrack] = useState<TrackType | null>(null);

  const tracks: TrackItem[] = [
    {
      id: 'raga_yaman',
      title: isHindi ? 'संध्या राग यमन (तानपुरा व सितार)' : 'Evening Raga Yaman (Tanpura & Sitar)',
      subtitle: isHindi ? 'गोधूलि वेला व संध्या कालीन शांति के लिए विशेष राग' : 'Tranquil evening drone for sundowning calming & peace',
      mood: isHindi ? 'संध्या शांति व तनाव मुक्ति' : 'Evening Peace & Sundowning Relief',
      color: '#FDEED9',
      tag: isHindi ? 'संध्या काल के लिए' : 'Evening Recommendation',
    },
    {
      id: 'singing_bowl',
      title: isHindi ? 'तिब्बती सिंगिंग बाउल (432Hz)' : 'Tibetan Singing Bowl (432Hz)',
      subtitle: isHindi ? 'मानसिक शांति और एकाग्रता के लिए गहरी गूंज' : 'Deep resonance for mental calm and focus',
      mood: isHindi ? 'गहरा सुकून' : 'Deep Calm',
      color: '#FDF0D5',
    },
    {
      id: 'flute',
      title: isHindi ? 'बांसुरी ध्यान संगीत' : 'Bamboo Flute Meditation',
      subtitle: isHindi ? 'पारम्परिक मधुर बांसुरी की तान' : 'Melodious tranquil Indian bamboo notes',
      mood: isHindi ? 'मन की शांति' : 'Peace of Mind',
      color: '#F0D8D6',
    },
    {
      id: 'harp',
      title: isHindi ? 'शांत वीणा स्वर' : 'Peaceful Harp Harmonies',
      subtitle: isHindi ? 'मन को छूने वाले शांत तार' : 'Soft plucked strings with soothing progression',
      mood: isHindi ? 'सुकूनदायक' : 'Gentle Comfort',
      color: '#D4E4E6',
    },
    {
      id: 'nature',
      title: isHindi ? 'सुबह के वन पक्षी' : 'Morning Forest Birds',
      subtitle: isHindi ? 'मधुर सुबह की चहचहाहट व ठंडी हवा' : 'Gentle morning birdsong and warm breeze',
      mood: isHindi ? 'ताजगी व ऊर्जा' : 'Uplifting & Fresh',
      color: '#EAF1E8',
    },
  ];

  const toggleTrack = (trackId: TrackType) => {
    if (activeTrack === trackId) {
      soundController.stopAmbient();
      setActiveTrack(null);
    } else {
      soundController.startAmbient(trackId);
      setActiveTrack(trackId);
    }
  };

  useEffect(() => {
    return () => {
      soundController.stopAmbient();
    };
  }, []);

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            soundController.stopAmbient();
            onBack();
          }}
          className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] hover:bg-[#EAF1E8]"
          aria-label={t('goBack')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#2D3A2F]">{t('musicTitle')}</h2>
          <p className="text-xs text-[#5A6E5D]">{t('musicSub')}</p>
        </div>
      </div>

      {/* Currently playing banner if active */}
      {activeTrack && (
        <div className="bg-[#5B825B] text-white p-4 rounded-3xl shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-spin-slow">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider block text-[#EAF1E8]">
                {isHindi ? 'अभी बज रहा है' : 'Now Playing'}
              </span>
              <h4 className="font-extrabold text-base">
                {tracks.find((t) => t.id === activeTrack)?.title}
              </h4>
            </div>
          </div>
          <button
            onClick={() => {
              soundController.stopAmbient();
              setActiveTrack(null);
            }}
            className="p-2.5 rounded-2xl bg-white text-[#5B825B] font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-[#EAF1E8]"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>{t('stopMusic')}</span>
          </button>
        </div>
      )}

      {/* Track list */}
      <div className="space-y-3">
        {tracks.map((track) => {
          const isPlaying = activeTrack === track.id;
          return (
            <div
              key={track.id}
              onClick={() => toggleTrack(track.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                isPlaying
                  ? 'bg-white border-[#5B825B] shadow-md scale-[1.01]'
                  : 'bg-white border-[#E0DCD3] hover:border-[#87A987] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#2D3A2F] shadow-xs"
                  style={{ backgroundColor: track.color }}
                >
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-[#5B825B] uppercase tracking-wider block">
                    {track.mood}
                  </span>
                  <h4 className="font-extrabold text-lg text-[#2D3A2F] leading-tight">{track.title}</h4>
                  <p className="text-xs text-[#5A6E5D] mt-0.5">{track.subtitle}</p>
                </div>
              </div>

              <button
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
                  isPlaying
                    ? 'bg-[#C46A66] text-white'
                    : 'bg-[#5B825B] text-white hover:bg-[#4d704d]'
                }`}
                aria-label={isPlaying ? t('stopMusic') : t('playMusic')}
              >
                {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
