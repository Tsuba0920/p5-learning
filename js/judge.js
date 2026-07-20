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
  return appState.selectedChoiceIndex === problem.correctAnswer;
}

function judgePredictOutput(problem, userInput) {
  return userInput.trim() === String(problem.correctAnswer).trim();
}

function normalizeCode(code) {
  return code
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function judgeCode(problem, userCode) {
  clearGraphics(appState.previewGraphics);
  clearGraphics(appState.answerGraphics);

  try {
    executeBodyOnGraphics(problem.answerCode, appState.answerGraphics, problem.type);
  } catch (e) {
    return { ok: false, message: `内部エラー: ${e.message}` };
  }

  if (!problem.disableUserPreview) {
    try {
      executeBodyOnGraphics(userCode, appState.previewGraphics, problem.type);
    } catch (e) {
      if (problem.judgeMode !== "code-exact") {
        return { ok: false, message: `エラー: ${e.message}` };
      }
    }
  }

  if (problem.judgeMode === "code-exact") {
    const userNormalized = normalizeCode(sanitizeCode(userCode));
    const answerNormalized = normalizeCode(sanitizeCode(problem.answerCode));

    if (userNormalized === answerNormalized) {
      return { ok: true, message: "正解！ コードが正しく修正されています。" };
    } else {
      return { ok: false, message: "不正解です。コードの内容を見直してください。" };
    }
  }

  const diff = calculateImageDifference(
    appState.previewGraphics,
    appState.answerGraphics
  );

  if (diff < 5) {
    return { ok: true, message: `正解！ 画像差分: ${diff.toFixed(2)}` };
  } else {
    return { ok: false, message: `不正解です。画像差分: ${diff.toFixed(2)}` };
  }
}