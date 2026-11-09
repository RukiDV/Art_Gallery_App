/**
 * Test helper: makes `crypto.getRandomValues` return a fixed fraction of the
 * 32-bit range (0 <= fraction < 1). Returns a function to change the fraction.
 */
export function mockRandomFraction(initial: number): (next: number) => void {
  let fraction = initial;

  vi.spyOn(crypto, "getRandomValues").mockImplementation(((
    array: Uint32Array
  ) => {
    array[0] = Math.floor(fraction * 2 ** 32);
    return array;
  }) as unknown as typeof crypto.getRandomValues);

  return (next) => {
    fraction = next;
  };
}
