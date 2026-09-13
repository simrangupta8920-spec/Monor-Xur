import React, { useState } from 'react';
import { 
  Lightbulb, Volume2, Check, ChevronDown, ChevronUp, Sparkles, 
  Hand, Eye, Heart, Puzzle, Brain, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { soundController } from '../../utils/audio';

interface EasyModeGuideProps {
  game: 'puzzle' | 'memory' | 'hub';
  isEasyMode?: boolean;
  onDismiss?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const EasyModeGuide: React.FC<EasyModeGuideProps> = ({
  game,
  isEasyMode = true,
  className = '',
  defaultExpanded = true,
}) => {
  const { language, tx } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [hasListened, setHasListened] = useState<boolean>(false);

  // If not on easy mode and not hub, do not show easy guidance
  if (!isEasyMode && game !== 'hub') {
    return null;
  }

  // Audio narrations tailored to the specific game and active language
  const speakGuide = () => {
    soundController.playClick();
    setHasListened(true);

    if (game === 'puzzle') {
      const enText =
        'Welcome to Easy Mode! Here is how to play: Step 1, tap any puzzle piece in the tray below to pick it up. Step 2, tap an empty slot on the board to place it. Step 3, tap Peek Photo or Ghost Guide if you want to see the full picture underneath. Take all the time you need!';
      const hiText =
        'सरल मोड में आपका स्वागत है! खेलने का तरीका: पहला चरण, नीचे ट्रे में से किसी टुकड़े पर टैप करें। दूसरा चरण, बोर्ड पर खाली जगह पर टैप करके उसे रखें। तीसरा चरण, पूरी तस्वीर देखने के लिए तस्वीर देखें या घोस्ट गाइड बटन दबाएं। आराम से खेलें!';
      const asText =
        'সহজ মোডলৈ স্বাগতম! কেনেকৈ খেলিব: প্ৰথম পদক্ষেপ, ট্ৰে’ৰ পৰা যিকোনো এটা টুকুৰাত টিপি বাছক। দ্বিতীয় পদক্ষেপ, ব’ৰ্ডৰ খালী স্থানত টিপি টুকুৰাটো বহুৱাওক। তৃতীয় পদক্ষেপ, সম্পূৰ্ণ ছবিখন চাবলৈ ছবি চাওক বা ঘোষ্ট গাইড বুটাম টিপক। কোনো খৰখেদা নকৰাকৈ ধীৰে-সুস্থে খেলক!';

      soundController.speakBilingual(enText, hiText, undefined, asText);
    } else if (game === 'memory') {
      const enText =
        'Welcome to Easy Mode! Here is how to play: Step 1, tap any card to flip it over and reveal the picture. Step 2, tap a second card to find its matching twin. Step 3, matching pairs will stay open. If you need help, tap the Hint lightbulb anytime to peek at the cards!';
      const hiText =
        'सरल मोड में आपका स्वागत है! खेलने का तरीका: पहला चरण, किसी भी कार्ड पर टैप करके तस्वीर देखें। दूसरा चरण, दूसरा कार्ड टैप करके उसकी जोड़ी ढूंढें। तीसरा चरण, मिलने वाले जोड़े खुले रहेंगे। मदद के लिए हिंट का बल्ब दबाएं!';
      const asText =
        'সহজ মোডলৈ স্বাগতম! কেনেকৈ খেলিব: প্ৰথম পদক্ষেপ, ছবি চাবলৈ যিকোনো এখন কাৰ্ডত টিপক। দ্বিতীয় পদক্ষেপ, একে জোৰা বিচাৰিবলৈ আন এখন কাৰ্ডত টিপক। তৃতীয় পদক্ষেপ, মিল খোৱা জোৰাবোৰ খুলি থাকিব। সহায়ৰ বাবে ইংগিত বাল্বত টিপক!';

      soundController.speakBilingual(enText, hiText, undefined, asText);
    } else {
      const enText =
        'Easy Mode is active for all games. In Easy Mode, you get step-by-step guidance, larger pieces and fewer cards, gentle voice instructions, and unlimited time to play peacefully.';
      const hiText =
        'सभी खेलों में सरल मोड सक्रिय है। सरल मोड में आपको आसान मार्गदर्शन, बड़े टुकड़े, आवाज़ में निर्देश और आराम से खेलने का असीमित समय मिलता है।';
      const asText =
        'সকলো খেলতে সহজ মোড উপলব্ধ। সহজ মোডত আপুনি স্পষ্ট নিৰ্দেশনা, ডাঙৰ টুকুৰা, মাতৰ সহায় আৰু শান্তভাৱে খেলিবলৈ সীমাহীন সময় পাব।';

      soundController.speakBilingual(enText, hiText, undefined, asText);
    }
  };

  return (
    <div
      id={`easy-mode-guide-${game}`}
      className={`rounded-3xl border-2 transition-all duration-300 shadow-xs overflow-hidden ${
        game === 'puzzle'
          ? 'bg-gradient-to-br from-[#FFFDF7] via-[#FFF9EE] to-[#FFF3DC] border-[#E8B25C]/60'
          : game === 'memory'
          ? 'bg-gradient-to-br from-[#F8FAF7] via-[#F1F7EE] to-[#EAF3E7] border-[#5B825B]/50'
          : 'bg-gradient-to-br from-[#FDFCF9] via-[#F7F4EC] to-[#F1ECE0] border-[#E8B25C]/50'
      } ${className}`}
    >
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
              game === 'puzzle' ? 'bg-[#E8B25C]' : game === 'memory' ? 'bg-[#5B825B]' : 'bg-[#D97706]'
            }`}
          >
            <Lightbulb className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/80 text-[#8C4E0B] border border-[#E8B25C]/40">
                {tx('Easy Mode • Guided Play', 'सरल मोड • आसान मार्गदर्शन', 'সহজ মোড • নিৰ্দেশিত খেল')}
              </span>
              <span className="text-xs font-bold text-[#5A6E5D] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
                {tx('Step-by-step guidance', 'कदम-दर-कदम मार्गदर्शन', 'পদক্ষেপে পদক্ষেপে পথ-প্ৰদৰ্শন')}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#2D3A2F] mt-0.5">
              {game === 'puzzle'
                ? tx('How to Play: Photo Jigsaw', 'तस्वीर पहेली कैसे खेलें', 'ছবিৰ ধাঁধা কেনেকৈ খেলিব')
                : game === 'memory'
                ? tx('How to Play: Memory Pairs', 'जोड़े कैसे मिलाएं', 'জোৰা কেনেকৈ মিলাব')
                : tx('How to Play in Easy Mode', 'सरल मोड में खेलें', 'সহজ মোডত কেনেকৈ খেলিব')}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Audio Speak Button */}
          <button
            onClick={speakGuide}
            className={`px-3 py-2 rounded-2xl border font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
              hasListened
                ? 'bg-white border-[#5B825B]/40 text-[#5B825B]'
                : 'bg-white border-[#E8B25C] text-[#8C4E0B] hover:bg-[#FFF9EE]'
            }`}
            title="Listen to how to play"
            aria-label="Listen to instructions"
          >
            <Volume2 className="w-4 h-4 text-[#E8B25C]" />
            <span className="hidden sm:inline">
              {tx('Listen', 'सुनें', 'শুনক')}
            </span>
          </button>

          {/* Expand/Collapse toggle */}
          <button
            onClick={() => {
              soundController.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 rounded-2xl bg-white/80 border border-[#E0DCD3] text-[#5A6E5D] hover:text-[#2D3A2F] hover:bg-white active:scale-95 transition-all cursor-pointer"
            aria-label={isExpanded ? 'Collapse guide' : 'Expand guide'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Step-by-Step Guidance Content */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3.5 pt-0 border-t border-black/5 animate-fadeIn">
          {/* Subtitle assurance for seniors */}
          <p className="text-xs sm:text-sm text-[#4F5E52] leading-relaxed pt-2">
            {game === 'puzzle'
              ? tx(
                  'There are just 4 large pieces in Easy Mode! Follow these simple steps at your own gentle pace:',
                  'सरल मोड में केवल 4 बड़े टुकड़े हैं! अपनी गति से इन सरल चरणों का पालन करें:',
                  'সহজ মোডত মাত্ৰ ৪টা ডাঙৰ টুকুৰা আছে! নিজৰ গতিত এই ৩টা সহজ নিয়ম অনুসৰণ কৰক:'
                )
              : game === 'memory'
              ? tx(
                  'There are only 3 matching pairs in Easy Mode! Turn the cards gently to find identical pictures:',
                  'सरल मोड में केवल 3 जोड़े हैं! मिलते-जुलते चित्र ढूंढने के लिए कार्ड पलटें:',
                  'সহজ মোডত মাত্ৰ ৩টা জোৰা আছে! একে ছবি বিচাৰিবলৈ লাহে লাহে কাৰ্ড লুটিয়াই চাওক:'
                )
              : tx(
                  'Easy Mode is tailored for comfort: larger pieces, clear voice cues, and free hints whenever needed.',
                  'सरल मोड विशेष रूप से सुविधा के लिए है: बड़े टुकड़े, आवाज़ में मार्गदर्शन और आवश्यकता पड़ने पर निःशुल्क संकेत।',
                  'সহজ মোড সম্পূৰ্ণ আৰামদায়ক: ডাঙৰ টুকুৰা, মাতৰ সহায় আৰু প্ৰয়োজন অনুসৰি বিনামূলীয়া ইংগিত।'
                )}
          </p>

          {/* 3 Step Visual Cards */}
          {game === 'puzzle' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Step 1 */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E8B25C]/40 shadow-2xs space-y-1.5 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E8B25C] text-[#332610] font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="font-extrabold text-xs text-[#2D3A2F] uppercase tracking-wide">
                    {tx('Pick a Piece', 'टुकड़ा चुनें', 'টুকুৰা বাছক')}
                  </span>
                </div>
                <p className="text-xs text-[#5A6E5D] leading-relaxed">
                  {tx(
                    'Tap any puzzle piece in the Tray below. A green border will highlight your selection.',
                    'नीचे ट्रे में से किसी टुकड़े पर टैप करें। वह हरे रंग में हाइलाइट हो जाएगा।',
                    'তলৰ ট্ৰে’ৰ পৰা যিকোনো এটা টুকুৰাত টিপক। সেউজীয়া ৰঙেৰে বাছনি স্পষ্ট হ’ব।'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#8C4E0B] pt-0.5">
                  <Hand className="w-3.5 h-3.5" />
                  <span>{tx('Tap to select', 'टैप करके चुनें', 'টিপি বাছক')}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E8B25C]/40 shadow-2xs space-y-1.5 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5B825B] text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="font-extrabold text-xs text-[#2D3A2F] uppercase tracking-wide">
                    {tx('Place on Board', 'बोर्ड पर रखें', 'ব’ৰ্ডত বহুৱাওক')}
                  </span>
                </div>
                <p className="text-xs text-[#5A6E5D] leading-relaxed">
                  {tx(
                    'Tap the matching empty slot on the board. The piece will gently snap right into place.',
                    'बोर्ड पर खाली जगह पर टैप करें। टुकड़ा सीधे अपनी जगह पर बैठ जाएगा।',
                    'ব’ৰ্ডৰ খালী স্থানত টিপক। টুকুৰাটো নিমিষতে নিজৰ ঠাইত বহি যাব।'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#5B825B] pt-0.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{tx('Snaps into place', 'अपनी जगह पर सेट', 'ঠাইত বহিব')}</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E8B25C]/40 shadow-2xs space-y-1.5 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0284C7] text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="font-extrabold text-xs text-[#2D3A2F] uppercase tracking-wide">
                    {tx('Peek & Hints', 'तस्वीर देखें', 'ছবিৰ ইংগিত')}
                  </span>
                </div>
                <p className="text-xs text-[#5A6E5D] leading-relaxed">
                  {tx(
                    'Tap "Peek Photo" to view the full photo, or "Ghost Guide" for a soft outline underneath.',
                    '"तस्वीर देखें" दबाकर पूरी तस्वीर देखें, या बोर्ड पर हल्की रूपरेखा देखने के लिए घोस्ट गाइड लें।',
                    'সম্পূৰ্ণ ছবি চাবলৈ "ছবি চাওক" বা তলত পাতল ছাঁ চাবলৈ "ঘোষ্ট গাইড" টিপক।'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#0284C7] pt-0.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{tx('Always available', 'हमेशा उपलब्ध', 'সদায় উপলব্ধ')}</span>
                </div>
              </div>
            </div>
          )}

          {game === 'memory' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Step 1 */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#5B825B]/40 shadow-2xs space-y-1.5 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5B825B] text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="font-extrabold text-xs text-[#2D3A2F] uppercase tracking-wide">
                    {tx('Flip First Card', 'पहला कार्ड पलटें', 'প্ৰথম কাৰ্ড লুটিয়াক')}
                  </span>
                </div>
                <p className="text-xs text-[#5A6E5D] leading-relaxed">
                  {tx(
                    'Tap any card on the table to turn it over and reveal its cheerful symbol (e.g. Flower or Sun).',
                    'किसी भी कार्ड पर टैप करके उसे पलटें और उसका चित्र देखें (जैसे फूल या सूरज)।',
                    'মেজৰ যিকোনো এখন কাৰ্ডত টিপি লুটিয়াই তাৰ প্ৰতীক চাওক (যেনে ফুল বা সূৰ্য)।'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#5B825B] pt-0.5">
                  <Hand className="w-3.5 h-3.5" />
                  <span>🌸 {tx('Reveals picture', 'तस्वीर दिखेगी', 'ছবি ওলাব')}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#5B825B]/40 shadow-2xs space-y-1.5 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E8B25C] text-[#332610] font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="font-extrabold text-xs text-[#2D3A2F] uppercase tracking-wide">
                    {tx('Find Matching Pair', 'जोड़ी खोजें', 'জোৰা বিচাৰক')}
                  </span>
                </div>
                <p className="text-xs text-[#5A6E5D] leading-relaxed">
                  {tx(
                    'Tap another card to see if it matches. If they are identical twins, you found a pair!',
                    'दूसरा कार्ड पलटें। अगर दोनों एक जैसे हैं, तो बधाई—आपने एक जोड़ी ढूंढ ली!',
                    'দ্বিতীয় এখন কাৰ্ড লুটিয়াক। যদি দুয়োখন একে হয়, তেন্তে আপুনি এটা জোৰা পালে!'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#8C4E0B] pt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ {tx('Match together', 'एक जैसे चित्र', 'একে ছবি')}</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#5B825B]/40 shadow-2xs space-y-1.5 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#BE123C] text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="font-extrabold text-xs text-[#2D3A2F] uppercase tracking-wide">
                    {tx('Free Hints Anytime', 'मुफ़्त संकेत', 'বিনামূলীয়া ইংগিত')}
                  </span>
                </div>
                <p className="text-xs text-[#5A6E5D] leading-relaxed">
                  {tx(
                    'Matched cards stay open. If you want a helper peek, tap the Hint lightbulb button anytime!',
                    'मिले हुए कार्ड खुले रहेंगे। अगर सहायता चाहिए, तो हिंट बल्ब दबाकर सभी कार्ड देख सकते हैं!',
                    'মিলা কাৰ্ডবোৰ খুলি থাকিব। সহায় লাগে যদি যিকোনো সময়ত ইংগিত বুটাম টিপি চাব পাৰে!'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#BE123C] pt-0.5">
                  <Heart className="w-3.5 h-3.5" />
                  <span>💡 {tx('Gentle and relaxing', 'शांत और सुकून भरा', 'শান্ত আৰু আৰামদায়ক')}</span>
                </div>
              </div>
            </div>
          )}

          {game === 'hub' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo Puzzle Quick Guide Card */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E8B25C]/40 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF0D5] text-[#8C4E0B] flex items-center justify-center font-black">
                    <Puzzle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2D3A2F]">
                      {tx('Photo Puzzle (Easy: 4 Pieces)', 'फ़ोटो पहेली (सरल: 4 टुकड़े)', 'ছবিৰ ধাঁধা (সহজ: ৪টা টুকুৰা)')}
                    </h4>
                    <span className="text-[11px] text-[#5A6E5D]">
                      {tx('Put Alphonso mangoes or family moments together', 'आम या पारिवारिक तस्वीरें जोड़ें', 'আম বা পৰিয়ালৰ ছবি জোৰা লগাওক')}
                    </span>
                  </div>
                </div>
                <ul className="text-xs text-[#445846] space-y-1 pl-1 list-disc list-inside">
                  <li>{tx('Tap a piece in the tray to select it', 'ट्रे से टुकड़ा चुनकर टैप करें', 'ট্ৰে’ৰ পৰা টুকুৰা বাছক')}</li>
                  <li>{tx('Tap an empty slot on the board to place it', 'बोर्ड पर खाली जगह पर रखें', 'ব’ৰ্ডৰ খালী স্থানত ৰাখক')}</li>
                  <li>{tx('Peek at the original photo anytime if needed', 'पूरी तस्वीर कभी भी देखें', 'যিকোনো সময়ত সম্পূৰ্ণ ছবিখন চাওক')}</li>
                </ul>
              </div>

              {/* Memory Match Quick Guide Card */}
              <div className="bg-white/90 rounded-2xl p-3.5 border border-[#5B825B]/40 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center font-black">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2D3A2F]">
                      {tx('Memory Match (Easy: 3 Pairs)', 'जोड़े मिलाना (सरल: 3 जोड़े)', 'জোৰা মিলোৱা (সহজ: ৩টা জোৰা)')}
                    </h4>
                    <span className="text-[11px] text-[#5A6E5D]">
                      {tx('Find friendly pictures of flowers, birds and sunshine', 'फूल, सूरज और चिड़ियों के जोड़े ढूंढें', 'ফুল, সূৰ্য আৰু চৰাইৰ জোৰা বিচাৰক')}
                    </span>
                  </div>
                </div>
                <ul className="text-xs text-[#445846] space-y-1 pl-1 list-disc list-inside">
                  <li>{tx('Tap any card to turn it over', 'किसी भी कार्ड को पलटें', 'যিকোনো কাৰ্ডত টিপি লুটিয়াক')}</li>
                  <li>{tx('Tap a second card to find its match', 'दूसरा कार्ड पलटकर जोड़ी बनाएं', 'দ্বিতীয় কাৰ্ডখনৰে জোৰা মিলাওক')}</li>
                  <li>{tx('Free hints available whenever you want a peek', 'निःशुल्क संकेत हमेशा उपलब्ध', 'বিনামূলীয়া ইংগিত সদায় উপলব্ধ')}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Bottom dismissal / collapse bar */}
          <div className="flex items-center justify-between pt-2 border-t border-black/5 flex-wrap gap-2">
            <span className="text-xs font-bold text-[#5B825B] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-[#5B825B]" />
              {tx('No timers, no penalties • Play peacefully', 'कोई समय सीमा नहीं • शांति से खेलें', 'কোনো সময়ৰ বাধা নাই • শান্তভাৱে খেলক')}
            </span>

            <button
              onClick={() => {
                soundController.playSuccess();
                setIsExpanded(false);
              }}
              className="px-4 py-1.5 rounded-xl bg-white border border-[#E0DCD3] hover:bg-[#F8F6F0] text-xs font-black text-[#2D3A2F] flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#5B825B] stroke-[3]" />
              <span>{tx('Got it, let’s play!', 'समझ गया, खेलते हैं!', 'বুজি পালোঁ, খেলোঁ আহক!')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
