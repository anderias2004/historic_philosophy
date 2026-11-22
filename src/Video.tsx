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

export type ReelScene = {
  text: string;
  start: number;
  end: number;
  /** Optional image path inside public/, e.g. "images/rubicon.jpg". */
  imageFile?: string;
};

export type HistoryReelProps = {
  title: string;
  hook: string;
  handle: string;
  scenes: ReelScene[];
  /** Audio file stored in public/, for example "voiceover.mp3". */
  voiceoverFile?: string;
};

export const HistoryReel: React.FC<HistoryReelProps> = ({
  title,
  hook,
  handle,
  scenes,
  voiceoverFile,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const seconds = frame / fps;
  const activeScene = scenes.find(
    (scene) => seconds >= scene.start && seconds < scene.end,
  );

  const intro = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 26], [65, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneDuration = activeScene
    ? (activeScene.end - activeScene.start) * fps
    : 1;
  const sceneFadeFrames = Math.min(12, Math.floor(sceneDuration / 4));
  const sceneProgress = activeScene
    ? interpolate(
        frame - activeScene.start * fps,
        [0, sceneDuration],
        [1, 1.12],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;
  const sceneOpacity = activeScene
    ? interpolate(
        frame - activeScene.start * fps,
        [0, sceneFadeFrames, sceneDuration - sceneFadeFrames, sceneDuration],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;
  const outro = interpolate(
    frame,
    [durationInFrames - 24, durationInFrames - 1],
    [1, 0.35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const progress = frame / Math.max(1, durationInFrames - 1);

  return (
    <AbsoluteFill
      style={{
        direction: "rtl",
        color: "#F7F1E5",
        backgroundColor: "#090A0D",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {voiceoverFile ? <Audio src={staticFile(voiceoverFile)} /> : null}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(142,105,42,.32) 0%, rgba(36,29,22,.18) 34%, rgba(9,10,13,1) 76%)",
        }}
      />
      {activeScene?.imageFile ? (
        <>
          <AbsoluteFill style={{ opacity: sceneOpacity }}>
            <Img
              src={staticFile(activeScene.imageFile)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${sceneProgress})`,
              }}
            />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(5,6,8,.48), rgba(5,6,8,.76))",
            }}
          />
        </>
      ) : null}
      <AbsoluteFill
        style={{
          opacity: 0.13,
          backgroundImage:
            "linear-gradient(rgba(210,176,105,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(210,176,105,.12) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 88,
          left: 72,
          right: 72,
          display: "flex",
          justifyContent: "space-between",
          color: "#C6A15A",
          fontSize: 25,
          letterSpacing: 2,
          opacity: intro,
        }}
      >
        <span>HISTORY • PHILOSOPHY</span>
        <span>تاریخ | اندیشه</span>
      </div>

      {frame < fps * 7 ? (
        <div
          style={{
            position: "absolute",
            top: 470,
            left: 90,
            right: 90,
            textAlign: "center",
            opacity: intro,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div style={{ color: "#C6A15A", fontSize: 34, marginBottom: 34 }}>
            روایت‌هایی که تاریخ را تغییر دادند
          </div>
          <div
            style={{
              fontSize: 100,
              lineHeight: 1.35,
              fontWeight: 800,
              textShadow: "0 8px 35px rgba(0,0,0,.6)",
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: 150,
              height: 7,
              margin: "42px auto",
              background: "#C6A15A",
              borderRadius: 10,
            }}
          />
          <div
            style={{
              color: "#E8D7B5",
              fontSize: 47,
              lineHeight: 1.7,
            }}
          >
            {hook}
          </div>
        </div>
      ) : frame < durationInFrames - fps * 5 ? (
        <div
          style={{
            position: "absolute",
            top: 500,
            left: 105,
            right: 105,
            minHeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            opacity: sceneOpacity,
          }}
        >
          <div
            style={{
              fontSize: 57,
              lineHeight: 1.9,
              fontWeight: 650,
              color: "#F3EBDD",
              textShadow: "0 5px 24px rgba(0,0,0,.75)",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {activeScene?.text ?? ""}
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            top: 690,
            left: 90,
            right: 90,
            textAlign: "center",
            color: "#E8D7B5",
            fontSize: 55,
            lineHeight: 1.8,
            opacity: outro,
          }}
        >
          تاریخ را عمیق‌تر بشناس
          <div style={{ color: "#C6A15A", fontSize: 38, marginTop: 30 }}>
            ما را دنبال کن
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 145,
          left: 76,
          right: 76,
          display: "flex",
          justifyContent: "space-between",
          color: "#C6A15A",
          fontSize: 29,
          opacity: outro,
        }}
      >
        <span>{handle}</span>
        <span>روایت تاریخ و فلسفه</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 82,
          left: 76,
          right: 76,
          height: 5,
          background: "rgba(255,255,255,.16)",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: "#C6A15A",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
