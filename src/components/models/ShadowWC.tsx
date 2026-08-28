/**
 * Close-coupled WC — procedural reconstruction.
 *
 * Built with the img2threejs protocol from `ref/toilet.jpg`; the observation
 * record is in `.img2threejs/image-analysis.md`.
 *
 * Four features decide whether this reads as the product rather than a
 * generic toilet, and the geometry exists to get them right:
 *
 *   1. The bowl is CONCAVE — it sweeps inward from the rim to its narrowest
 *      just above the floor. This is the silhouette. A straight taper, which
 *      is all a lerp can draw, reads as a bin.
 *   2. It stands on a small plinth, not a full-width skirt.
 *   3. The cistern is tall and narrow, with its lower front raked back.
 *   4. The seat and cover are thick, soft-cornered, and overhang the rim.
 *
 * APPROXIMATE where the reference could not see: the rear face, underside,
 * waste outlet and bowl interior are category convention, not evidence.
 *
 * Normalised so the unit stands ~1.7 tall with its base at y = -1.0, which
 * is where the Stage puts its contact shadow.
 */

import { useMemo } from "react";
import * as THREE from "three";

/** A rounded rectangle in the XZ plane, ready to extrude. */
function roundedRect(width: number, depth: number, radius: number): THREE.Shape {
  const w = width / 2;
  const d = depth / 2;
  const r = Math.min(radius, w, d);
  const s = new THREE.Shape();
  s.moveTo(-w + r, -d);
  s.lineTo(w - r, -d);
  s.quadraticCurveTo(w, -d, w, -d + r);
  s.lineTo(w, d - r);
  s.quadraticCurveTo(w, d, w - r, d);
  s.lineTo(-w + r, d);
  s.quadraticCurveTo(-w, d, -w, d - r);
  s.lineTo(-w, -d + r);
  s.quadraticCurveTo(-w, -d, -w + r, -d);
  return s;
}

/**
 * Catmull-Rom through the control points, sampled at t ∈ [0,1].
 *
 * Smoothstep per segment was the first attempt and it banded: it is smooth
 * *within* a segment but its slope jumps at every control point, and a
 * surface swept along a curve with a discontinuous derivative creases at
 * exactly those heights. On glazed white, where the whole read is a
 * continuous specular gradient, those creases showed as hard horizontal
 * rings down the bowl. Catmull-Rom is C¹ across the joins, so the sweep has
 * no seams to catch the light.
 */
function curve(points: [number, number][]) {
  const pts = points.slice().sort((a, b) => a[0] - b[0]);
  return (t: number) => {
    const x = Math.min(Math.max(t, 0), 1);
    let i = 0;
    while (i < pts.length - 2 && x > pts[i + 1][0]) i++;

    // Duplicate the ends so the first and last spans keep their tangents.
    const p0 = pts[Math.max(i - 1, 0)][1];
    const p1 = pts[i][1];
    const p2 = pts[Math.min(i + 1, pts.length - 1)][1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)][1];

    const t1 = pts[i][0];
    const t2 = pts[Math.min(i + 1, pts.length - 1)][0];
    const k = (x - t1) / Math.max(t2 - t1, 1e-6);
    const k2 = k * k;
    const k3 = k2 * k;

    return 0.5 * (
      2 * p1 +
      (-p0 + p2) * k +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * k2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * k3
    );
  };
}

/**
 * An extruded rounded box whose cross-section is scaled by a profile curve
 * over its height.
 *
 * Feature 1 needs this. A linear taper can only draw a straight-sided
 * frustum; this bowl is waisted, and the concave sweep from rim to foot is
 * most of what identifies the product. The extrusion is built upright, then
 * every vertex is scaled by the profile sampled at its own height — which
 * keeps the corner fillets continuous as the section shrinks.
 *
 * `steps` matters: with too few, the curve reads as a stack of facets rather
 * than a sweep, because there are no intermediate rings to bend.
 */
function useProfiledBox(
  width: number,
  depth: number,
  height: number,
  radius: number,
  profileX: (t: number) => number,
  profileZ: (t: number) => number,
  steps = 48,
) {
  return useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(width, depth, radius), {
      depth: height,
      steps,
      bevelEnabled: true,
      bevelThickness: radius * 0.45,
      bevelSize: radius * 0.45,
      bevelSegments: 3,
      curveSegments: 10,
    });
    // Extrude runs along +Z; standing it up leaves the volume at y ∈ [0, h].
    // Do NOT translate afterwards — that was a bug once, and it both lifted
    // the mesh off its own shadow and clamped the profile to a constant.
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = Math.min(Math.max(pos.getY(i) / height, 0), 1);
      pos.setX(i, pos.getX(i) * profileX(t));
      pos.setZ(i, pos.getZ(i) * profileZ(t));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [width, depth, height, radius, profileX, profileZ, steps]);
}

function useSlab(w: number, d: number, h: number, r: number) {
  return useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
      depth: h,
      bevelEnabled: true,
      bevelThickness: h * 0.22,
      bevelSize: r * 0.3,
      bevelSegments: 3,
      curveSegments: 10,
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, [w, d, h, r]);
}

