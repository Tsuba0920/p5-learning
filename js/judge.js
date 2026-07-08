function calculateImageDifference(g1, g2) {
  g1.loadPixels();
  g2.loadPixels();

  let totalDiff = 0;
  const step = 4;

  for (let i = 0; i < g1.pixels.length; i += 4 * step) {
    const dr = Math.abs(g1.pixels[i] - g2.pixels[i]);
    const dg = Math.abs(g1.pixels[i + 1] - g2.pixels[i + 1]);
    const db = Math.abs(g1.pixels[i + 2] - g2.pixels[i + 2]);
    totalDiff += dr + dg + db;
  }

  const sampleCount = g1.pixels.length / (4 * step);
  return totalDiff / sampleCount;
}