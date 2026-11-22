import React from "react";
import { Composition } from "remotion";
import { HistoryReel, type HistoryReelProps } from "./Video";

const defaultProps: HistoryReelProps = {
  title: "ژولیوس سزار",
  hook: "مردی که جمهوری روم را به زانو درآورد",
  handle: "@historic_philosophy",
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HistoryReel"
      component={HistoryReel}
      durationInFrames={30 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
