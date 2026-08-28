/**
 * The room the product stands in.
 *
 * Not scenery for its own sake. A fixture photographed against nothing is a
 * catalogue cut-out, and a buyer cannot tell a 600mm pan from a 700mm one
 * against a void. Put it in a corner with a skirting line, a tiled floor and
 * daylight from one side and the size reads immediately, because every one
 * of those things is a known dimension the eye measures against.
 *
 * Built from geometry and two small procedural textures rather than
 * downloaded maps — the audience is on mobile data, and a pair of tile
 * textures generated in a canvas costs nothing to transfer.
 */

import { useMemo } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

/* rectAreaLight renders as nothing at all until these uniforms are loaded —
   no warning, no error, just an unlit scene. Done once at module load. */
RectAreaLightUniformsLib.init();

/**
 * A tile sheet drawn once into a canvas.
 *
 * The grout is drawn slightly darker at the join and the tile face carries a
 * faint noise wash, because a perfectly flat tile reads as plastic. Cheap:
 * one 256px canvas, then repeated by the sampler.
 */
function useTileTexture(
  size: number,
  tileColor: string,
  groutColor: string,
  repeat: number,
) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;

    g.fillStyle = groutColor;
    g.fillRect(0, 0, size, size);

    // One tile per sheet, inset by the grout width.
    const grout = Math.max(2, size * 0.018);
    g.fillStyle = tileColor;
    g.fillRect(grout, grout, size - grout * 2, size - grout * 2);

    // A very light mottle so the surface is not mathematically flat.
    const img = g.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 9;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [size, tileColor, groutColor, repeat]);
}

export function Bathroom() {
  // Large-format floor tile; smaller, lighter tile on the walls.
  const floorTex = useTileTexture(256, "#3a3a38", "#2a2a29", 7);
  const wallTex = useTileTexture(256, "#4a4845", "#3d3b39", 9);

  const FLOOR = -1.0;
  /* The pan is back-to-wall, so the wall sits just behind the cistern —
     which is exactly how it would be installed, and it is what gives the
     unit somewhere to be rather than something to float in front of. */
  const BACK_Z = -0.56;
  const WALL_H = 5.2;

  return (
    <group>
      {/* ── Floor ─────────────────────────────────────────────────────────
          Still reflective, because a bathroom floor is tiled and usually
          damp, and the reflection is what puts the product IN the room
          rather than on top of a picture of one. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <MeshReflectorMaterial
          map={floorTex}
          blur={[300, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={9}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          roughness={0.75}
          metalness={0.25}
          color="#33322f"
          mirror={0}
        />
      </mesh>

      {/* ── Back wall ─────────────────────────────────────────────────── */}
      <mesh position={[0, FLOOR + WALL_H / 2, BACK_Z]} receiveShadow>
        <planeGeometry args={[22, WALL_H]} />
        <meshStandardMaterial map={wallTex} color="#5f5a53" roughness={0.82} />
      </mesh>

      {/* Skirting. A small thing, but it is the line that tells you where
          the floor ends, and without it the wall and floor read as one fold
          of paper. */}
      <mesh position={[0, FLOOR + 0.05, BACK_Z + 0.03]} receiveShadow>
        <boxGeometry args={[22, 0.1, 0.06]} />
        <meshStandardMaterial color="#2b2926" roughness={0.95} />
      </mesh>

      {/* ── Side return ───────────────────────────────────────────────────
          One wall running toward the camera on the far side. A corner reads
          as a room; a single flat wall reads as a backdrop. */}
      <mesh
        position={[4.6, FLOOR + WALL_H / 2, BACK_Z + 5]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, WALL_H]} />
        <meshStandardMaterial map={wallTex} color="#544f49" roughness={0.86} />
      </mesh>

      {/* ── Window ────────────────────────────────────────────────────────
          Off to the left and out of shot. Only its light and the shape it
          throws are in frame — which is how a real interior photograph is
          lit, and cheaper than modelling glass nobody sees. */}
      <rectAreaLight
        position={[-4.2, FLOOR + 2.4, 1.4]}
        rotation={[0, Math.PI / 2.6, 0]}
        width={3.4}
        height={2.6}
        intensity={16}
        color="#dce8f2"
      />

      {/* A soft warm bounce off the unseen wall opposite, so the shadow side
          of the ceramic does not go flat grey. */}
      <rectAreaLight
        position={[3.6, FLOOR + 1.8, 2.6]}
        rotation={[0, -Math.PI / 2.4, 0]}
        width={3}
        height={2.4}
        intensity={5}
        color="#f3e6d4"
      />

      {/* ── A wall niche ──────────────────────────────────────────────────
          The one piece of set dressing, and it earns its place: a lit recess
          gives the back wall a depth cue and a second scale reference. */}
      <group position={[-1.55, FLOOR + 1.5, BACK_Z + 0.02]}>
        <mesh>
          <boxGeometry args={[0.62, 0.86, 0.1]} />
          <meshStandardMaterial color="#3f3c39" roughness={0.9} />
        </mesh>
        <pointLight position={[0, 0.3, 0.3]} intensity={1.6} distance={2.2} color="#ffd9a8" />
        <mesh position={[0, -0.06, 0.06]}>
          <boxGeometry args={[0.5, 0.02, 0.06]} />
          <meshStandardMaterial color="#8a8580" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
