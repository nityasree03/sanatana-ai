import { MOUNTAIN_UMBRELLA } from "./stories/krishna";
import type { Activity, AgeRange, Scene, Story } from "./types";

export const STORIES: Story[] = [MOUNTAIN_UMBRELLA];

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

/** One page of the storybook: a scene, an activity, or the ending. */
export type Step =
  { kind: "scene"; scene: Scene } | { kind: "activity"; activity: Activity } | { kind: "end" };

/** The pages for one age range: scenes in order, each followed by its activities. */
export function storySteps(story: Story, age: AgeRange, withActivities = true): Step[] {
  const steps: Step[] = [];
  for (const scene of story.scenes) {
    steps.push({ kind: "scene", scene });
    if (withActivities)
      for (const activity of story.activities)
        if (activity.after === scene.id && activity.ages.includes(age))
          steps.push({ kind: "activity", activity });
  }
  steps.push({ kind: "end" });
  return steps;
}

/**
 * A fixed, non-random mix-up of `n` items, so the order puzzle never starts solved and looks
 * the same on the server and in the browser.
 */
export function mixedOrder(n: number): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  // Reverse, then swap the middle pair: never the identity for n >= 2.
  out.reverse();
  if (n >= 4) [out[1], out[2]] = [out[2], out[1]];
  return out;
}
