/**
 * The 3D showroom, split into its own chunk.
 *
 * Everything three.js touches is imported from here and nowhere else, which
 * is what keeps it out of the initial bundle.
 */

import { Stage } from "@/components/Stage";
import { ShadowWC } from "@/components/models/ShadowWC";

export function Showroom() {
  return (
    <Stage className="h-full w-full">
      <ShadowWC />
    </Stage>
  );
}
