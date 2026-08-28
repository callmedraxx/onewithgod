/**
 * ⚠️ PLACEHOLDER GEOMETRY — not the real product.
 *
 * This is a crude massing block standing in for the model that img2threejs
 * will build from the owner's own photograph of the toilet. It exists so the
 * stage, lighting, camera framing and page layout can be finished and
 * reviewed before the reference image arrives.
 *
 * It is deliberately simple and deliberately labelled. Shipping this to a
 * real customer would misrepresent the product they are being asked to buy,
 * which is why `App.tsx` refuses to render it once a real model is present,
 * and why the hero says so in dev.
 *
 * Replace with: forge output from `img2threejs` against the toilet photo,
 * exported as a THREE.Group factory.
 */

export function PlaceholderWC() {
  const ceramic = {
    color: "#f6f6f4",
    roughness: 0.18,
    metalness: 0.02,
  } as const;

  return (
    <group position={[0, -0.35, 0]}>
      {/* cistern */}
      <mesh position={[0, 0.42, -0.42]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.72, 0.3]} />
        <meshStandardMaterial {...ceramic} />
      </mesh>
      {/* bowl */}
      <mesh position={[0, -0.18, 0.08]} castShadow receiveShadow>
        <capsuleGeometry args={[0.32, 0.34, 8, 24]} />
        <meshStandardMaterial {...ceramic} />
      </mesh>
      {/* seat */}
      <mesh position={[0, 0.16, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.31, 0.055, 12, 36]} />
        <meshStandardMaterial {...ceramic} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, -0.62, -0.02]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.5, 20]} />
        <meshStandardMaterial {...ceramic} />
      </mesh>
      {/* flush plate — the one chrome detail, so the material story is right */}
      <mesh position={[0, 0.42, -0.26]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.03]} />
        <meshStandardMaterial color="#c8ccd0" roughness={0.15} metalness={0.9} />
      </mesh>
    </group>
  );
}
