import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

const SoundContext = createContext();

export function useSound() {
    return useContext(SoundContext);
}

export function SoundProvider({ children }) {
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('intruso_muted') === 'true';
    });
    const [volume, setVolume] = useState(0.5);

    // Audio Context for procedural sounds
    const audioCtxRef = useRef(null);

    useEffect(() => {
        Howler.mute(isMuted);
        Howler.volume(volume);
        localStorage.setItem('intruso_muted', isMuted);
    }, [isMuted, volume]);

    // Initialize AudioContext on user interaction
    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    // Procedural Sound Generators (Synth-style)

    const playTone = (freq, type = 'sine', duration = 0.1, vol = 0.1) => {
        if (isMuted || !audioCtxRef.current) return;

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const playClick = () => {
        initAudio();
        // High pitch "tech" blip
        playTone(800, 'sine', 0.05, 0.1); // Main click
        setTimeout(() => playTone(1200, 'triangle', 0.03, 0.05), 10); // Texture
    };

    const playHover = () => {
        initAudio();
        // Very subtle high freq tick
        playTone(2000, 'sine', 0.01, 0.02);
    };

    const playSuccess = () => {
        initAudio();
        // Ascending major arp
        const now = audioCtxRef.current?.currentTime || 0;
        [440, 554, 659, 880].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 'sine', 0.3, 0.2), i * 80);
        });
    };

    const playError = () => {
        initAudio();
        // Dissonant buzz
        playTone(150, 'sawtooth', 0.2, 0.2);
        playTone(145, 'sawtooth', 0.2, 0.2);
    };

    const playBuzzer = () => {
        initAudio();
        // Alarm style
        playTone(880, 'square', 0.1, 0.3);
        setTimeout(() => playTone(880, 'square', 0.1, 0.3), 150);
    };

    const playReveal = () => {
        initAudio();
        // Low impact boom
        const ctx = audioCtxRef.current;
        if (!ctx || isMuted) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1);

        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1);
    };

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <SoundContext.Provider value={{
            isMuted,
            toggleMute,
            playClick,
            playHover,
            playSuccess,
            playError,
            playBuzzer,
            playReveal
        }}>
            {children}
        </SoundContext.Provider>
    );
}
