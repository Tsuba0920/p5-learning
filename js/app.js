let chapters = [];
let currentChapterId = null;
let currentProblems = [];
let currentProblem = null;

let previewP5;
let answerP5;
let previewGraphics;
let answerGraphics;

const chapterListEl = document.getElementById("chapterList");
const problemListEl = document.getElementById("problemList");
const problemTitleEl = document.getElementById("problemTitle");
const problemDescriptionEl = document.getElementById("problemDescription");
const codeEditorEl = document.getElementById("codeEditor");
const resultMessageEl = document.getElementById("resultMessage");

const runButton = document.getElementById("runButton");
const answerButton = document.getElementById("answerButton");
const resetButton = document.getElementById("resetButton");

async function init() {
  chapters = await loadJSON("data/chapters.json");
  renderChapterList();
  setupP5Canvases();

  if (chapters.length > 0) {
    await selectChapter(chapters[0].id);
  }

  runButton.addEventListener("click", runAndJudge);
  answerButton.addEventListener("click", showAnswer);
  resetButton.addEventListener("click", resetCode);
}

function renderChapterList() {
  chapterListEl.innerHTML = "";

  chapters.forEach(chapter => {
    const li = document.createElement("li");
    li.textContent = chapter.title;
    li.addEventListener("click", () => selectChapter(chapter.id));
    chapterListEl.appendChild(li);
  });
}

async function selectChapter(chapterId) {
  currentChapterId = chapterId;
  currentProblems = await loadJSON(`data/${chapterId}.json`);
  renderProblemList();

  if (currentProblems.length > 0) {
    selectProblem(currentProblems[0]);
  }
}

function renderProblemList() {
  problemListEl.innerHTML = "";

  currentProblems.forEach(problem => {
    const li = document.createElement("li");
    li.textContent = problem.title;
    li.addEventListener("click", () => selectProblem(problem));
    problemListEl.appendChild(li);
  });
}

function selectProblem(problem) {
  currentProblem = problem;
  problemTitleEl.textContent = problem.title;
  problemDescriptionEl.textContent = problem.description;
  codeEditorEl.value = problem.starterCode;
  resultMessageEl.textContent = "判定結果がここに表示されます。";
  clearGraphics(previewGraphics);
  clearGraphics(answerGraphics);
}

function setupP5Canvases() {
  previewP5 = new p5((p) => {
    p.setup = () => {
      const c = p.createCanvas(320, 320);
      c.parent("previewCanvas");
      previewGraphics = p.createGraphics(320, 320);
      clearGraphics(previewGraphics);
    };

    p.draw = () => {
      p.background(255);
      if (previewGraphics) {
        p.image(previewGraphics, 0, 0);
      }
    };
  });

  answerP5 = new p5((p) => {
    p.setup = () => {
      const c = p.createCanvas(320, 320);
      c.parent("answerCanvas");
      answerGraphics = p.createGraphics(320, 320);
      clearGraphics(answerGraphics);
    };

    p.draw = () => {
      p.background(255);
      if (answerGraphics) {
        p.image(answerGraphics, 0, 0);
      }
    };
  });
}

function runAndJudge() {
  if (!currentProblem) return;

  clearGraphics(previewGraphics);
  clearGraphics(answerGraphics);

  const userCode = codeEditorEl.value;
  const answerCode = currentProblem.answerCode;

  try {
    executeBodyOnGraphics(userCode, previewGraphics);
  } catch (e) {
    resultMessageEl.textContent = `エラー: ${e.message}`;
    try {
      executeBodyOnGraphics(answerCode, answerGraphics);
    } catch (_) {}
    return;
  }

  try {
    executeBodyOnGraphics(answerCode, answerGraphics);
  } catch (e) {
    resultMessageEl.textContent = `内部エラー: ${e.message}`;
    return;
  }

  const diff = calculateImageDifference(previewGraphics, answerGraphics);

  if (diff < 5) {
    resultMessageEl.textContent = `正解！ 画像差分: ${diff.toFixed(2)}`;
  } else {
    resultMessageEl.textContent = `不正解です。画像差分: ${diff.toFixed(2)}`;
  }
}

function showAnswer() {
  if (!currentProblem) return;
  codeEditorEl.value = currentProblem.answerCode;
  resultMessageEl.textContent = "模範解答を表示しました。";
}

function resetCode() {
  if (!currentProblem) return;
  codeEditorEl.value = currentProblem.starterCode;
  resultMessageEl.textContent = "初期コードに戻しました。";
  clearGraphics(previewGraphics);
  clearGraphics(answerGraphics);
}

init();