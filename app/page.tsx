"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";

type Track = {
  file: string;
  url: string;
  title: string;
  artist: string;
  duration: number;
  cover: string | null;
};

export default function Player() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (sec: number) => {
    if (!sec || sec === Infinity) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ✔︎ Helper to load metadata only when needed
  async function loadTrack(file: string, parseBlob: any): Promise<Track> {
    const url = "/music/" + file;
    const blob = await fetch(url).then((r) => r.blob());

    let metadata: any = null;
    try {
      metadata = await parseBlob(blob);
    } catch {
      metadata = null;
    }

    let cover: string | null = null;
    if (metadata?.common?.picture?.length) {
      const pic = metadata.common.picture[0];
      const uint8 = new Uint8Array(pic.data);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(
          null,
          Array.from(uint8.subarray(i, i + chunkSize))
        );
      }
      cover = `data:${pic.format};base64,${btoa(binary)}`;
    }

    return {
      file,
      url,
      title: metadata?.common?.title || file.replace(".mp3", ""),
      artist: metadata?.common?.artist || "Unknown Artist",
      duration: metadata?.format?.duration || 0,
      cover,
    };
  }

  // -----------------------------------------
  // LOAD TRACKS (PRELOAD FIRST 3, REST LATER)
  // -----------------------------------------
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/tracks");
      const files: string[] = await res.json();

      const mod = await import("music-metadata-browser");
      const parseBlob = mod.parseBlob;

      // 🚀 PRELOAD FIRST 3 TRACKS
      const toPreload = files.slice(0, 3);
      const firstTracks = await Promise.all(
        toPreload.map((f) => loadTrack(f, parseBlob))
      );

      // Shuffle these first 3 to simulate radio
      const shuffled = firstTracks.sort(() => Math.random() - 0.5);

      setTracks(shuffled);
      setCurrent(shuffled[0]);

      // 🎧 BACKGROUND LOADING OF REMAINING TRACKS
      const remaining = files.slice(3);
      setTimeout(async () => {
        for (const file of remaining) {
          const track = await loadTrack(file, parseBlob);

          // Append without disrupting playback
          setTracks((prev) => [...prev, track]);
        }
      }, 50);
    };

    load();
  }, []);

  const playNext = () => {
    if (!current || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.file === current.file);
    const next = tracks[(idx + 1) % tracks.length];
    setProgress(0);
    setCurrent(next);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => setProgress(audio.currentTime);
    audio.addEventListener("timeupdate", update);
    return () => audio.removeEventListener("timeupdate", update);
  }, [current]);

  if (!current) return <LoadingScreen />;

  return (
    <div
      className="h-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${current.cover || "/placeholder.png"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-2xl bg-white/60" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.img
          key={current.file}
          src={current.cover || "/placeholder.png"}
          className="w-64 h-64 rounded-2xl shadow-2xl object-cover"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        <div className="text-center mt-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {current.title}
          </h1>
          <p className="text-md text-gray-600 mt-1">{current.artist}</p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition mt-6"
          onClick={playNext}
        >
          ⏭
        </button>

        <audio
          key={current.url}
          ref={audioRef}
          src={current.url}
          autoPlay
          onEnded={playNext}
        />
      </div>
    </div>
  );
}
