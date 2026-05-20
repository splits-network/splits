import { SceneSequence } from "../shared/SceneSequence";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Stat } from "./scenes/Scene2Stat";
import { Scene3Form } from "./scenes/Scene3Form";
import { Scene4Pivot } from "./scenes/Scene4Pivot";
import { Scene5Solution } from "./scenes/Scene5Solution";
import { Scene6CTA } from "./scenes/Scene6CTA";

export const Day3CandidateAbandonment: React.FC = () => (
  <SceneSequence
    scenes={[Scene1Hook, Scene2Stat, Scene3Form, Scene4Pivot, Scene5Solution, Scene6CTA]}
  />
);
