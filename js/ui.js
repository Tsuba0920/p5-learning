const chapterListEl = document.getElementById("chapterList");
const problemListEl = document.getElementById("problemList");
const problemTitleEl = document.getElementById("problemTitle");
const problemDescriptionEl = document.getElementById("problemDescription");
const codeEditorEl = document.getElementById("codeEditor");
const hintMessageEl = document.getElementById("hintMessage");
const resultPanelEl = document.getElementById("resultPanel");
const resultMessageEl = document.getElementById("resultMessage");
const explanationMessageEl = document.getElementById("explanationMessage");

const editorAreaEl = document.getElementById("editorArea");
const choiceAreaEl = document.getElementById("choiceArea");
const predictAreaEl = document.getElementById("predictArea");
const choiceListEl = document.getElementById("choiceList");
const predictInputEl = document.getElementById("predictInput");

const prevProblemButton = document.getElementById("prevProblemButton");
const nextProblemButton = document.getElementById("nextProblemButton");
const runButton = document.getElementById("runButton");
const hintButton = document.getElementById("hintButton");
const answerButton = document.getElementById("answerButton");
const resetButton = document.getElementById("resetButton");

function renderChapterList() {
  chapterListEl.innerHTML = "";

  appState.chapters.forEach(chapter => {
    const li = document.createElement("li");
    li.textContent = chapter.title;

    if (chapter.id === appState.currentChapterId) {
      li.classList.add("active-item");
    }

    li.addEventListener("click", async () => {
      await selectChapter(chapter.id);
    });

    chapterListEl.appendChild(li);
  });
}

function renderProblemList() {
  problemListEl.innerHTML = "";

  const progress = typeof loadProgress === "function"
    ? loadProgress()
    : { solved: {}, attempts: {} };

  appState.currentProblems.forEach((problem, index) => {
    const li = document.createElement("li");

    let mark = "";
    const isSolved = progress.solved && progress.solved[problem.id];
    const hasAttempted =
      progress.attempts &&
      progress.attempts[problem.id] &&
      progress.attempts[problem.id] > 0;

    if (isSolved) {
      mark = "✅ ";
    } else if (hasAttempted) {
      mark = "❌ ";
    }

    li.textContent = mark + problem.title;

    if (index === appState.currentProblemIndex) {
      li.classList.add("active-item");
    }

    li.addEventListener("click", () => {
      selectProblem(index);
    });

    problemListEl.appendChild(li);
  });
}

function renderProblem() {
  const problem = appState.currentProblems[appState.currentProblemIndex];
  if (!problem) return;

  appState.selectedChoiceIndex = null;

  problemTitleEl.textContent = problem.title;
  problemDescriptionEl.textContent = problem.description;
  hintMessageEl.textContent = "ヒントはまだ表示されていません。";
  setResultState("neutral", "未判定", "ここに判定結果の詳細や解説が表示されます。");

  clearGraphics(appState.previewGraphics);
  clearGraphics(appState.answerGraphics);

  answerButton.classList.add("hidden");

  renderByType(problem);
  renderChapterList();
  renderProblemList();
  renderAnswerPreview(problem);
}

function renderByType(problem) {
  editorAreaEl.classList.add("hidden");
  choiceAreaEl.classList.add("hidden");
  predictAreaEl.classList.add("hidden");

  if (problem.type === "fix-code" || problem.type === "full-code") {
    editorAreaEl.classList.remove("hidden");
    codeEditorEl.value = problem.starterCode;
  }

  if (problem.type === "choice") {
    choiceAreaEl.classList.remove("hidden");
    renderChoices(problem);
  }

  if (problem.type === "predict-output") {
    predictAreaEl.classList.remove("hidden");
    predictInputEl.value = "";
    predictInputEl.placeholder = problem.prompt || "答えを入力してください";
  }
}

function renderChoices(problem) {
  choiceListEl.innerHTML = "";

  problem.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-item";
    button.textContent = choice;

    button.addEventListener("click", () => {
      appState.selectedChoiceIndex = index;
      updateChoiceSelection();
    });

    choiceListEl.appendChild(button);
  });

  clearChoiceAnswerColors();
}

function updateChoiceSelection() {
  const buttons = choiceListEl.querySelectorAll(".choice-item");

  buttons.forEach((btn, index) => {
    if (index === appState.selectedChoiceIndex) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });
}

function renderAnswerPreview(problem) {
  clearGraphics(appState.answerGraphics);

  if (problem.type === "fix-code" || problem.type === "full-code") {
    try {
      executeBodyOnGraphics(problem.answerCode, appState.answerGraphics);
    } catch (e) {
      console.error("正解プレビュー描画エラー:", e);
    }
  }
}

function setResultState(state, message, detail = "") {
  resultPanelEl.classList.remove("result-neutral", "result-correct", "result-wrong");

  if (state === "correct") {
    resultPanelEl.classList.add("result-correct");
  } else if (state === "wrong") {
    resultPanelEl.classList.add("result-wrong");
  } else {
    resultPanelEl.classList.add("result-neutral");
  }

  resultMessageEl.textContent = message;
  explanationMessageEl.textContent = detail;
}

function showChoiceAnswerColors(problem) {
  const buttons = choiceListEl.querySelectorAll(".choice-item");

  buttons.forEach((btn, index) => {
    btn.classList.remove("choice-correct", "choice-wrong");

    if (index === problem.answerIndex) {
      btn.classList.add("choice-correct");
    } else if (
      appState.selectedChoiceIndex !== null &&
      index === appState.selectedChoiceIndex &&
      index !== problem.answerIndex
    ) {
      btn.classList.add("choice-wrong");
    }
  });
}

function clearChoiceAnswerColors() {
  const buttons = choiceListEl.querySelectorAll(".choice-item");
  buttons.forEach((btn) => {
    btn.classList.remove("choice-correct", "choice-wrong");
  });
}