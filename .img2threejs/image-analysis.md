# Image analysis — ref/toilet.jpg

Run per `grimoire/intake/image_analysis.md`. Observation stated separately
from inference; inference marked. Object-space terms, not image-space.

Secondary reference: the Sweethome SHADOW marketing render, which shows the
same suite unwrapped and cleanly lit. Used only to confirm silhouette where
the showroom photograph is obscured by packaging.

## Layer 1 — Identification

- **Work type:** close-coupled water closet (WC), squared "cube" styling.
- **Classification:** sanitary fixture, vitreous china.
- **primaryDomain:** object. **Confidence:** 0.95.
- Observed alongside a matching square pedestal basin; the basin is a separate
  work and is out of scope for this reconstruction.

## Layer 2 — Overall form & silhouette

- **Bounding volume:** two cuboids. A shallow upright cuboid (cistern) at the
  proximal-rear, seated on the rear shelf of a larger cuboid (bowl body).
- **Symmetry:** bilateral about the sagittal plane. No radial component —
  this is the identity-defining departure from a conventional WC.
- **Shape language:** geometric, uniformly filleted. Every vertical arris
  carries a small constant-radius round; no sharp edges anywhere.
- **Proportion:** height ≈ 2.1× width; depth ≈ 1.7× width. (Inference: real
  dimensions near 780 × 360 × 650 mm, from category convention.)

## Layer 3 — Decomposition

**Macro**
1. Cistern — upright cuboid, rear.
2. Cistern lid — separate slab, overhangs the body on all four sides.
3. Bowl body — cuboid, **skirted to the floor**: no exposed trap, no gap
   beneath. The lateral faces are continuous from rim to floor.
4. Seat and cover — squared, rounded corners, seated on the bowl rim.
5. Plinth — the bowl's footprint meets the floor with a slight inset reveal.

**Meso**
- Flush control: rectangular plate inset into the cistern lid, upper face.
  Observed as a dark rectangle; inferred chrome dual-flush.
- Seat hinges: two fixings at the rear of the seat, proud of the cover line.
- A reveal separates the cistern front face from the bowl's rear rise.
- The bowl's frontal face rakes: wider at the rim than at the floor.

**Micro**
- Constant fillet on all vertical arrises (inference: 10–15 mm).
- Glaze breaks highlight along every fillet — this is what reads as ceramic.

## Materials

| Part | Observation | Parameters |
|---|---|---|
| Body, cistern, lid | High-gloss glazed white; sharp specular; near-white with a faint warm cast | `color #f4f4f1`, `roughness 0.10`, `metalness 0` |
| Seat and cover | Slightly warmer and flatter than the glaze | `color #f7f7f4`, `roughness 0.26` |
| Flush plate | Small specular metal | `metalness 0.95`, `roughness 0.12` |

## Identity-defining features

A pass fails if any of these is wrong, regardless of global score:

1. **Squared, not round.** Cuboid cistern, cuboid bowl.
2. **Skirted to the floor** — a visible trap would be a different product.
3. **Square seat** with rounded corners, not oval.
4. **Overhanging cistern lid**, proud on all sides.
5. **Frontal rake** on the bowl: narrower at the floor than at the rim.

## What a single photograph cannot show

Stated rather than invented: the rear face, the underside, the internal bowl
form and the waste outlet are all occluded. They are reconstructed from
category convention, not from evidence, and the model is **approximate** in
those regions. The bowl interior in particular is modelled as a simple
recess because the photograph shows it wrapped in packaging.
