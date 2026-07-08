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
  const fn = new Function("g", ...Object.keys(api), body);
  fn(g, ...Object.values(api));
}

function clearGraphics(g) {
  if (!g) return;
  g.clear();
  g.background(255);
  g.fill(255);
  g.stroke(0);
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