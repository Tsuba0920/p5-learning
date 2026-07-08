async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`JSONの読み込みに失敗しました: ${path}`);
  }
  return await response.json();
}

async function loadChapters() {
  return await loadJSON("data/chapters.json");
}

async function loadProblemsByChapter(chapterId) {
  return await loadJSON(`data/${chapterId}.json`);
}