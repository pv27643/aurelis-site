# AURELIS — The Muse

Interactive portfolio prototype for the fictional sculptural fragrance **The Muse, Graphite Edition**. The current bottle is a procedural 3D blockout, not the final production design.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then scroll through the full page. Reverse the scroll to verify that every transform returns cleanly.

## Quality checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Architecture

- `src/components/AurelisExperience.tsx` owns the five scroll chapters and the single GSAP ScrollTrigger progress value.
- `src/lib/scroll-state.ts` deterministically maps progress from 0–1 to every scene transform.
- `src/components/MuseScene.tsx` renders the bottle, fragments, colonnade, packaging and lighting in React Three Fiber.
- CSS handles layout, responsive typography and the reduced-motion presentation.

## Replacing the blockout

Export the approved GLB with these stable nodes:

- `MUSE_ROOT`
- `CAP_DIAGONAL`
- `FRONT_SHELL`
- `REAR_SHELL`
- `BOTTLE_CORE`
- `ACCENT_SHARD_01` through `ACCENT_SHARD_05`

Load it with Drei's `useGLTF`, assign the existing refs to those nodes, and retain `getSceneState` as the animation contract. Keep mesh pivots fixed in the exported file so reverse scrolling remains deterministic.
