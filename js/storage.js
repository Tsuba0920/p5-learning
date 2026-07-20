const STORAGE_KEY = "p5-learning-app-progress";

function getDefaultProgress() {
  return {
    solved: {},
    attempts: {},
    correctCounts: {},
    lastChapterId: null,
    lastProblemIndex: 0,
    history: []
  };
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return getDefaultProgress();
  }

  try {
    return {
      ...getDefaultProgress(),
      ...JSON.parse(raw)
    };
  } catch (e) {
    console.error("保存データの読み込みに失敗しました:", e);
    return getDefaultProgress();
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function markAttempt(problemId, isCorrect) {
  const progress = loadProgress();

  if (!progress.attempts[problemId]) {
    progress.attempts[problemId] = 0;
  }
  progress.attempts[problemId]++;

  if (!progress.correctCounts[problemId]) {
    progress.correctCounts[problemId] = 0;
  }

  if (isCorrect) {
    progress.correctCounts[problemId]++;
    progress.solved[problemId] = true;
  }

  saveProgress(progress);
}

function addHistoryEntry(entry) {
  const progress = loadProgress();

  progress.history.unshift({
    ...entry,
    timestamp: new Date().toISOString()
  });

  if (progress.history.length > 100) {
    progress.history = progress.history.slice(0, 100);
  }

  saveProgress(progress);
}

function getHistory() {
  const progress = loadProgress();
  return progress.history || [];
}

function saveLastPosition(chapterId, problemIndex) {
  const progress = loadProgress();
  progress.lastChapterId = chapterId;
  progress.lastProblemIndex = problemIndex;
  saveProgress(progress);
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}