/**
 * The 3D showroom, split into its own chunk.
 *
 * Everything three.js touches is imported from here and nowhere else, which
 * is what keeps it out of the initial bundle.
 *
 * The lid animation is not decoration — it demonstrates the one feature of a
 * quality seat that a photograph physically cannot show. A soft-close hinge
 * opens freely and then refuses to slam: released from any angle it descends
 * under damping and settles without a sound. That is the whole reason it
 * costs more than the seat beside it on the shelf, and it is invisible in
 * every catalogue picture ever printed. So the model opens quickly when
 * asked and closes slowly on its own, and the label says what you are
 * watching. It is a product demonstration wearing the clothes of an effect.
 */

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stage } from "@/components/Stage";
import { FINISHES, ShadowWC, type Finish } from "@/components/models/ShadowWC";

function AnimatedWC({
  open,
  finish,
  onToggle,
  onAmount,
}: {
  open: boolean;
  finish: Finish;
  onToggle: () => void;
  onAmount: (v: number) => void;
}) {
  const [amount, setAmount] = useState(0);
  const value = useRef(0);

  useFrame((_, delta) => {
    const target = open ? 1 : 0;
    // The asymmetry IS the feature. Opening is brisk, because a hand does
    // it. Closing is slow and damped, because the hinge is doing it — and
    // the whole point of a soft-close seat is that it will not drop.
    const rate = open ? 7 : 1.9;
    value.current = THREE.MathUtils.damp(value.current, target, rate, delta);
    if (Math.abs(value.current - amount) > 0.002) {
      setAmount(value.current);
      onAmount(value.current);
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <ShadowWC lidOpen={amount} finish={finish} />

    </group>
  );
}

export function Showroom() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  /* Gold leads. It is the finish on the shopfront banner and the one
     that stops a scroll — white is a click away for anyone who wants it. */
  const [finish, setFinish] = useState<Finish>("gold");

  // Opens itself once, shortly after arrival, then closes under its own
  // damping. Nobody taps a thing they do not know is tappable, and the
  // close is the half worth seeing.
  useEffect(() => {
    const a = window.setTimeout(() => setOpen(true), 2200);
    const b = window.setTimeout(() => setOpen(false), 5200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <Stage className="h-full w-full">
        <AnimatedWC
          open={open}
          finish={finish}
          onToggle={() => setOpen((o) => !o)}
          onAmount={setAmount}
        />
      </Stage>

      {/* Finish. Not a colour picker for its own sake — these are three
          things the shop actually stocks and a buyer names on the phone, and
          seeing the gold on a real form beats imagining it from a swatch.
          Bottom-left, clear of the WhatsApp button's corner. */}
      <div className="absolute bottom-8 left-5 z-20 flex items-center gap-1.5 rounded-full
                      border border-hairline bg-void/80 p-1.5 backdrop-blur
                      sm:bottom-10 sm:left-10">
        <span className="px-2 text-[10px] uppercase tracking-[0.18em] text-chalk-soft/70">
          Finish
        </span>
        {FINISHES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFinish(f.id)}
            aria-pressed={finish === f.id}
            className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]
                        transition-colors ${
                          finish === f.id
                            ? "bg-chalk text-void"
                            : "text-chalk-soft hover:text-chalk"
                        }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* In the page rather than the scene. Inside the canvas it had to be
          scaled by distance, which made it balloon as the camera framing
          changed; here it simply sits where it is put. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        /* Desktop only. On a phone the hero copy already says "tap the seat"
           and the model itself is the tap target, so a second floating
           control would just be one more thing crowding a small screen —
           it was landing on the address line. */
        className="absolute bottom-10 right-56 z-20 hidden rounded-full border border-hairline
                   bg-void/80 px-4 py-2 text-[10px] uppercase tracking-[0.2em]
                   text-chalk-soft backdrop-blur transition-colors hover:text-chalk
                   sm:block"
      >
        {amount > 0.5 ? "Soft-close · watch it settle" : "Tap to open the seat"}
      </button>
    </div>
  );
}
