# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

개인회생(Korean personal rehabilitation) 상담 웹앱. React 프론트 + FastAPI 백엔드. Code, comments, and UI text are Korean — match that when editing.


# Git 워크플로우 규칙

## 1. Repository
- **GitHub Repository:** `[chochoong]/individual_rehabilitation`
- **Main Branch:** `main`

## 2. Branching Strategy
- 모든 기능 개발은 `feature/[이슈번호]-[간단-설명-kebab-case]` 형식의 브랜치에서 진행한다.
- 이슈 번호가 없는 간단한 수정은 `fix/[간단-설명]` 또는 `chore/[간단-설명]` 브랜치를 사용한다.

## 3. Commit Message Convention
- 모든 커밋 메시지는 **Conventional Commits** 명세를 따른다.
- (예: `feat: Add author profile component`, `fix: Correct typo in footer`)
- 커밋 본문에는 변경 이유를 명확히 서술하고, 관련된 GitHub 이슈를 `Closes #[이슈번호]` 형식으로 반드시 포함한다.

## 4. Pull Request (PR) Process
- 모든 코드는 `main` 브랜치로 직접 푸시할 수 없으며, 반드시 PR을 통해 코드 리뷰를 받아야 한다.
- PR 제목은 커밋 메시지와 동일한 형식을 따른다.
- PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 템플릿을 사용한다.

## Commands

Backend (Python 3.13, managed by `uv`; run from `backend/`):

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8701   # port must be 8701 — frontend URLs are hardcoded
uv run python database.py                       # Oracle connectivity smoke test
uv run python project_kwon/build_vectordb.py    # (re)build the QnA Chroma index from data/QnA.csv
uv run python project_kwon/generate_answer.py   # interactive CLI chat against the QnA RAG
```

Frontend (run from `frontend/`):

```bash
npm install
npm run dev      # Vite on port 5191, strictPort
npm run build
npm run lint     # oxlint
```

There is no test suite and no test runner configured.

## Runtime prerequisites

- **Working directory matters.** `rehabilitation_case/case.py` uses relative paths (`./data/my_history.docx`, `./case_db`), so the backend only works when launched from `backend/`.
- **`.env` lives at the repo root**, not in `backend/`. `load_dotenv()` walks up from the cwd to find it. Keys: `OPENAI_API_KEY`, `HF_TOKEN`, `PINECONE_API_KEY`.
- **Oracle XE required.** `database.py` hardcodes the Instant Client path (`C:\oracle\instantclient_21_22`), DSN `localhost:1521/XE`, and credentials. Tables used: `lawqna`, `application_form` (+ sequence `seq_app_id`). SQL is Oracle-specific (`ROWNUM`, `DUAL`, `.NEXTVAL`).
- **Two separate vector stores**, both on disk and both gitignored-adjacent (they show up as untracked/deleted churn in `git status`):
  - `backend/chroma_db/` — collection `individual_rehab_qna`, built offline by `build_vectordb.py` from `data/QnA.csv`, embedded with the local `jhgan/ko-sroberta-multitask` SentenceTransformer. Must be built before the chatbot works (`generate_answer.py` calls `get_collection`, which raises if absent).
  - `backend/case_db/` — collection `rehabilitation_case`, embedded with OpenAI `text-embedding-3-small`. **Rebuilt on every server start**: `case.py` module-level code parses `data/my_history.docx` and `create_vectorstore()` does `shutil.rmtree(db_path)` first. This costs OpenAI embedding calls on every boot and generates a new UUID directory each time. A commented-out load-if-exists variant sits right above it.

## Architecture

Single-page flow driven by a `view` state machine in `frontend/src/App.jsx`:

```
qna → form → Calculation → case → chat
```

Each stage maps to one backend endpoint (all in `backend/api.py`, mounted at root by `main.py`):

| Stage | Component | Endpoint |
|---|---|---|
| qna | `App.jsx` | `GET /lawqna`, `GET /lawqna/search` — plain Oracle queries, no LLM |
| form | `Application/ApplicationForm.jsx` | `POST /application` — flat camelCase form → Oracle `application_form` |
| Calculation | `calculation/CalculationResult.jsx` | `POST /calculate` |
| case | `rehabilitation_case/AppCase.jsx` | `POST /casesearch`, `GET /application/latest-summary` |
| chat | `ChatBot/ChatBot.jsx` | `POST /qna/chat` |

Three subsystems, each owned by a different contributor and largely independent:

**`calculate/`** — the repayment estimator. Deliberately isolated: it consumes only the four `input_service/` Pydantic models and its README states the team's other files are not to be modified. Layering is `calculation_service.calculate_request` → `input_adapter.build_calculation_input` (normalizes/sums the four models into a flat `CalculationInput`) → `calculate_repayment` (36-month plan, present-value factor 33.7719, 1–6 person statutory living-cost table) → `CalculationResponse` with a `CalculationStatus` of `preliminary_fit | no_debt | income_shortfall | detailed_review`. `calculator.calculate_from_input_service` is the alternate entry point for direct in-process calls.

**`project_kwon/`** — the QnA chatbot RAG. Uses the raw `openai` SDK (not LangChain): local Korean embeddings → Chroma top-3 → `gpt-4o-mini`. `rewrite_query_with_context` makes a first LLM call to expand context-dependent follow-ups before retrieval. `api.py` converts the frontend's `[{role, content}]` history into the `[{user, assistant}]` pairs this module expects.

**`rehabilitation_case/case.py`** — similar-case search. LangChain + Chroma with a custom `HybridRetriever`: it regex-extracts 월소득/채무/월변제금 from the question, pulls k=20 by embedding, then reranks with weights income 0.5 / debt 0.3 / payment 0.2 / embedding 0.1 and returns the top 3 raw case texts. **The LLM is currently bypassed** — the active `run()` returns retriever output directly; the prompt + `gpt-4.1-mini` chain and two alternate `run()` bodies are commented out below it.

## Known dead / duplicated code

Don't mistake these for live paths:

- `input_service/aebt_info.py` is a byte-identical copy of `debt_info.py` (typo filename) and is imported nowhere.
- `frontend/src/input_service/` (`InputPage.jsx` + 4 step components) is a parallel snake_case wizard that `App.jsx` never renders; it posts to `/input`, an endpoint that does not exist. The live form is `Application/ApplicationForm.jsx`.
- `frontend/src/calculation/calculationMapper.js` hardcodes several fields to `0`/`""` (all `income_info` expense fields, `vehicle_value`, and every asset beyond real estate), so the calculator's liquidation value and extra-expense inputs are largely dead on the wire.
- `schema.py` defines `LawQnaCreate` / `LawQnaUpdate` / `LawQnaDelete` / `Applicant`; no endpoint uses them.
