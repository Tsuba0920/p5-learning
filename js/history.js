function formatDateTime(isoString) {
  const date = new Date(isoString);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");

  return `${y}/${m}/${d} ${h}:${min}:${s}`;
}

function renderHistory() {
  const container = document.getElementById("historyContainer");
  const history = getHistory();

  if (!history || history.length === 0) {
    container.innerHTML = "<p>まだ解答履歴はありません。</p>";
    return;
  }

  let html = `
    <table style="width: 100%; border-collapse: collapse; background: white;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ccc; padding: 8px;">日時</th>
          <th style="border: 1px solid #ccc; padding: 8px;">章</th>
          <th style="border: 1px solid #ccc; padding: 8px;">問題</th>
          <th style="border: 1px solid #ccc; padding: 8px;">形式</th>
          <th style="border: 1px solid #ccc; padding: 8px;">結果</th>
          <th style="border: 1px solid #ccc; padding: 8px;">入力内容</th>
        </tr>
      </thead>
      <tbody>
  `;

  history.forEach(entry => {
    html += `
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;">${formatDateTime(entry.timestamp)}</td>
        <td style="border: 1px solid #ccc; padding: 8px;">${entry.chapterId || ""}</td>
        <td style="border: 1px solid #ccc; padding: 8px;">${entry.title || ""}</td>
        <td style="border: 1px solid #ccc; padding: 8px;">${entry.type || ""}</td>
        <td style="border: 1px solid #ccc; padding: 8px; color: ${entry.isCorrect ? "green" : "red"};">
          ${entry.isCorrect ? "正解" : "不正解"}
        </td>
        <td style="border: 1px solid #ccc; padding: 8px;">
          ${entry.userAnswer !== undefined ? entry.userAnswer : ""}
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

function clearHistoryOnly() {
  const progress = loadProgress();
  progress.history = [];
  saveProgress(progress);
  renderHistory();
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();

  const clearButton = document.getElementById("clearHistoryButton");
  clearButton.addEventListener("click", () => {
    const ok = confirm("解答履歴を削除しますか？");
    if (ok) {
      clearHistoryOnly();
    }
  });
});