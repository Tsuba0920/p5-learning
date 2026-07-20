function makeGraphicsAPI(g) {
  return {
    background: (...args) => g.background(...args),
    circle: (...args) => g.circle(...args),
    ellipse: (...args) => g.ellipse(...args),
    rect: (...args) => g.rect(...args),
    square: (...args) => g.square(...args),
    line: (...args) => g.line(...args),
    triangle: (...args) => g.triangle(...args),
    quad: (...args) => g.quad(...args),
    fill: (...args) => g.fill(...args),
    stroke: (...args) => g.stroke(...args),
    noStroke: (...args) => g.noStroke(...args),
    noFill: (...args) => g.noFill(...args),
    strokeWeight: (...args) => g.strokeWeight(...args),
    noLoop: () => {},
    print: (...args) => console.log(...args),
    parseInt: (value) => Number.parseInt(value, 10),
    parseFloat: (value) => Number.parseFloat(value)
  };
}

function sanitizeCode(body) {
  return body
    .replace(/createCanvas\s*\([^)]*\)\s*;?/g, "")
    .trim();
}

function executeBodyOnGraphics(body, g, problemType = "fix-code") {
  const api = makeGraphicsAPI(g);
  const width = g.width;
  const height = g.height;
  const sanitizedBody = sanitizeCode(body);

  if (problemType === "full-code") {
    const fn = new Function(
      "g",
      "width",
      "height",
      ...Object.keys(api),
      `
${sanitizedBody}

if (typeof setup === "function") {
  setup();
}

if (typeof draw === "function") {
  draw();
}
`
    );

    fn(g, width, height, ...Object.values(api));
    return;
  }

  const fn = new Function(
    "g",
    "width",
    "height",
    ...Object.keys(api),
    sanitizedBody
  );

  fn(g, width, height, ...Object.values(api));
}

function clearGraphics(g) {
  if (!g) return;
  g.clear();
  g.background(255);
  g.fill(255);
  g.stroke(0);
  g.strokeWeight(1);
}

function setupP5Canvases() {
  appState.previewP5 = new p5((p) => {
    p.setup = () => {
      const c = p.createCanvas(320, 320);
      c.parent("previewCanvas");
      appState.previewGraphics = p.createGraphics(320, 320);
      clearGraphics(appState.previewGraphics);
    };

    p.draw = () => {
      p.background(255);
      if (appState.previewGraphics) {
        p.image(appState.previewGraphics, 0, 0);
      }
    };
  });

  appState.answerP5 = new p5((p) => {
    p.setup = () => {
      const c = p.createCanvas(320, 320);
      c.parent("answerCanvas");
      appState.answerGraphics = p.createGraphics(320, 320);
      clearGraphics(appState.answerGraphics);
    };

    p.draw = () => {
      p.background(255);
      if (appState.answerGraphics) {
        p.image(appState.answerGraphics, 0, 0);
      }
    };
  });
}