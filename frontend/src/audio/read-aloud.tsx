// Read Aloud — warm OpenAI TTS (voice "coral") played with expo-audio.
// One module-level player is shared app-wide; the provider exposes speak/stop
// and which key is currently speaking/loading so buttons can reflect state.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

const API = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

let player: AudioPlayer | null = null;
function getPlayer(): AudioPlayer {
  if (!player) player = createAudioPlayer();
  return player;
}

type ReadAloudValue = {
  speak: (text: string, key?: string) => Promise<void>;
  stop: () => void;
  activeKey: string | null;
  loadingKey: string | null;
};

const ReadAloudContext = createContext<ReadAloudValue | null>(null);

export function ReadAloudProvider({ children }: PropsWithChildren) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const subRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    return () => {
      try {
        subRef.current?.remove();
        getPlayer().remove();
      } catch {
        // ignore
      }
      player = null;
    };
  }, []);

  const stop = useCallback(() => {
    try {
      getPlayer().pause();
    } catch {
      // ignore
    }
    setActiveKey(null);
    setLoadingKey(null);
  }, []);

  const speak = useCallback(async (text: string, key = "default") => {
    try {
      setLoadingKey(key);
      const res = await fetch(`${API}/tts/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "coral" }),
      });
      if (!res.ok) throw new Error("tts failed");
      const data = (await res.json()) as { url: string };
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}${data.url}`;

      const p = getPlayer();
      subRef.current?.remove();
      p.replace({ uri: url });
      const sub = p.addListener("playbackStatusUpdate", (status: any) => {
        if (status?.playing) {
          setActiveKey(key);
          setLoadingKey(null);
        }
        if (status?.didJustFinish) {
          setActiveKey(null);
        }
      });
      subRef.current = sub;
      p.play();
    } catch {
      setLoadingKey(null);
      setActiveKey(null);
    }
  }, []);

  return (
    <ReadAloudContext.Provider value={{ speak, stop, activeKey, loadingKey }}>
      {children}
    </ReadAloudContext.Provider>
  );
}

export function useReadAloud() {
  const ctx = useContext(ReadAloudContext);
  if (!ctx) throw new Error("useReadAloud must be used within ReadAloudProvider");
  return ctx;
}
