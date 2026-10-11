/**
 * Deterministic Alea PRNG (Johannes Baagøe, 2010)
 * Exactly reproduces seedrandom.alea used by angle.wtf for identical daily puzzle angles.
 */
export function alea(seed: string): () => number {
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  let c = 1;

  function Mash() {
    let n = 0xefc8249d;
    return (data: string) => {
      const str = data.toString();
      for (let i = 0; i < str.length; i++) {
        n += str.charCodeAt(i);
        let h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000;
      }
      return (n >>> 0) * 2.3283064365386963e-10;
    };
  }

  const mash = Mash();
  s0 = mash(' ');
  s1 = mash(' ');
  s2 = mash(' ');

  s0 -= mash(seed);
  if (s0 < 0) s0 += 1;
  s1 -= mash(seed);
  if (s1 < 0) s1 += 1;
  s2 -= mash(seed);
  if (s2 < 0) s2 += 1;

  return () => {
    const t = 2091639 * s0 + c * 2.3283064365386963e-10;
    s0 = s1;
    s1 = s2;
    return (s2 = t - (c = t | 0));
  };
}
