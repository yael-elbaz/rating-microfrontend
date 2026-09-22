// Tracks which identities (MFEs and the host alike) have already sent a request, so the first
// request of each can report isFirstMfeRequest=true.
//
// Lives in its own module rather than in mfeContext so httpClient can use it without a circular
// import: httpClient derives the flag in its request interceptor, mfeContext only supplies identity.
const calledMfes = new Set<string>();

/**
 * idntObjectPPR is a numeric id, but it travels as a header and so comes back out of a request as a
 * string. Both forms are accepted and normalized to the string form for the registry key, so that
 * release(<number>) and the interceptor's <string> address the same entry.
 */
export type IdntObjectPPR = string | number;

function getRegistry(): Set<string> {
  const w = window as any;
  if (!w.__mfeCallRegistry) w.__mfeCallRegistry = calledMfes;
  return w.__mfeCallRegistry as Set<string>;
}

/** Returns true the first time this identity is seen, and marks it as seen. */
export function consumeIsFirstRequest(idntObjectPPR: IdntObjectPPR): boolean {
  const registry = getRegistry();
  const key = String(idntObjectPPR);
  const isFirst = !registry.has(key);
  registry.add(key);
  return isFirst;
}

/**
 * Forgets that this MFE already made a request, so its next request reports isFirstMfeRequest=true again.
 * Call it when the MFE is closed/unmounted — otherwise the flag stays false until the next full page load.
 */
export function releaseMfe(idntObjectPPR: IdntObjectPPR): void {
  getRegistry().delete(String(idntObjectPPR));
}
