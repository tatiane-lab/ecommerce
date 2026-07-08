/** Gera uma ilustração SVG (data URI) para o produto: nunca quebra offline. */
export function productImage(emoji: string, hue: number, variant: number): string {
  const h2 = (hue + 40 + variant * 25) % 360;
  const angle = 135 + variant * 60;
  const size = [120, 150, 90][variant % 3];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)">
<stop offset="0" stop-color="hsl(${hue} 80% 92%)"/><stop offset="1" stop-color="hsl(${h2} 75% 80%)"/></linearGradient></defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="${320 - variant * 60}" cy="${80 + variant * 40}" r="${90 + variant * 15}" fill="#fff" opacity=".35"/>
<text x="200" y="${200 + size / 3}" font-size="${size}" text-anchor="middle">${emoji}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
