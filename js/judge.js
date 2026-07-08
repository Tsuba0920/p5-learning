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

function judgeChoice(problem) {
  return appState.selectedChoiceIndex === problem.answerIndex;
}

function judgePredictOutput(problem, userInput) {
  return userInput.trim() === String(problem.correctText).trim();
}

function judgeCode(problem, userCode) {
  clearGraphics(appState.previewGraphics);
  clearGraphics(appState.answerGraphics);

  try {
    executeBodyOnGraphics(userCode, appState.previewGraphics);
  } catch (e) {
    return { ok: false, message: `エラー: ${e.message}` };
  }

  try {
    executeBodyOnGraphics(problem.answerCode, appState.answerGraphics);
  } catch (e) {
    return { ok: false, message: `内部エラー: ${e.message}` };
  }

  const diff = calculateImageDifference(appState.previewGraphics, appState.answerGraphics);

  if (diff < 5) {
    return { ok: true, message: `正解！ 画像差分: ${diff.toFixed(2)}` };
  } else {
    return { ok: false, message: `不正解です。画像差分: ${diff.toFixed(2)}` };
  }
}