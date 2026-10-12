"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { getSceneState, type Vector3Tuple } from "@/lib/scroll-state";

type MuseSceneProps = {
  progress: RefObject<{ value: number }>;
};

const shardOrigins: Vector3Tuple[] = [
  [-0.82, 0.9, 0.22],
  [0.9, 0.55, 0.15],
  [-0.7, -0.25, 0.35],
  [0.78, -0.55, 0.3],
  [0.18, 1.35, 0.38],
];

const shardDirections: Vector3Tuple[] = [
  [-0.8, 0.35, 0.35],
  [0.9, 0.2, 0.2],
  [-0.75, -0.15, 0.45],
  [0.8, -0.25, 0.4],
  [0.18, 0.85, 0.25],
];

function DiagonalCap() {
  const geometry = useMemo(() => {
    const cap = new THREE.BoxGeometry(1.08, 1.05, 0.88, 3, 3, 3);
    const positions = cap.getAttribute("position");

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      if (y > 0.45) positions.setY(index, y + x * 0.38);
    }

    positions.needsUpdate = true;
    cap.computeVertexNormals();
    return cap;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#b9b9bd" metalness={0.88} roughness={0.24} />
    </mesh>
  );
}

function Colonnade() {
  return (
    <group>
      {[-3.6, -2.2, 2.2, 3.6].map((x, index) => (
        <group key={x} position={[x, -0.15, -2.8 - (index % 2) * 1.8]}>
          <mesh>
            <cylinderGeometry args={[0.34, 0.42, 4.8, 12]} />
            <meshStandardMaterial color="#151517" roughness={0.92} />
          </mesh>
          <mesh position={[0, 2.48, 0]}>
            <boxGeometry args={[1.05, 0.18, 1.05]} />
            <meshStandardMaterial color="#202023" roughness={0.86} />
          </mesh>
          <mesh position={[0, -2.48, 0]}>
            <boxGeometry args={[0.92, 0.18, 0.92]} />
            <meshStandardMaterial color="#202023" roughness={0.86} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -2]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#101011" roughness={0.96} />
      </mesh>
    </group>
  );
}

export function MuseScene({ progress }: MuseSceneProps) {
  const root = useRef<THREE.Group>(null);
  const cap = useRef<THREE.Group>(null);
  const frontShell = useRef<THREE.Group>(null);
  const rearShell = useRef<THREE.Group>(null);
  const shards = useRef<Array<THREE.Mesh | null>>([]);
  const colonnade = useRef<THREE.Group>(null);
  const packaging = useRef<THREE.Group>(null);

  useFrame(({ camera, size }) => {
    const scene = getSceneState(progress.current.value);
    const mobile = size.width < 700;

    camera.position.set(
      scene.camera[0],
      scene.camera[1],
      scene.camera[2] * (mobile ? 1.22 : 1),
    );
    camera.lookAt(...scene.target);

    if (root.current) {
      root.current.position.x = scene.bottleX * (mobile ? 0.72 : 1);
      root.current.rotation.y = scene.bottleRotationY;
      root.current.scale.setScalar(mobile ? 0.72 : 1);
    }

    if (cap.current) {
      cap.current.position.y = 2.1 + scene.capLift * 1.25;
      cap.current.rotation.z = -scene.capLift * 0.16;
    }

    if (frontShell.current) {
      frontShell.current.position.set(
        -scene.shellSpread * 0.92,
        0,
        0.38 + scene.shellSpread * 0.18,
      );
      frontShell.current.rotation.y = -scene.shellSpread * 0.18;
    }

    if (rearShell.current) {
      rearShell.current.position.set(
        scene.shellSpread * 0.92,
        0,
        -0.38 - scene.shellSpread * 0.18,
      );
      rearShell.current.rotation.y = scene.shellSpread * 0.18;
    }

    shards.current.forEach((shard, index) => {
      if (!shard) return;
      const origin = shardOrigins[index];
      const direction = shardDirections[index];
      shard.position.set(
        origin[0] + direction[0] * scene.shardSpread,
        origin[1] + direction[1] * scene.shardSpread,
        origin[2] + direction[2] * scene.shardSpread,
      );
      shard.rotation.y = index * 0.7 + scene.shardSpread * (index - 2) * 0.18;
    });

    if (colonnade.current) {
      const reveal = Math.max(0.001, scene.colonnadeReveal);
      colonnade.current.scale.set(reveal, reveal, reveal);
      colonnade.current.position.y = -2.8 + scene.colonnadeReveal * 2.8;
    }

    if (packaging.current) {
      const reveal = Math.max(0.001, scene.packageReveal);
      packaging.current.scale.setScalar(reveal * (mobile ? 0.72 : 1));
      packaging.current.position.y = -0.3 + (1 - scene.packageReveal) * 1.4;
    }
  });

  return (
    <>
      <color attach="background" args={["#0b0b0b"]} />
      <ambientLight intensity={0.25} />
      <spotLight
        color="#eae6e1"
        intensity={72}
        angle={0.38}
        penumbra={0.8}
        position={[-4, 6, 5]}
      />
      <spotLight
        color="#8f929b"
        intensity={48}
        angle={0.44}
        penumbra={0.9}
        position={[5, 1, 3]}
      />
      <rectAreaLight color="#c9c9cd" intensity={4} width={3} height={5} position={[0, -1, 4]} />

      <group ref={colonnade}>
        <Colonnade />
      </group>

      <group ref={root} name="MUSE_ROOT">
        <group name="BOTTLE_CORE">
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.62, 0.82, 3.05, 32]} />
            <meshPhysicalMaterial
              color="#1a1a1e"
              metalness={0.1}
              roughness={0.16}
              transmission={0.32}
              thickness={1.4}
              transparent
              opacity={0.94}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]} scale={[0.62, 1.45, 0.62]}>
            <sphereGeometry args={[0.78, 32, 32]} />
            <meshPhysicalMaterial color="#242429" metalness={0.22} roughness={0.32} />
          </mesh>
          <mesh position={[0, -1.73, 0]}>
            <cylinderGeometry args={[0.74, 0.74, 0.18, 32]} />
            <meshStandardMaterial color="#aeb0b5" metalness={0.86} roughness={0.28} />
          </mesh>
        </group>

        <group ref={frontShell} name="FRONT_SHELL" position={[0, 0, 0.38]}>
          <RoundedBox args={[2.08, 2.65, 0.28]} radius={0.32} smoothness={5} position={[0, -0.2, 0]}>
            <meshPhysicalMaterial
              color="#17171a"
              metalness={0.24}
              roughness={0.22}
              transmission={0.18}
              thickness={0.9}
              transparent
              opacity={0.9}
            />
          </RoundedBox>
          <mesh position={[0, 1.05, 0]} scale={[1.3, 0.48, 0.35]}>
            <sphereGeometry args={[0.82, 32, 20]} />
            <meshStandardMaterial color="#242429" metalness={0.32} roughness={0.38} />
          </mesh>
        </group>

        <group ref={rearShell} name="REAR_SHELL" position={[0, 0, -0.38]}>
          <RoundedBox args={[1.92, 2.55, 0.26]} radius={0.3} smoothness={5} position={[0, -0.22, 0]}>
            <meshStandardMaterial color="#101012" metalness={0.18} roughness={0.42} />
          </RoundedBox>
        </group>

        <group ref={cap} name="CAP_DIAGONAL" position={[0, 2.1, 0]}>
          <mesh position={[0, -0.63, 0]}>
            <cylinderGeometry args={[0.3, 0.42, 0.38, 24]} />
            <meshStandardMaterial color="#222226" metalness={0.48} roughness={0.28} />
          </mesh>
          <DiagonalCap />
        </group>

        {shardOrigins.map((origin, index) => (
          <mesh
            key={index}
            name={`ACCENT_SHARD_0${index + 1}`}
            position={origin}
            rotation={[index * 0.3, index * 0.7, index * 0.22]}
            ref={(node) => {
              shards.current[index] = node;
            }}
          >
            <tetrahedronGeometry args={[0.19 + index * 0.018, 0]} />
            <meshStandardMaterial color="#bfc0c5" metalness={0.9} roughness={0.24} />
          </mesh>
        ))}
      </group>

      <group ref={packaging} position={[1.45, 1.1, -0.2]}>
        <RoundedBox args={[1.38, 3.05, 0.74]} radius={0.05} smoothness={2}>
          <meshStandardMaterial color="#252529" metalness={0.08} roughness={0.76} />
        </RoundedBox>
        <mesh position={[0, 0.45, 0.39]}>
          <boxGeometry args={[0.86, 0.015, 0.018]} />
          <meshStandardMaterial color="#c9c9cd" metalness={0.86} roughness={0.2} />
        </mesh>
      </group>
    </>
  );
}
