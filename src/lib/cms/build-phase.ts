/** True while `next build` is collecting pages. Do not open Mongo in that phase. */
export function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}