export function ShadowWC({
  /** 0 = closed, 1 = fully open. Driven by the Showroom. */
  lidOpen = 0,
  ...props
}: React.ComponentProps<"group"> & { lidOpen?: number }) {
  // ── Dimensions ────────────────────────────────────────────────────────
  const BOWL_W = 0.88;
  const BOWL_D = 1.22;
  const BOWL_H = 0.88;
  const CIS_W = 0.74;
  const CIS_D = 0.40;
  const CIS_H = 0.80;
  const FILLET = 0.09;

  const FLOOR = -1.0;
  const BOWL_Z = 0.16;
  const CIS_Z = BOWL_Z - BOWL_D / 2 + CIS_D / 2 - 0.01;
  const seatTop = FLOOR + BOWL_H;
  const HINGE_Z = BOWL_Z - BOWL_D / 2 + 0.17;
  /* Just short of vertical, resting back on the cistern — where a real cover
     stops. Past vertical it swings up and behind, and on a cover nearly as
     long as the pan that throws the far edge out of frame. */
  const OPEN_ANGLE = Math.PI * 0.47;

  /* Feature 1. Read bottom (t=0) to rim (t=1): a small foot, a fast sweep
     outward through the lower third, then easing to full width at the rim.
     Front-to-back narrows less than side-to-side, which is what keeps the
     pan from looking pinched when seen head-on. */
  const bowlX = useMemo(
    () => curve([[0, 0.60], [0.14, 0.62], [0.46, 0.77], [0.76, 0.93], [1, 1]]),
    [],
  );
  const bowlZ = useMemo(
    () => curve([[0, 0.71], [0.14, 0.73], [0.46, 0.85], [0.76, 0.95], [1, 1]]),
    [],
  );
  /* Feature 3: the cistern's lower front rakes back into the shelf. */
  const cisX = useMemo(() => curve([[0, 0.95], [0.18, 0.99], [1, 1]]), []);
  const cisZ = useMemo(() => curve([[0, 0.74], [0.2, 0.96], [1, 1]]), []);
  const flat = useMemo(() => () => 1, []);

  const bowl = useProfiledBox(BOWL_W, BOWL_D, BOWL_H, FILLET, bowlX, bowlZ);
  const cistern = useProfiledBox(CIS_W, CIS_D, CIS_H, FILLET, cisX, cisZ, 16);
  // Feature 2: a small plinth, not a skirt.
  const plinth = useProfiledBox(BOWL_W * 0.6, BOWL_D * 0.52, 0.06, 0.05, flat, flat, 2);
  const lid = useSlab(CIS_W + 0.05, CIS_D + 0.05, 0.07, FILLET);
  // Feature 4: thick, soft-cornered, overhanging the rim.
  const seat = useSlab(BOWL_W + 0.02, BOWL_D - 0.24, 0.07, 0.2);
  const cover = useSlab(BOWL_W + 0.03, BOWL_D - 0.22, 0.065, 0.21);

  const glaze = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f2f4f3",
        roughness: 0.07,
        metalness: 0,
        // Glazed china is a clear coat over an opaque body. That second
        // specular layer is what stops it reading as painted plastic, and it
        // is the large soft sheet visible across the reference's cistern.
        clearcoat: 0.9,
        clearcoatRoughness: 0.06,
      }),
    [],
  );

  const plastic = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f6f7f6",
        roughness: 0.18,
        metalness: 0,
        clearcoat: 0.5,
      }),
    [],
  );

  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ccd1d4", roughness: 0.1, metalness: 0.95 }),
    [],
  );

  return (
    <group {...props}>
      <mesh geometry={plinth} material={glaze} position={[0, FLOOR, BOWL_Z]} receiveShadow />
      <mesh
        geometry={bowl}
        material={glaze}
        position={[0, FLOOR + 0.045, BOWL_Z]}
        castShadow
        receiveShadow
      />

      {/* Rim recess, so the top of the pan reads as an opening rather than a
          lid — this is what you see in the gap under a raised seat. */}
      <mesh position={[0, seatTop - 0.005, BOWL_Z + 0.05]} receiveShadow>
        <boxGeometry args={[BOWL_W - 0.26, 0.05, BOWL_D - 0.5]} />
        <meshStandardMaterial color="#dfe3e2" roughness={0.12} />
      </mesh>

      <mesh
        geometry={cistern}
        material={glaze}
        position={[0, seatTop - 0.05, CIS_Z]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={lid}
        material={glaze}
        position={[0, seatTop - 0.05 + CIS_H, CIS_Z]}
        castShadow
      />

      {/* ── Seat and cover ────────────────────────────────────────────────
          Both hinge at the rear on the hinge line itself, not around the
          middle of the pan — that difference is what makes it read as a lid
          opening rather than a lid sliding. The cover leads; the seat ring
          follows once the cover has cleared, as a real pair does.

          Negative rotation about X, so they fall away toward the cistern. */}
      <group position={[0, seatTop + 0.03, HINGE_Z]}>
        <group rotation={[-Math.max(0, lidOpen - 0.55) / 0.45 * OPEN_ANGLE * 0.93, 0, 0]}>
          <mesh
            geometry={seat}
            material={plastic}
            position={[0, -0.035, BOWL_Z + 0.06 - HINGE_Z]}
            castShadow
          />
        </group>

        <group rotation={[-Math.min(lidOpen / 0.7, 1) * OPEN_ANGLE, 0, 0]}>
          <mesh
            geometry={cover}
            material={plastic}
            position={[0, 0.04, BOWL_Z + 0.06 - HINGE_Z]}
            castShadow
          />
        </group>

        {/* Hinges. Small, but their absence is why a modelled seat looks
            fake — and here they are also the visible axis of the swing. */}
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.005, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.075, 14]} />
            <primitive object={chrome} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
