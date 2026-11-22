import React from "react";
import { Composition } from "remotion";
import reelContent from "../content/reel.json";
import { HistoryReel, type HistoryReelProps } from "./Video";

const FPS = 30;
const DURATION_SECONDS = 70;

const defaultProps: HistoryReelProps = reelContent;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HistoryReel"
    component={HistoryReel}
    durationInFrames={DURATION_SECONDS * FPS}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultProps}
  />
);
