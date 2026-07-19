# Skill Gap Scanner

An AI-powered app that compares a candidate's resume against a job description and
reports **Matched Skills**, **Missing Skills**, and a **Match Percentage** — using
Google's Gemini API to extract skills from free-form text instead of relying on
brittle keyword lists.

```
Resume: React, JavaScript, TypeScript, Redux, HTML, CSS
JD:     React, TypeScript, Redux, AWS, Docker

→ Matched:  React, TypeScript, Redux
→ Missing:  AWS, Docker
→ Match:    60%
```

## How it works

1. You provide a resume (upload a PDF/DOCX or paste text) and a job description (paste text).
2. The backend sends each text to **Gemini** with a strict-JSON prompt asking it to extract
   and normalize every skill mentioned (e.g. "ReactJS" → "React").
3. A pure-JS matcher compares the two skill sets and computes:
   - **Matched skills** — required by the JD and present in the resume
   - **Missing skills** — required by the JD but absent from the resume
   - **Match percentage** — `matched / total JD skills × 100`, rounded

Skill *extraction* is AI-driven; skill *comparison* is deterministic code — so the
percentage is always reproducible for a given pair of skill lists.

## Tech stack

- **Frontend:** React + Vite, Axios, react-dropzone
- **Backend:** Node.js + Express
- **AI:** Google Gemini API (`gemini-2.5-flash` by default, configurable)
- **File parsing:** `pdf-parse` (PDF), `mammoth` (DOCX)

No database is required — this is a stateless request/response tool. (If you want to
persist scan history, MongoDB slots in cleanly at the `/api/analyze` route.)

## Project structure

```
skill-gap-checker/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── routes/analyze.js      # POST /api/analyze
│   ├── services/gemini.js     # Gemini prompt + call + JSON parsing
│   ├── services/fileParser.js # PDF/DOCX -> plain text
│   ├── utils/matcher.js       # matched/missing/percentage logic
│   └── .env.example
└── frontend/
    ├── src/App.jsx
    ├── src/components/MatchGauge.jsx
    ├── src/components/ResultsView.jsx
    └── src/App.css
```

## Getting started

### Prerequisites

- Node.js 18+ (needs native `fetch`)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste your GEMINI_API_KEY
npm start
```

Runs on `http://localhost:5000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` calls to the backend.

### 3. Use it

Open `http://localhost:5173`, upload or paste a resume, paste a job description,
and click **Run scan**.

## API reference

`POST /api/analyze`

**Option A — file upload** (`multipart/form-data`)
| Field | Type | Description |
|---|---|---|
| `resumeFile` | file | PDF, DOCX, or TXT |
| `jdText` | string | Job description text |

**Option B — plain text** (`application/json`)
```json
{ "resumeText": "...", "jdText": "..." }
```

**Response**
```json
{
  "resumeSkills": ["React", "JavaScript", "TypeScript", "Redux", "HTML", "CSS"],
  "jdSkills": ["React", "TypeScript", "Redux", "AWS", "Docker"],
  "matchedSkills": ["React", "TypeScript", "Redux"],
  "missingSkills": ["AWS", "Docker"],
  "extraSkills": ["JavaScript", "HTML", "CSS"],
  "matchPercentage": 60
}
```

## Notes on the Gemini call

- Uses `responseMimeType: "application/json"` plus a strict prompt schema so
  parsing doesn't depend on regex-scraping prose.
- Skill names are normalized and case-insensitively deduped by the model *and*
  again in code, so "React" and "react" never show up as two separate skills.
- Model is configurable via `GEMINI_MODEL` in `.env` if you want to swap in a
  different Gemini model later without touching code.

## Extending it

- **Auth + history:** add MongoDB + JWT and store each scan under a user.
- **Multiple JDs:** loop the JD extraction call and rank matches across roles.
- **Resume rewrite suggestions:** add a second Gemini prompt that turns
  `missingSkills` into concrete resume bullet suggestions.
