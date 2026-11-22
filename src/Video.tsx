import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type HistoryReelProps = {
  title: string;
  hook: string;
  handle: string;
};

export const HistoryReel: React.FC<HistoryReelProps> = ({
  title,
  hook,
  handle,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const intro = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 26], [70, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outro = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 1],
    [1, 0.35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(142,105,42,.34) 0%, rgba(36,29,22,.22) 28%, rgba(9,10,13,1) 72%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(210,176,105,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(210,176,105,.12) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, black, transparent 82%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 92,
          left: 76,
          right: 76,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#C6A15A",
          fontSize: 27,
          letterSpacing: 3,
          opacity: intro,
        }}
      >
        <span>HISTORY  •  PHILOSOPHY</span>
        <span>تاریخ | اندیشه</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 410,
          left: 90,
          right: 90,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(198,161,90,.9), transparent)",
          opacity: intro,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 90,
          right: 90,
          textAlign: "center",
          opacity: intro,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            color: "#C6A15A",
            fontSize: 34,
            fontWeight: 700,
            marginBottom: 38,
          }}
        >
          روایت‌هایی که تاریخ را تغییر دادند
        </div>
        <div
          style={{
            fontSize: 104,
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
            margin: "44px auto",
            background: "#C6A15A",
            borderRadius: 10,
          }}
        />
        <div
          style={{
            color: "#E8D7B5",
            fontSize: 48,
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          {hook}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: 76,
          right: 76,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#C6A15A",
          fontSize: 30,
          opacity: outro,
        }}
      >
        <span>{handle}</span>
        <span>برای شناخت گذشته</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 86,
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
            width: `${(frame / (durationInFrames - 1)) * 100}%`,
            height: "100%",
            background: "#C6A15A",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
