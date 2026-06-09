let questions = [];
let current = 0;
let score = 0;
let mode = "hiragana";
let qType = "kana-to-romaji";
let answered = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPool() {
  if (mode === "hiragana") return HIRAGANA;
  if (mode === "katakana") return KATAKANA;
  return [...HIRAGANA, ...KATAKANA];
}

function buildQuestions(count) {
  const pool = shuffle(getPool());
  return pool.slice(0, Math.min(count, pool.length));
}

function getWrongChoices(correct, pool, count = 3) {
  const others = pool.filter(x => x.romaji !== correct.romaji);
  return shuffle(others).slice(0, count);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startQuiz() {
  mode = document.querySelector(".mode-card.selected")?.dataset.mode || "hiragana";
  qType = document.getElementById("q-type").value;
  const count = parseInt(document.getElementById("q-count").value);
  questions = buildQuestions(count);
  current = 0;
  score = 0;
  document.getElementById("q-total").textContent = questions.length;
  showScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  if (current >= questions.length) { showResult(); return; }
  answered = false;

  const q = questions[current];
  const pool = getPool();

  document.getElementById("q-current").textContent = current + 1;
  const pct = (current / questions.length) * 100;
  document.getElementById("progress-bar").style.width = pct + "%";

  const qText = document.getElementById("question-text");
  qText.textContent = qType === "kana-to-romaji" ? q.kana : q.romaji;
  qText.className = qType === "kana-to-romaji" ? "question-kana" : "question-romaji";

  const wrongs = getWrongChoices(q, pool);
  const choices = shuffle([q, ...wrongs]);

  const grid = document.getElementById("choices");
  grid.innerHTML = "";

  choices.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = qType === "kana-to-romaji" ? c.romaji : c.kana;
    btn.addEventListener("click", () => handleAnswer(btn, c, q));
    grid.appendChild(btn);
  });

  const fb = document.getElementById("feedback");
  fb.classList.add("hidden");
}

function handleAnswer(btn, chosen, correct) {
  if (answered) return;
  answered = true;

  const isCorrect = chosen.romaji === correct.romaji;
  if (isCorrect) score++;

  document.querySelectorAll(".choice-btn").forEach(b => {
    const val = qType === "kana-to-romaji" ? b.textContent : b.textContent;
    const isRight = qType === "kana-to-romaji"
      ? b.textContent === correct.romaji
      : b.textContent === correct.kana;
    if (isRight) b.classList.add("correct");
    else b.classList.add("wrong");
    b.disabled = true;
  });

  const fb = document.getElementById("feedback");
  const icon = document.getElementById("feedback-icon");
  const text = document.getElementById("feedback-text");

  if (isCorrect) {
    fb.className = "feedback correct";
    icon.textContent = "✓";
    text.textContent = "Correct!";
  } else {
    fb.className = "feedback wrong";
    icon.textContent = "✗";
    text.textContent = `Answer: ${correct.kana} = ${correct.romaji}`;
  }

  setTimeout(() => {
    current++;
    renderQuestion();
  }, 1100);
}

function showResult() {
  showScreen("screen-result");
  const total = questions.length;
  const pct = Math.round((score / total) * 100);

  document.getElementById("score-num").textContent = score;
  document.getElementById("score-denom").textContent = `/ ${total}`;

  let emoji, title, msg;
  if (pct === 100) { emoji = "🏆"; title = "Perfect!"; msg = "Flawless. You know your kana!"; }
  else if (pct >= 80) { emoji = "🎉"; title = "Great job!"; msg = `${pct}% — keep it up!`; }
  else if (pct >= 60) { emoji = "📖"; title = "Not bad!"; msg = `${pct}% — a bit more practice and you'll nail it.`; }
  else { emoji = "💪"; title = "Keep going!"; msg = `${pct}% — don't give up, practice makes perfect!`; }

  document.getElementById("result-emoji").textContent = emoji;
  document.getElementById("result-title").textContent = title;
  document.getElementById("result-msg").textContent = msg;
}

// Event listeners
document.querySelectorAll(".mode-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});
document.querySelectorAll(".mode-card")[0].classList.add("selected");

document.getElementById("btn-start").addEventListener("click", startQuiz);
document.getElementById("btn-retry").addEventListener("click", startQuiz);
document.getElementById("btn-menu").addEventListener("click", () => showScreen("screen-menu"));
