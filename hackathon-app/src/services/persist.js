import { loadState, saveState } from './stateApi';

const KEY = 'lastRoadmap';

export function readLastRoadmap() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLastRoadmapLocal(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export async function writeLastRoadmap(value, token) {
  writeLastRoadmapLocal(value);
  if (!token) return;

  try {
    await saveState(token, value);
  } catch (e) {
    // Keep local progress even if the network save fails.
    console.error(e);
  }
}

export async function hydrateLastRoadmapFromServer(token) {
  if (!token) return null;
  try {
    const state = await loadState(token);
    if (state) writeLastRoadmapLocal(state);
    return state;
  } catch (e) {
    console.error(e);
    return null;
  }
}

