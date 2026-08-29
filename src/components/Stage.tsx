/**
 * The showroom the product stands in.
 *
 * A full-bleed dark room with a polished floor, lit the way a real sanitary
 * showroom lights white ceramic: a hard key from high and off-axis to draw a
 * gradient down the glaze, a cool fill so the shadow side does not go dead,
 * and a rim from behind to cut the silhouette out of the background.
 *
 * The camera tracks page scroll rather than hijacking it. Scroll-jacking is
 * the standard failure of "3D websites": the page stops responding the way
 * every other page does, and on a phone it fights the thumb. Here the page
 * scrolls normally and the camera merely reads how far down you are — so the
 * product turns and settles as you move through the copy, and someone who
 * flicks straight to the WhatsApp button is never held up by an animation.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";

/**
 * Page scroll as 0→1 across the first viewport.
 *
 * Read inside the render loop rather than from a scroll listener. The
 * listener version fired far more often than the sixty times a second
 * anything could be drawn with the result, and on a phone that means a
 * touch-move handler competing with the frame it is trying to feed.
 * Sampling once per frame is strictly less work and always current, because
 * the only consumer of this value is the frame itself.
 */
function scrollProgress(): number {
  if (typeof window === "undefined") return 0;
  return Math.min(Math.max(window.scrollY / (window.innerHeight || 1), 0), 1);
}

function Rig({ children, still }: { children: React.ReactNode; still: boolean }) {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  /* On a wide screen the copy takes the left and the product takes the
     right, so the object is offset in the SCENE rather than by cropping the
     canvas — cropping would push it out of frame instead of moving it. On a
     narrow screen there is no room for two columns, so it centres and the
     copy sits beneath it. */
  const wide = viewport.aspect > 1.05;
  const offsetX = wide ? Math.min(viewport.width * 0.13, 1.05) : 0;
  /* On a phone there is one column, so the product takes the upper half and
     the copy takes the lower. Without this it sat dead centre and the body
     text ran straight across bright white ceramic — unreadable at any
     text-shadow. */
  const baseY = wide ? 0 : 0.58;
  const baseScale = wide ? 1 : 0.46;

  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = scrollProgress();

    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x, offsetX, 5, delta,
    );

    if (still) {
      // One fixed three-quarter view: the angle that shows the squared
      // profile and the rake at the same time.
      group.current.rotation.y = -0.42;
      group.current.position.y = baseY;
      group.current.scale.setScalar(baseScale);
      return;
    }

    /* A full turn on standby, plus what scrolling adds. The room is a
       photograph behind the product now rather than geometry around it, so
       nothing is broken by the object rotating — and a slow revolve is how
       the back and both sides get seen at all. About forty seconds a turn:
       fast enough to read as alive, slow enough not to compete with the
       copy beside it. */
    const target = state.clock.elapsedTime * 0.16 + t * Math.PI * 0.6 - 0.42;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y, target, 6, delta,
    );

    // Parallax from the cursor, deliberately small. Enough that the object
    // feels present in a room; not so much that it swims.
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x, pointer.current.y * 0.05, 4, delta,
    );

    // The product settles lower and further back as the page moves on, so
    // the copy below has the visual weight once it arrives.
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y, baseY - t * 0.5, 4, delta,
    );
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, baseScale * (1 - t * 0.14), 4, delta),
    );
  });

  return <group ref={group}>{children}</group>;
}

export function Stage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(mq.matches);
    const on = () => setStill(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <div className={className}>
      <Canvas
        // Framed from the object's real extent: it stands 1.7 tall centred
        // near y = -0.15, and at fov 34 that needs roughly 4 units of throw
        // to sit in frame with air around it. The earlier camera was closer
        // than the model was tall, which is why it was cropped.
        camera={{ position: [0, 0.45, 5.3], fov: 32 }}
        // Capped: a 3x phone renders 9x the pixels for a difference nobody
        // sees, on the battery of someone browsing over mobile data.
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        // Aimed a little high: an open cover adds nearly its own length
        // above the hinge, and that headroom has to be in frame.
        onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
      >
        {/* No background and no fog. The room is a photograph in the page
            behind this canvas, blurred the way a fast lens throws it, and
            the product composites over it sharp — which is how a fixture is
            actually shot, and it means the model is free to turn without
            fighting geometry that has to stay still. */}

        {/* Matched to the photograph behind: its light comes from a window
            on the left, so the key does too. Get this wrong and the eye
            reads the composite instantly, however good the model is. */}
        <ambientLight intensity={0.55} />
        <spotLight
          position={[-3.4, 5, 3.4]}
          angle={0.7}
          penumbra={0.95}
          intensity={120}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
        {/* Warm bounce from the right, as the backdrop's own walls would
            give. */}
        <directionalLight position={[4, 2, 2.5]} intensity={0.7} color="#f4e3cd" />
        {/* Rim from behind, to cut the silhouette out of a soft backdrop. */}
        <directionalLight position={[0.5, 3.2, -4]} intensity={1.1} />

        <Suspense fallback={null}>
          <Rig still={still}>{children}</Rig>

          {/* Tightened onto the base: the pan meets the tiles over a small
              footprint now that it stands on a plinth, and a wide soft blob
              would read as a puddle. */}
          <ContactShadows
            position={[0, -0.995, 0]}
            opacity={0.62}
            scale={5.5}
            blur={2}
            far={2.2}
            resolution={512}
          />
          {/* Apartment rather than warehouse: the reflections in glaze and
              chrome should be a room with windows, not a steel shed. */}
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  );
}
