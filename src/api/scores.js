const STORAGE_KEY = "earth-defender-scores"

const DEFAULT_SCORES = [
  { name: "FFF", score: 60 },
  { name: "DDC", score: 70 },
  { name: "HHH", score: 60 },
  { name: "XFX", score: 110 },
  { name: "RAM", score: 11100 },
  { name: "HEH", score: 230 },
  { name: "TST", score: 3210 },
  { name: "XCX", score: 8190 },
  { name: "XCX", score: 40 },
  { name: "XDC", score: 250 },
  { name: "VHGF", score: 50 },
  { name: "HELLO", score: 110 },
  { name: "RAMZY", score: 14010 },
  { name: "HELLO", score: 180 },
  { name: "CYRIL", score: 10 },
]

export function initScores() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES))
}

function readScores() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function writeScores(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export function addScore(name, score) {
  const scores = readScores()
  scores.push({ name: name.toUpperCase(), score })
  scores.sort((a, b) => b.score - a.score)
  writeScores(scores)
}

export function getScores(page = 1, limit = 10) {
  const scores = readScores()
  scores.sort((a, b) => b.score - a.score)

  const totalItems = scores.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const start = (page - 1) * limit
  const end = start + limit
  const pageScores = scores.slice(start, end)

  return { page, limit, totalItems, totalPages, scores: pageScores }
}
