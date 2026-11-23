import React from "react";
import { Composition } from "remotion";
import reelContent from "../content/reel.json";
import { MotionGraphicsReel } from "./MotionGraphics";
import type { HistoryReelProps } from "./Video";

const FPS = 30;
const DURATION_SECONDS = 70;

const defaultProps: HistoryReelProps = reelContent;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MotionGraphicsReel"
    component={MotionGraphicsReel}
    durationInFrames={DURATION_SECONDS * FPS}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultProps}
  />
);
