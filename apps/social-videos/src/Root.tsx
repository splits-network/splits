import { Composition } from "remotion";
import { Day1CandidateGhosting } from "./day1-candidate-ghosting/Composition";
import { Day1RecruiterGhosting } from "./day1-recruiter-ghosting/Composition";
import { Day1CompanyGhosting } from "./day1-company-ghosting/Composition";
import { Day2CandidateGhostJobs } from "./day2-candidate-ghost-jobs/Composition";
import { Day2RecruiterGhostJobs } from "./day2-recruiter-ghost-jobs/Composition";
import { Day2CompanyGhostJobs } from "./day2-company-ghost-jobs/Composition";

const DURATION = 1260;
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Day 1 — Ghosting */}
      <Composition id="Day1CandidateGhosting" component={Day1CandidateGhosting} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Day1RecruiterGhosting" component={Day1RecruiterGhosting} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Day1CompanyGhosting" component={Day1CompanyGhosting} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />

      {/* Day 2 — Ghost Jobs */}
      <Composition id="Day2CandidateGhostJobs" component={Day2CandidateGhostJobs} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Day2RecruiterGhostJobs" component={Day2RecruiterGhostJobs} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Day2CompanyGhostJobs" component={Day2CompanyGhostJobs} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
