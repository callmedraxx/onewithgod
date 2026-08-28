/**
 * The 3D showroom, split into its own chunk.
 *
 * Everything three.js touches is imported from here and nowhere else, which
 * is what keeps it out of the initial bundle. Swap PlaceholderWC for the
 * img2threejs output and nothing above this file changes.
 */

import { Stage } from "@/components/Stage";
import { PlaceholderWC } from "@/components/models/PlaceholderWC";

export function Showroom() {
  return (
    <Stage className="h-full w-full">
      <PlaceholderWC />
    </Stage>
  );
}
