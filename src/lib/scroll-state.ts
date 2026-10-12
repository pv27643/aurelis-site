export type Vector3Tuple = [number, number, number];

export type SceneState = {
  camera: Vector3Tuple;
  target: Vector3Tuple;
  bottleX: number;
  bottleRotationY: number;
  capLift: number;
  shellSpread: number;
  shardSpread: number;
  colonnadeReveal: number;
  packageReveal: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const segment = (progress: number, start: number, end: number) =>
  clamp01((progress - start) / (end - start));

const mixVector = (
  from: Vector3Tuple,
  to: Vector3Tuple,
  progress: number,
): Vector3Tuple => [
  lerp(from[0], to[0], progress),
  lerp(from[1], to[1], progress),
  lerp(from[2], to[2], progress),
];

/** Maps one normalized scroll value to every animated property in the film. */
export function getSceneState(rawProgress: number): SceneState {
  const progress = clamp01(rawProgress);
  const reveal = segment(progress, 0, 0.2);
  const rotation = segment(progress, 0.2, 0.4);
  const opening = segment(progress, 0.4, 0.65);
  const passage = segment(progress, 0.65, 0.85);
  const finale = segment(progress, 0.85, 1);

  const cameraReveal = mixVector([0, 1.55, 3.7], [0, 0.25, 7.2], reveal);
  const cameraPassage = mixVector(cameraReveal, [0, 0.15, 2.7], passage);
  const cameraFinale = mixVector(cameraPassage, [0, 0.1, 8.2], finale);

  return {
    camera: cameraFinale,
    target: mixVector([0, 1.15, 0], [0, 0.15, 0], reveal),
    bottleX: lerp(0, -1.25, finale),
    bottleRotationY: lerp(0, Math.PI * 0.78, rotation),
    capLift: opening * (1 - finale),
    shellSpread: opening * (1 - finale),
    shardSpread: opening * (1 - finale),
    colonnadeReveal: passage,
    packageReveal: finale,
  };
}
