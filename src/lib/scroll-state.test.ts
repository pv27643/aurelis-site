import { describe, expect, it } from "vitest";

import { getSceneState } from "./scroll-state";

describe("getSceneState", () => {
  it("clamps progress and starts on the diagonal cap close-up", () => {
    expect(getSceneState(-1)).toEqual(getSceneState(0));
    expect(getSceneState(2)).toEqual(getSceneState(1));
    expect(getSceneState(0).camera[2]).toBeLessThan(getSceneState(0.2).camera[2]);
  });

  it("rotates before opening the modular bottle", () => {
    const rotation = getSceneState(0.4);
    const opening = getSceneState(0.65);

    expect(rotation.bottleRotationY).toBeGreaterThan(2);
    expect(rotation.shellSpread).toBe(0);
    expect(opening.shellSpread).toBe(1);
    expect(opening.capLift).toBe(1);
    expect(opening.shardSpread).toBe(1);
  });

  it("reveals the colonnade, then deterministically reassembles", () => {
    const passage = getSceneState(0.85);
    const finale = getSceneState(1);

    expect(passage.colonnadeReveal).toBe(1);
    expect(finale.shellSpread).toBe(0);
    expect(finale.capLift).toBe(0);
    expect(finale.shardSpread).toBe(0);
    expect(finale.packageReveal).toBe(1);
  });
});
