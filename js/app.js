async function init() {
  setupP5Canvases();

  appState.chapters = await loadChapters();
  renderChapterList();

  const progress = typeof loadProgress === "function"
    ? loadProgress()
    : null;

  let startChapterId = appState.chapters[0]?.id || null;

  if (progress && progress.lastChapterId) {
    const exists = appState.chapters.some(ch => ch.id === progress.lastChapterId);
    if (exists) {
      startChapterId = progress.lastChapterId;
    }
  }

  if (startChapterId) {
    await selectChapter(startChapterId);

    if (
      progress &&
      progress.lastProblemIndex !== undefined &&
      progress.lastProblemIndex < appState.currentProblems.length
    ) {
      appState.currentProblemIndex = progress.lastProblemIndex;
      renderProblem();
    }
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

  if (typeof saveLastPosition === "function") {
    saveLastPosition(appState.currentChapterId, appState.currentProblemIndex);
  }

  renderProblem();
}

function selectProblem(index) {
  appState.currentProblemIndex = index;

  if (typeof saveLastPosition === "function") {
    saveLastPosition(appState.currentChapterId, appState.currentProblemIndex);
  }

  renderProblem();
}

function getCurrentProblem() {
  return appState.currentProblems[appState.currentProblemIndex];
}

function showPrevProblem() {
  if (appState.currentProblemIndex > 0) {
    appState.currentProblemIndex--;

    if (typeof saveLastPosition === "function") {
      saveLastPosition(appState.currentChapterId, appState.currentProblemIndex);
    }

    renderProblem();
  }
}

function showNextProblem() {
  if (appState.currentProblemIndex < appState.currentProblems.length - 1) {
    appState.currentProblemIndex++;

    if (typeof saveLastPosition === "function") {
      saveLastPosition(appState.currentChapterId, appState.currentProblemIndex);
    }

    renderProblem();
  }
}

function runAndJudge() {
  const problem = getCurrentProblem();
  if (!problem) return;

  if (problem.type === "choice") {
    if (appState.selectedChoiceIndex === null) {
      setResultState(
        "wrong",
        "未選択です",
        "選択肢を1つ選んでから判定してください。"
      );
      return;
    }

    const ok = judgeChoice(problem);

    if (typeof markAttempt === "function") {
      markAttempt(problem.id, ok);
    }

    if (typeof addHistoryEntry === "function") {
      addHistoryEntry({
        problemId: problem.id,
        chapterId: appState.currentChapterId,
        title: problem.title,
        type: problem.type,
        isCorrect: ok,
        userAnswer: appState.selectedChoiceIndex
      });
    }

    showChoiceAnswerColors(problem);

    setResultState(
      ok ? "correct" : "wrong",
      ok ? "正解！" : "不正解です",
      problem.explanation || ""
    );

    renderProblemList();
    answerButton.classList.remove("hidden");
    return;
  }

  if (problem.type === "predict-output") {
    if (predictInputEl.value.trim() === "") {
      setResultState(
        "wrong",
        "未入力です",
        "回答を入力してから判定してください。"
      );
      return;
    }

    const ok = judgePredictOutput(problem, predictInputEl.value);

    if (typeof markAttempt === "function") {
      markAttempt(problem.id, ok);
    }

    if (typeof addHistoryEntry === "function") {
      addHistoryEntry({
        problemId: problem.id,
        chapterId: appState.currentChapterId,
        title: problem.title,
        type: problem.type,
        isCorrect: ok,
        userAnswer: predictInputEl.value
      });
    }

    setResultState(
      ok ? "correct" : "wrong",
      ok ? "正解！" : "不正解です",
      problem.explanation || ""
    );

    renderProblemList();
    answerButton.classList.remove("hidden");
    return;
  }

  if (problem.type === "fix-code" || problem.type === "full-code") {
    const result = judgeCode(problem, codeEditorEl.value);

    if (typeof markAttempt === "function") {
      markAttempt(problem.id, result.ok);
    }

    if (typeof addHistoryEntry === "function") {
      addHistoryEntry({
        problemId: problem.id,
        chapterId: appState.currentChapterId,
        title: problem.title,
        type: problem.type,
        isCorrect: result.ok
      });
    }

    if (result.ok) {
      setResultState("correct", "正解！", result.message);
    } else {
      setResultState("wrong", "不正解です", result.message);
    }

    renderProblemList();
    renderAnswerPreview(problem);
    answerButton.classList.remove("hidden");
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
    showChoiceAnswerColors(problem);
    setResultState(
      "neutral",
      `正解は ${problem.answerIndex + 1} 番目です`,
      problem.explanation || ""
    );
    return;
  }

  if (problem.type === "predict-output") {
    setResultState(
      "neutral",
      `正解: ${problem.correctText}`,
      problem.explanation || ""
    );
    return;
  }

  if (problem.type === "fix-code" || problem.type === "full-code") {
    codeEditorEl.value = problem.answerCode;
    setResultState("neutral", "模範解答を表示しました", problem.explanation || "");
  }
}

function resetCode() {
  const problem = getCurrentProblem();
  if (!problem) return;

  hintMessageEl.textContent = "ヒントはまだ表示されていません。";
  setResultState("neutral", "初期状態に戻しました。", "");

  clearGraphics(appState.previewGraphics);
  clearGraphics(appState.answerGraphics);

  answerButton.classList.add("hidden");

  if (problem.type === "fix-code" || problem.type === "full-code") {
    codeEditorEl.value = problem.starterCode;
  }

  if (problem.type === "choice") {
    appState.selectedChoiceIndex = null;
    updateChoiceSelection();
    clearChoiceAnswerColors();
  }

  if (problem.type === "predict-output") {
    predictInputEl.value = "";
  }

  renderAnswerPreview(problem);
}

init();