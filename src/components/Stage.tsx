/**
 * The 3D stage the product model stands on.
 *
 * Deliberately separate from the model itself: the lighting, camera, ground
 * and controls are a showroom that any product can be placed into, and the
 * geometry that img2threejs generates from a reference photograph drops in
 * without touching any of this.
 *
 * Sanitary ware is glazed white ceramic, which is the hardest thing to light
 * well — it is nearly the same value as the page, so it disappears without a
 * gradient across its surface and a contact shadow anchoring it. Hence a key
 * light off-axis, a soft fill, and a rim light to separate the silhouette
 * from the porcelain background.
 */

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { Group } from "three";

function SlowSpin({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<Group>(null);
  // Slow enough to read as "on display" rather than "spinning". A full turn
  // takes about 40 seconds, which is under the threshold where motion starts
  // competing with the copy beside it for attention.
  useFrame((_, delta) => {
    if (enabled && ref.current) ref.current.rotation.y += delta * 0.16;
  });
  return <group ref={ref}>{children}</group>;
}

export function Stage({
  children,
  spin = true,
  className = "",
}: {
  children: React.ReactNode;
  spin?: boolean;
  className?: string;
}) {
  // Respect the OS setting rather than animating regardless. Checked once at
  // render; someone who changes it mid-visit is not a case worth a listener.
  const stillness =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.55, 3.1], fov: 38 }}
        // Cap the pixel ratio: a 3x phone screen renders 9x the pixels for a
        // difference nobody can see, and drains the battery of the person
        // browsing on mobile data.
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        {/* Key, off-axis and high, so the glaze picks up a gradient rather
            than a flat fill. */}
        <directionalLight position={[3.5, 5, 3]} intensity={1.5} castShadow />
        {/* Fill from the opposite side, cool and weak, to keep the shadow
            side from going dead. */}
        <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#cfe3f2" />
        {/* Rim, behind and above: this is what separates a white object from
            a white page. */}
        <directionalLight position={[0, 3, -5]} intensity={0.9} />

        <Suspense fallback={null}>
          <SlowSpin enabled={spin && !stillness}>{children}</SlowSpin>
          {/* A real contact shadow, not a blurred ellipse. Without it the
              product floats and the whole scene reads as a sticker. */}
          <ContactShadows
            position={[0, -1.02, 0]}
            opacity={0.42}
            scale={7}
            blur={2.6}
            far={2.4}
            resolution={512}
          />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          // Stopped just above the floor and below the top: a buyer who drags
          // the model should never end up underneath it looking at nothing.
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.95}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
