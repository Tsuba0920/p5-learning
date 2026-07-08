async function init() {
  setupP5Canvases();

  appState.chapters = await loadChapters();
  renderChapterList();

  if (appState.chapters.length > 0) {
    await selectChapter(appState.chapters[0].id);
  }

  prevProblemButton.addEventListener("click", showPrevProblem);
  nextProblemButton.addEventListener("click", showNextProblem);
  runButton.addEventListener("click", runAndJudge);
  hintButton.addEventListener("click", showHint);
  answerButton.addEventListener("click", showAnswer);
  resetButton.addEventListener("click", resetCode);
}

async function selectChapter(chapterId) {
  appState.currentChapterId = chapterId;
  appState.currentProblems = await loadProblemsByChapter(chapterId);
  appState.currentProblemIndex = 0;
  renderProblem();
}

function selectProblem(index) {
  appState.currentProblemIndex = index;
  renderProblem();
}

function getCurrentProblem() {
  return appState.currentProblems[appState.currentProblemIndex];
}

function showPrevProblem() {
  if (appState.currentProblemIndex > 0) {
    appState.currentProblemIndex--;
    renderProblem();
  }
}

function showNextProblem() {
  if (appState.currentProblemIndex < appState.currentProblems.length - 1) {
    appState.currentProblemIndex++;
    renderProblem();
  }
}

function runAndJudge() {
  const problem = getCurrentProblem();
  if (!problem) return;

  if (problem.type === "choice") {
    const ok = judgeChoice(problem);
    resultMessageEl.textContent = ok ? "正解！" : "不正解です。";
    explanationMessageEl.textContent = problem.explanation || "";
    return;
  }

  if (problem.type === "predict-output") {
    const ok = judgePredictOutput(problem, predictInputEl.value);
    resultMessageEl.textContent = ok ? "正解！" : "不正解です。";
    explanationMessageEl.textContent = problem.explanation || "";
    return;
  }

  if (problem.type === "fix-code" || problem.type === "full-code") {
    const result = judgeCode(problem, codeEditorEl.value);
    resultMessageEl.textContent = result.message;
    explanationMessageEl.textContent = problem.explanation || "";
    return;
  }
}

function showHint() {
  const problem = getCurrentProblem();
  if (!problem) return;
  hintMessageEl.textContent = problem.hint || "この問題にはヒントがありません。";
}

function showAnswer() {
  const problem = getCurrentProblem();
  if (!problem) return;

  if (problem.type === "choice") {
    resultMessageEl.textContent = `正解は ${problem.answerIndex + 1} 番目です。`;
    explanationMessageEl.textContent = problem.explanation || "";
    return;
  }

  if (problem.type === "predict-output") {
    resultMessageEl.textContent = `正解: ${problem.correctText}`;
    explanationMessageEl.textContent = problem.explanation || "";
    return;
  }

  if (problem.type === "fix-code" || problem.type === "full-code") {
    codeEditorEl.value = problem.answerCode;
    resultMessageEl.textContent = "模範解答を表示しました。";
    explanationMessageEl.textContent = problem.explanation || "";
  }
}

function resetCode() {
  const problem = getCurrentProblem();
  if (!problem) return;

  hintMessageEl.textContent = "ヒントはまだ表示されていません。";
  resultMessageEl.textContent = "初期状態に戻しました。";
  explanationMessageEl.textContent = "";

  clearGraphics(appState.previewGraphics);
  clearGraphics(appState.answerGraphics);

  if (problem.type === "fix-code" || problem.type === "full-code") {
    codeEditorEl.value = problem.starterCode;
  }

  if (problem.type === "choice") {
    appState.selectedChoiceIndex = null;
    updateChoiceSelection();
  }

  if (problem.type === "predict-output") {
    predictInputEl.value = "";
  }
}

init();