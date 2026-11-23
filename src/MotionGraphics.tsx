import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { HistoryReelProps } from "./Video";

const GOLD = "#D2A84B";
const CREAM = "#F5F0E6";
const MUTED = "#A9A39A";

export const MotionGraphicsReel: React.FC<HistoryReelProps> = ({
  title,
  hook,
  handle,
  scenes,
  voiceoverFile,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const activeIndex = scenes.findIndex((s) => seconds >= s.start && seconds < s.end);
  const active = activeIndex >= 0 ? scenes[activeIndex] : undefined;
  const localFrame = active ? Math.max(0, frame - active.start * fps) : 0;
  const sceneFrames = active ? Math.max(1, (active.end - active.start) * fps) : 1;
  const enter = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const drift = interpolate(localFrame, [0, sceneFrames], [34, -24], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const reveal = interpolate(localFrame, [0, 14], [0, 1], {
    easing: Easing.out(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const progress = frame / Math.max(1, durationInFrames - 1);
  const outro = interpolate(frame, [durationInFrames - 30, durationInFrames - 1], [1, 0.4], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const isIntro = seconds < 7;
  const isOutro = seconds >= 65;
  const sceneNumber = String(Math.max(1, activeIndex + 1)).padStart(2, "0");

  return (
    <AbsoluteFill style={{ backgroundColor: "#080A0E", color: CREAM, fontFamily: "Tahoma, Arial, sans-serif", direction: "rtl", overflow: "hidden" }}>
      {voiceoverFile ? <Audio src={staticFile(voiceoverFile)} /> : null}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 38%, rgba(210,168,75,.17), transparent 42%), linear-gradient(145deg,#11151D 0%,#080A0E 62%,#17130D 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.12, backgroundImage: "linear-gradient(rgba(210,168,75,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(210,168,75,.22) 1px,transparent 1px)", backgroundSize: "84px 84px", transform: `translateY(${(frame % 84) * 0.35}px)` }} />
      <div style={{ position: "absolute", top: 82, left: 72, right: 72, display: "flex", justifyContent: "space-between", alignItems: "center", color: GOLD, fontSize: 25, letterSpacing: 2, opacity: enter }}>
        <span>HISTORIC PHILOSOPHY</span><span style={{ color: MUTED, letterSpacing: 0 }}>تاریخ | اندیشه</span>
      </div>
      <div style={{ position: "absolute", width: 520, height: 520, border: "1px solid rgba(210,168,75,.24)", borderRadius: "50%", top: 360, left: -240, transform: `rotate(${frame * 0.12}deg) scale(${1 + Math.sin(frame / 24) * 0.025})` }} />
      <div style={{ position: "absolute", width: 320, height: 320, border: "1px solid rgba(245,240,230,.12)", borderRadius: "50%", top: 455, left: -140, transform: `rotate(-${frame * 0.2}deg)` }} />
      <div style={{ position: "absolute", top: 270, right: 78, width: 12, height: 720, background: "linear-gradient(180deg,transparent,rgba(210,168,75,.8),transparent)", opacity: 0.7 }} />

      {isIntro ? (
        <div style={{ position: "absolute", top: 475, left: 105, right: 105, textAlign: "right", opacity: enter, transform: `translateY(${interpolate(frame,[0,26],[55,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}px)` }}>
          <div style={{ color: GOLD, fontSize: 30, marginBottom: 34 }}>روایت‌هایی که تاریخ را تغییر دادند</div>
          <div style={{ fontSize: 98, fontWeight: 900, lineHeight: 1.35, textShadow: "0 12px 40px rgba(0,0,0,.5)" }}>{title}</div>
          <div style={{ width: 180, height: 8, background: GOLD, margin: "38px 0 34px auto", borderRadius: 10 }} />
          <div style={{ fontSize: 48, lineHeight: 1.75, color: "#E9D8B5" }}>{hook}</div>
          <div style={{ marginTop: 52, color: MUTED, fontSize: 23, letterSpacing: 3 }}>A STORY • AN IDEA • A TURNING POINT</div>
        </div>
      ) : isOutro ? (
        <div style={{ position: "absolute", top: 650, left: 90, right: 90, textAlign: "center", opacity: outro }}>
          <div style={{ color: GOLD, fontSize: 30, letterSpacing: 4 }}>HISTORIC PHILOSOPHY</div>
          <div style={{ fontSize: 66, fontWeight: 800, marginTop: 40, lineHeight: 1.6 }}>تاریخ را عمیق‌تر بشناس</div>
          <div style={{ color: GOLD, fontSize: 42, marginTop: 28 }}>ما را دنبال کن</div>
          <div style={{ color: MUTED, fontSize: 30, marginTop: 32 }}>{handle}</div>
        </div>
      ) : (
        <>
          {active?.imageFile ? (
            <AbsoluteFill style={{ opacity: 0.28 }}>
              <Img src={staticFile(active.imageFile)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.12)" }} />
              <AbsoluteFill style={{ background: "linear-gradient(90deg,rgba(8,10,14,.96),rgba(8,10,14,.58))" }} />
            </AbsoluteFill>
          ) : null}
          <div style={{ position: "absolute", top: 300, left: 82, right: 82, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: reveal }}>
            <span style={{ color: GOLD, fontSize: 30, letterSpacing: 4 }}>CHAPTER {sceneNumber}</span>
            <span style={{ color: MUTED, fontSize: 24 }}>روایت تصویری</span>
          </div>
          <div style={{ position: "absolute", top: 480, left: 100, right: 115, minHeight: 680, display: "flex", alignItems: "center", opacity: reveal, transform: `translateY(${drift}px)` }}>
            <div style={{ width: "100%" }}>
              <div style={{ width: 100, height: 7, background: GOLD, marginBottom: 42, borderRadius: 8 }} />
              <div style={{ fontSize: 58, lineHeight: 1.95, fontWeight: 750, textShadow: "0 8px 28px rgba(0,0,0,.65)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{active?.text ?? ""}</div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 280, left: 90, right: 90, display: "flex", alignItems: "center", gap: 18, opacity: reveal }}>
            <div style={{ flex: 1, height: 2, background: "rgba(245,240,230,.22)" }} />
            <div style={{ width: 18, height: 18, borderRadius: 20, background: GOLD, boxShadow: "0 0 28px rgba(210,168,75,.65)" }} />
            <div style={{ color: GOLD, fontSize: 25 }}>{sceneNumber} / {String(scenes.length).padStart(2,"0")}</div>
          </div>
        </>
      )}

      <div style={{ position: "absolute", bottom: 145, left: 76, right: 76, display: "flex", justifyContent: "space-between", color: GOLD, fontSize: 27, opacity: outro }}>
        <span>{handle}</span><span>روایت تاریخ و فلسفه</span>
      </div>
      <div style={{ position: "absolute", bottom: 82, left: 76, right: 76, height: 5, background: "rgba(255,255,255,.16)", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: GOLD }} />
      </div>
    </AbsoluteFill>
  );
};
