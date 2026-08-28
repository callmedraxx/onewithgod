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
import { Bathroom } from "@/components/Bathroom";
import type { Group } from "three";
import * as THREE from "three";

/** Page scroll as 0→1 across the first viewport, read once per frame. */
function useScrollProgress() {
  const ref = useRef(0);
  useEffect(() => {
    const read = () => {
      const h = window.innerHeight || 1;
      ref.current = Math.min(Math.max(window.scrollY / h, 0), 1);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);
  return ref;
}

function Rig({ children, still }: { children: React.ReactNode; still: boolean }) {
  const group = useRef<Group>(null);
  const scroll = useScrollProgress();
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
  const baseY = wide ? 0 : 0.42;
  const baseScale = wide ? 1 : 0.54;

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
    const t = scroll.current;

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

    /* No constant spin any more. The pan is back-to-wall and installed
       against the tiles now, and a fixture revolving freely inside its own
       bathroom destroys the one thing the room was added to establish. What
       is left is a slow drift the visitor drives: scrolling turns it about
       thirty degrees, enough to read the profile and the front, and it
       breathes very slightly so the frame is never completely dead. */
    const idle = Math.sin(state.clock.elapsedTime * 0.22) * 0.035;
    const target = -0.42 + t * 0.55 + idle;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y, target, 5, delta,
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
        gl={{ antialias: true, powerPreference: "high-performance" }}
        // Aimed a little high: an open cover adds nearly its own length
        // above the hinge, and that headroom has to be in frame.
        onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
      >
        <color attach="background" args={["#151413"]} />
        {/* Holds the far end of the room back so the walls read as receding
            rather than as a flat panel behind the product. */}
        <fog attach="fog" args={["#151413", 6, 17]} />

        {/* The room supplies most of the light now — a window off frame to
            the left and a warm bounce from the right. What is left here is
            the fill that keeps the shadow side of white ceramic from going
            dead, and one key with a shadow so the pan is planted on the
            tiles rather than hovering over them. */}
        <ambientLight intensity={0.3} />
        <spotLight
          position={[-2.6, 5.4, 3.2]}
          angle={0.62}
          penumbra={0.9}
          intensity={95}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
        {/* Rim from behind: white ceramic against a light wall needs its
            silhouette drawn, or the two merge at the edges. */}
        <directionalLight position={[0.5, 3.2, -4]} intensity={0.9} />

        <Suspense fallback={null}>
          <Bathroom />
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
