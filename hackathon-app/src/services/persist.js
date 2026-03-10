import { loadState, saveState } from './stateApi';

const KEY = 'lastRoadmap';
const DRAFT_KEY = 'draftRoadmapFlow';

function hashGoal(value) {
  const s = String(value || '').trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `g_${Math.abs(h)}`;
}

function normalizeGoalsState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { version: 2, activeGoalId: null, goals: [] };
  }

  if (Array.isArray(raw.goals)) {
    const goals = raw.goals
      .filter((g) => g && typeof g === 'object' && !Array.isArray(g) && typeof g.goal === 'string')
      .map((g) => ({
        id: String(g.id || hashGoal(g.goal)),
        goal: g.goal,
        roadmap: g.roadmap || null,
        checked: g.checked && typeof g.checked === 'object' ? g.checked : {},
        estimate: g.estimate || null,
        createdAt: g.createdAt || null,
        updatedAt: g.updatedAt || null
      }));

    let activeGoalId = raw.activeGoalId ? String(raw.activeGoalId) : null;
    if (activeGoalId && !goals.some((g) => g.id === activeGoalId)) activeGoalId = null;
    if (!activeGoalId && goals.length) activeGoalId = goals[0].id;

    return { version: 2, activeGoalId, goals };
  }

  if (typeof raw.goal === 'string' && raw.roadmap) {
    const id = hashGoal(raw.goal);
    return {
      version: 2,
      activeGoalId: id,
      goals: [
        {
          id,
          goal: raw.goal,
          roadmap: raw.roadmap || null,
          checked: raw.checked && typeof raw.checked === 'object' ? raw.checked : {},
          estimate: raw.estimate || null,
          createdAt: raw.createdAt || null,
          updatedAt: raw.updatedAt || null
        }
      ]
    };
  }

  return { version: 2, activeGoalId: null, goals: [] };
}

function getActiveGoal(state) {
  if (!state?.goals?.length) return null;
  const activeId = state.activeGoalId;
  return state.goals.find((g) => g.id === activeId) || state.goals[0] || null;
}

function mergeRoadmapSnapshot(existing, value) {
  const now = new Date().toISOString();
  const goal = value?.goal ?? existing?.goal ?? '';
  const id = value?.id ? String(value.id) : hashGoal(goal);

  return {
    id,
    goal,
    roadmap: value?.roadmap ?? existing?.roadmap ?? null,
    checked: value?.checked ?? existing?.checked ?? {},
    estimate: value?.estimate ?? existing?.estimate ?? null,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
}

export function readLastRoadmap() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const state = normalizeGoalsState(parsed);
    return getActiveGoal(state);
  } catch {
    return null;
  }
}

export function writeLastRoadmapLocal(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export function readDraftRoadmap() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    if (typeof parsed.goal !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraftRoadmap(value) {
  const existing = readDraftRoadmap();
  const next = mergeRoadmapSnapshot(existing, value);
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  return next;
}

export function clearDraftRoadmap() {
  sessionStorage.removeItem(DRAFT_KEY);
}

export function readRoadmapForFlow() {
  return readDraftRoadmap() || readLastRoadmap();
}

export function readAllGoals() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const state = normalizeGoalsState(parsed);
    return state.goals;
  } catch {
    return [];
  }
}

export async function writeLastRoadmap(value, token) {
  const raw = readLastRoadmapLocalRaw();
  const state = normalizeGoalsState(raw);
  const inputId = value?.id ? String(value.id) : hashGoal(value?.goal);
  const existing = state.goals.find((g) => g.id === inputId);
  const nextGoal = mergeRoadmapSnapshot(existing, value);
  const id = nextGoal.id;

  const goals = state.goals.filter((g) => g.id !== id);
  goals.unshift(nextGoal);

  const nextState = { version: 2, activeGoalId: id, goals };
  writeLastRoadmapLocal(nextState);
  if (!token) return;

  try {
    await saveState(token, nextState);
  } catch (e) {
    // Keep local progress even if the network save fails.
    console.error(e);
  }
}

function readLastRoadmapLocalRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setActiveGoalId(goalId, token) {
  const raw = readLastRoadmapLocalRaw();
  const state = normalizeGoalsState(raw);
  const id = String(goalId || '');
  if (!id || !state.goals.some((g) => g.id === id)) return;

  const nextState = { ...state, activeGoalId: id };
  writeLastRoadmapLocal(nextState);

  if (!token) return;
  try {
    await saveState(token, nextState);
  } catch (e) {
    console.error(e);
  }
}

export async function hydrateLastRoadmapFromServer(token) {
  if (!token) return null;
  try {
    const serverState = await loadState(token);
    if (!serverState) return null;
    const normalized = normalizeGoalsState(serverState);
    writeLastRoadmapLocal(normalized);
    return getActiveGoal(normalized);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function hydrateLastRoadmapFromServerFresh(token) {
  if (!token) return { ok: false, state: null };
  try {
    const serverState = await loadState(token);
    if (serverState) writeLastRoadmapLocal(normalizeGoalsState(serverState));
    else localStorage.removeItem(KEY);
    const local = readLastRoadmap();
    return { ok: true, state: local || null };
  } catch (e) {
    console.error(e);
    return { ok: false, state: null };
  }
}

export async function deleteGoal(goalId, token) {
  const raw = readLastRoadmapLocalRaw();
  const state = normalizeGoalsState(raw);
  const id = String(goalId || '');
  
  const goals = state.goals.filter((g) => g.id !== id);
  let activeGoalId = state.activeGoalId;
  
  if (activeGoalId === id) {
    activeGoalId = goals.length ? goals[0].id : null;
  }

  const nextState = { version: 2, activeGoalId, goals };
  writeLastRoadmapLocal(nextState);

  if (!token) return;
  try {
    await saveState(token, nextState);
  } catch (e) {
    console.error(e);
  }
}

