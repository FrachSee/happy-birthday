"""Synthesize a gentle, royalty-free, seamlessly-looping celebratory BGM.

Music-box / celesta style arpeggios over a soft pad, in C major with an
uplifting I-V-vi-IV progression. Output: mono 44.1kHz WAV -> converted to mp3.
"""
import numpy as np

SR = 44100

def note(freq, dur, sr=SR):
    """A warm music-box-ish tone: sine + soft harmonics with a plucky envelope."""
    n = int(dur * sr)
    t = np.linspace(0, dur, n, endpoint=False)
    wave = (
        1.00 * np.sin(2 * np.pi * freq * t)
        + 0.35 * np.sin(2 * np.pi * 2 * freq * t)
        + 0.12 * np.sin(2 * np.pi * 3 * freq * t)
    )
    # Plucky exponential-decay envelope with a tiny attack.
    attack = int(0.005 * sr)
    env = np.exp(-t * 3.2)
    if attack > 0:
        env[:attack] *= np.linspace(0, 1, attack)
    return wave * env


def pad(freqs, dur, sr=SR):
    """A soft sustained chord pad (triangle-ish) under the melody."""
    n = int(dur * sr)
    t = np.linspace(0, dur, n, endpoint=False)
    out = np.zeros(n)
    for f in freqs:
        out += np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t)
    out /= len(freqs)
    # Slow swell in/out per chord.
    env = np.sin(np.linspace(0, np.pi, n)) ** 0.5
    return out * env


# Note frequencies (Hz)
F = {
    "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00,
    "A4": 440.00, "B4": 493.88, "C5": 523.25, "D5": 587.33, "E5": 659.25,
    "G5": 783.99, "A5": 880.00, "C3": 130.81, "E3": 164.81, "G3": 196.00,
    "F3": 174.61, "A3": 220.00, "D3": 146.83,
}

# I - V - vi - IV in C: C major, G major, A minor, F major
progression = [
    (["C3", "E3", "G3", "C4"], ["C5", "E5", "G5", "E5", "C5", "G4", "E5", "G5"]),
    (["G3", "B4", "D4", "G4"], ["B4", "D5", "G5", "D5", "B4", "G4", "D5", "G5"]),
    (["A3", "C4", "E4", "A4"], ["A4", "C5", "E5", "C5", "A4", "E5", "C5", "E5"]),
    (["F3", "A3", "C4", "F4"], ["A4", "C5", "F5" if False else "A5", "C5", "A4", "F4", "C5", "A4"]),
]

BEAT = 0.30  # seconds per arpeggio note
BAR = BEAT * 8

melody = []
pads = []
for chord, arp in progression:
    pads.append(pad([F[x] for x in chord], BAR) * 0.22)
    bar = np.zeros(int(BAR * SR))
    for i, nm in enumerate(arp):
        seg = note(F[nm], BEAT * 1.6) * 0.5  # let notes ring past their slot
        start = int(i * BEAT * SR)
        end = min(start + len(seg), len(bar))
        bar[start:end] += seg[: end - start]
    melody.append(bar)

mel = np.concatenate(melody)
pd = np.concatenate(pads)
L = min(len(mel), len(pd))
mix = mel[:L] + pd[:L]

# Simple feedback-delay "reverb" for warmth/space.
delay = int(0.13 * SR)
rev = np.copy(mix)
buf = np.zeros(len(mix) + delay * 6)
buf[: len(mix)] += mix
for k in range(1, 6):
    g = 0.35 ** k
    buf[delay * k : delay * k + len(mix)] += mix * g
rev = buf[: len(mix)]
mix = 0.75 * mix + 0.25 * rev

# Seamless loop hygiene: tiny fade-in at head; tail already decays to ~0.
fi = int(0.02 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
fo = int(0.02 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)

# Normalize.
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9

# Write 16-bit PCM WAV.
import wave
pcm = (mix * 32767).astype(np.int16)
with wave.open("music/bgm.wav", "w") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())

print("wrote music/bgm.wav", round(len(mix) / SR, 2), "seconds")
