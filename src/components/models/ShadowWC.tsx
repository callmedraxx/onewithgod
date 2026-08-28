/**
 * Sweethome SHADOW — close-coupled WC.
 *
 * Procedural reconstruction of the unit photographed on the ONEWITHGOD
 * showroom floor, built with the img2threejs protocol: observe, spec, then
 * sculpt. The full observation record is in `.img2threejs/image-analysis.md`.
 *
 * The five identity-defining features, which the geometry below exists to
 * get right:
 *
 *   1. Squared, not round — cuboid cistern, cuboid bowl.
 *   2. Skirted to the floor: no exposed trap, no gap underneath.
 *   3. Square seat with rounded corners, not oval.
 *   4. Cistern lid overhangs the body on all four sides.
 *   5. The bowl rakes — narrower at the floor than at the rim.
 *
 * APPROXIMATE where the photograph could not see: the rear face, the
 * underside, the waste outlet and the bowl interior are reconstructed from
 * category convention rather than evidence. A single image is a projection.
 *
 * Units are normalised so the suite stands 1.70 tall with its base at
 * y = -1.0, which is where the Stage puts its contact shadow.
 */

import { useMemo } from "react";
import * as THREE from "three";

/** A rounded rectangle in the XZ plane, as a Shape ready to extrude. */
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
 * An extruded rounded box that tapers over its height.
 *
 * Feature 5 needs this and a plain box cannot do it: the bowl is visibly
 * narrower where it meets the floor than at the rim, and that rake is most
 * of what makes the silhouette read as this product rather than a crate.
 * The extrusion is built upright then every vertex is scaled by its own
 * height fraction, which keeps the fillets consistent as they converge.
 */
function useTaperedBox(
  width: number,
  depth: number,
  height: number,
  radius: number,
  /** Scale of the bottom face relative to the top. 1 = no taper. */
  bottomScale: number,
  /** Independent depth taper — the frontal rake is stronger than lateral. */
  bottomScaleZ = bottomScale,
) {
  return useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(width, depth, radius), {
      depth: height,
      bevelEnabled: true,
      bevelThickness: radius * 0.5,
      bevelSize: radius * 0.5,
      bevelSegments: 3,
      curveSegments: 8,
    });
    // Extrude builds along +Z; stand it up so +Y is height.
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, height, 0);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.min(Math.max(y / height, 0), 1); // 0 at floor, 1 at top
      const sx = bottomScale + (1 - bottomScale) * t;
      const sz = bottomScaleZ + (1 - bottomScaleZ) * t;
      pos.setX(i, pos.getX(i) * sx);
      pos.setZ(i, pos.getZ(i) * sz);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [width, depth, height, radius, bottomScale, bottomScaleZ]);
}

function useRoundedSlab(w: number, d: number, h: number, r: number) {
  return useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
      depth: h,
      bevelEnabled: true,
      bevelThickness: h * 0.18,
      bevelSize: r * 0.35,
      bevelSegments: 3,
      curveSegments: 8,
    });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, h, 0);
    geo.computeVertexNormals();
    return geo;
  }, [w, d, h, r]);
}

export function ShadowWC(props: React.ComponentProps<"group">) {
  // ── Dimensions ────────────────────────────────────────────────────────
  const BOWL_W = 0.80;
  const BOWL_D = 1.28;
  const BOWL_H = 0.92;
  const CIS_W = 0.82;
  const CIS_D = 0.44;
  const CIS_H = 0.78;
  const FILLET = 0.07;

  const FLOOR = -1.0;
  const BOWL_Z = 0.18; // bowl sits forward; cistern takes the rear
  const CIS_Z = BOWL_Z - BOWL_D / 2 + CIS_D / 2;

  // Feature 5: the rake. 0.86 laterally, stronger at 0.80 front-to-back.
  const bowl = useTaperedBox(BOWL_W, BOWL_D, BOWL_H, FILLET, 0.86, 0.8);
  const cistern = useTaperedBox(CIS_W, CIS_D, CIS_H, FILLET, 0.99, 0.99);
  // Feature 4: the lid is proud of the cistern on every side.
  const lid = useRoundedSlab(CIS_W + 0.07, CIS_D + 0.07, 0.075, FILLET);
  // Feature 3: square seat, rounded corners — a larger radius than the body
  // but nowhere near an oval.
  const seat = useRoundedSlab(BOWL_W - 0.04, BOWL_D - 0.30, 0.055, 0.16);
  const cover = useRoundedSlab(BOWL_W - 0.03, BOWL_D - 0.28, 0.05, 0.17);

  const glaze = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f4f4f1",
        roughness: 0.1,
        metalness: 0,
        // Glazed china is a clear coat over an opaque body — the second
        // specular layer is what stops it reading as painted plastic.
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
      }),
    [],
  );

  const plastic = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f7f7f4", roughness: 0.26 }),
    [],
  );

  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#cdd2d6", roughness: 0.12, metalness: 0.95 }),
    [],
  );

  const seatTop = FLOOR + BOWL_H;

  return (
    <group {...props}>
      {/* Feature 2: the bowl runs to the floor as one skirted volume. */}
      <mesh geometry={bowl} material={glaze} position={[0, FLOOR, BOWL_Z]} castShadow receiveShadow />

      {/* A shallow recess so the rim reads as a rim rather than a lid. */}
      <mesh position={[0, seatTop - 0.03, BOWL_Z + 0.06]} receiveShadow>
        <boxGeometry args={[BOWL_W - 0.22, 0.06, BOWL_D - 0.52]} />
        <meshStandardMaterial color="#e8e8e4" roughness={0.15} />
      </mesh>

      <mesh geometry={cistern} material={glaze} position={[0, seatTop - 0.02, CIS_Z]} castShadow receiveShadow />
      <mesh geometry={lid} material={glaze} position={[0, seatTop - 0.02 + CIS_H, CIS_Z]} castShadow />

      {/* Dual-flush plate, inset into the lid's upper face. */}
      <mesh position={[0, seatTop + CIS_H + 0.06, CIS_Z]} castShadow>
        <boxGeometry args={[0.2, 0.022, 0.12]} />
        <primitive object={chrome} attach="material" />
      </mesh>

      <mesh geometry={seat} material={plastic} position={[0, seatTop, BOWL_Z + 0.08]} castShadow />
      <mesh geometry={cover} material={plastic} position={[0, seatTop + 0.055, BOWL_Z + 0.08]} castShadow />

      {/* Hinges: small, but their absence is why a modelled seat looks fake. */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, seatTop + 0.04, BOWL_Z - BOWL_D / 2 + 0.20]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.055, 12]} />
          <primitive object={chrome} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
