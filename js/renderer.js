function makeGraphicsAPI(g) {
  return {
    background: (...args) => g.background(...args),
    circle: (...args) => g.circle(...args),
    ellipse: (...args) => g.ellipse(...args),
    rect: (...args) => g.rect(...args),
    square: (...args) => g.square(...args),
    line: (...args) => g.line(...args),
    triangle: (...args) => g.triangle(...args),
    fill: (...args) => g.fill(...args),
    stroke: (...args) => g.stroke(...args),
    noStroke: (...args) => g.noStroke(...args),
    noFill: (...args) => g.noFill(...args),
    strokeWeight: (...args) => g.strokeWeight(...args)
  };
}

function executeBodyOnGraphics(body, g) {
  const api = makeGraphicsAPI(g);
  const fn = new Function(
    "g",
    ...Object.keys(api),
    body
  );
  fn(g, ...Object.values(api));
}

function clearGraphics(g) {
  g.clear();
  g.background(255);
  g.fill(255);
  g.stroke(0);
}