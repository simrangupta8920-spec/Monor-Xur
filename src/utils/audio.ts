// Web Speech & Web Audio helpers for Monor Xur
import { getAssameseTranslation } from '../i18n/assameseDictionary';

class SoundController {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  public isAmbientPlaying = false;
  public isSundowningActive = false;

  setSundowningMode(active: boolean) {
    this.isSundowningActive = active;
  }

  getSundowningMode(): boolean {
    return this.isSundowningActive;
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play gentle bell chime for breathing or matches (softened during evening sundowning)
  playChime(freq = 528, duration = 1.2) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // In sundowning mode: reduce volume by 50% and soften higher frequencies to prevent agitation
      const volumeMultiplier = this.isSundowningActive ? 0.45 : 1.0;
      const targetFreq = this.isSundowningActive ? Math.min(freq, 480) : freq;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(targetFreq * 0.98, this.ctx.currentTime + duration);

      const targetGain = 0.2 * volumeMultiplier;
      gain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might fail on restricted browser autoplay
    }
  }

  // Subtle tap sound (softened to gentle sine tick in sundowning mode)
  playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.isSundowningActive) {
        // Soft warm tick with sine wave
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
        return;
      }

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore
    }
  }

  // Celebration fanfare (gentle and unhurried during sundowning hours)
  playSuccess() {
    if (this.isSundowningActive) {
      // Warm, slower 3-tone peaceful chime
      [392, 440, 523.25].forEach((freq, i) => {
        setTimeout(() => {
          this.playChime(freq, 1.2);
        }, i * 220);
      });
      return;
    }

    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      setTimeout(() => {
        this.playChime(freq, 0.8);
      }, i * 140);
    });
  }

  // Serene ambient drone for Relaxation Music & Sundowning Raga
  startAmbient(soundType: 'nature' | 'harp' | 'flute' | 'singing_bowl' | 'raga_yaman' = 'nature') {
    try {
      this.stopAmbient();
      this.initCtx();
      if (!this.ctx) return;

      this.ambientGain = this.ctx.createGain();
      // Gentle volume, slightly softer in sundowning mode
      const masterGain = this.isSundowningActive ? 0.055 : 0.08;
      this.ambientGain.gain.setValueAtTime(masterGain, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      const baseFreqs = soundType === 'raga_yaman'
        ? [146.83, 220, 277.18, 329.63, 440] // Evening Raga Yaman (Tanpura D, A, C#, E drone)
        : soundType === 'singing_bowl' 
        ? [432, 216, 648] 
        : soundType === 'harp' 
        ? [330, 392, 494, 587] 
        : soundType === 'flute' 
        ? [440, 523.25, 659.25] 
        : [220, 277.18, 329.63, 440];

      this.ambientOscs = baseFreqs.map((f, index) => {
        const osc = this.ctx!.createOscillator();
        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
        osc.connect(this.ambientGain!);
        osc.start();
        return osc;
      });

      this.isAmbientPlaying = true;
    } catch {
      // Ignore
    }
  }

  stopAmbient() {
    try {
      if (this.ambientOscs.length > 0) {
        this.ambientOscs.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        this.ambientOscs = [];
      }
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
      this.isAmbientPlaying = false;
    } catch {
      // Ignore
    }
  }

  public currentLanguage: 'en' | 'hi' | 'as' = 'en';

  setLanguage(lang: 'en' | 'hi' | 'as') {
    this.currentLanguage = lang;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('monor_xur_language', lang);
        document.documentElement.lang = lang;
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  getLanguage(): 'en' | 'hi' | 'as' {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('monor_xur_language');
      if (stored === 'en' || stored === 'hi' || stored === 'as') {
        this.currentLanguage = stored;
      }
    }
    return this.currentLanguage;
  }

  // Helper to translate common English voice prompts to Hindi or Assamese when active
  private translateSpokenPrompt(text: string): string {
    if (this.currentLanguage === 'as') {
      const phrasesAs: Record<string, string> = {
        'No personal photos uploaded yet. You can play Default Mode with Mango and other treasures!':
          'এতিয়ালৈকে কোনো ব্যক্তিগত ছবি আপল’ড কৰা হোৱা নাই। আপুনি আম আৰু অন্যান্য ঐতিহ্যৰ সৈতে ডিফল্ট ম’ড খেলিব পাৰে!',
        'Wonderful job! You solved the puzzle.':
          'বৰ সুন্দৰ কাম! আপুনি সাঁথৰটো সম্পূৰ্ণ কৰিলে।',
        'Congratulations! You matched all pairs beautifully.':
          'অভিনন্দন! আপুনি সকলো জোৰা অতি ধুনীয়াকৈ মিলাই দিলে।',
        'Spoken voice reflection.':
          'মাতৰ স্মৃতি।',
      };
      if (phrasesAs[text]) return phrasesAs[text];

      const helloMatch = text.match(/^Hello\s+(.+?)\.\s+Read aloud is working warmly and clearly\.$/i);
      if (helloMatch) {
        return `নমস্কাৰ ${helloMatch[1]}। কথা কোৱা মাত স্পষ্টভাৱে চলি আছে।`;
      }

      const welcomeMatch = text.match(/^Welcome to Monor Xur,\s*(.+?)!$/i);
      if (welcomeMatch) {
        return `মনৰ সুৰলৈ আপোনাক স্বাগতম, ${welcomeMatch[1]}!`;
      }

      return getAssameseTranslation(text);
    }

    if (this.currentLanguage !== 'hi') return text;

    // Direct phrase translations
    const phrases: Record<string, string> = {
      'No personal photos uploaded yet. You can play Default Mode with Mango and other treasures!':
        'अभी तक कोई व्यक्तिगत फ़ोटो अपलोड नहीं की गई है। आप आम और अन्य धरोहरों के साथ डिफ़ॉल्ट मोड खेल सकते हैं!',
      'Wonderful job! You solved the puzzle.':
        'बहुत खूब! आपने पहेली पूरी कर ली।',
      'Congratulations! You matched all pairs beautifully.':
        'बधाई हो! आपने सभी जोड़े बहुत सुंदर ढंग से मिला लिए।',
      'Spoken voice reflection.':
        'आवाज़ की याद।',
    };

    if (phrases[text]) return phrases[text];

    // Dynamic patterns
    // e.g. "Hello Player. Read aloud is working warmly and clearly."
    const helloMatch = text.match(/^Hello\s+(.+?)\.\s+Read aloud is working warmly and clearly\.$/i);
    if (helloMatch) {
      return `नमस्ते ${helloMatch[1]}। बोलने वाली आवाज़ साफ़ और स्पष्ट काम कर रही है।`;
    }

    // e.g. "Welcome to Monor Xur, Player!"
    const welcomeMatch = text.match(/^Welcome to Monor Xur,\s*(.+?)!$/i);
    if (welcomeMatch) {
      return `मनोर सुर में आपका स्वागत है, ${welcomeMatch[1]}!`;
    }

    // If text already has Devanagari or is custom, return as is
    return text;
  }

  // Native Speech Synthesis for Read-Aloud with English, Hindi & Assamese Support
  speak(text: string, onEnd?: () => void, langOverride?: 'en' | 'hi' | 'as') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const targetLang = langOverride || this.getLanguage();
    const processedText = targetLang === 'en' ? text : this.translateSpokenPrompt(text);

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.rate = 0.88; // Gentle, slower rate for elderly comprehension
    utterance.pitch = 1.0;
    
    // Pick warm natural sounding voice matching the target language
    const voices = window.speechSynthesis.getVoices();
    if (targetLang === 'as') {
      utterance.lang = 'as-IN';
      const asVoice = voices.find(v => 
        v.lang === 'as-IN' || 
        v.lang.startsWith('as') || 
        v.name.toLowerCase().includes('assamese') || 
        v.name.includes('অসমীয়া') ||
        v.lang === 'bn-IN' || 
        v.lang.startsWith('bn')
      );
      if (asVoice) {
        utterance.voice = asVoice;
      }
    } else if (targetLang === 'hi') {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find(v => 
        v.lang === 'hi-IN' || 
        v.lang.startsWith('hi') || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.includes('हिन्दी')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      utterance.lang = 'en-US';
      const friendlyVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny'))
      );
      if (friendlyVoice) {
        utterance.voice = friendlyVoice;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  speakBilingual(textEn: string, textHi: string, onEnd?: () => void, textAs?: string) {
    const lang = this.getLanguage();
    if (lang === 'as') {
      this.speak(textAs || getAssameseTranslation(textEn, textHi), onEnd, 'as');
    } else if (lang === 'hi') {
      this.speak(textHi, onEnd, 'hi');
    } else {
      this.speak(textEn, onEnd, 'en');
    }
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }
}

export const soundController = new SoundController();
