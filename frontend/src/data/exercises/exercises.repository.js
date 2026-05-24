import { normalizeExercise } from "./exercises.mapper";

import { fetchWithRetry } from "@data/http/httpClient";


const API_BASE = "https://wger.de/api/v2";
const ENGLISH_LANGUAGE_ID = 2;

export async function fetchExercises({
  limit = 20,
  offset = 0,
  languageId = ENGLISH_LANGUAGE_ID,
  signal,
} = {}) {
  const url = `${API_BASE}/exerciseinfo/?language=${languageId}&limit=${limit}&offset=${offset}`;

  const data = await fetchWithRetry(url, {
    retries: 2,
    retryDelayMs: 600,
    timeoutMs: 12000,
    signal,
  });

  const rawResults = Array.isArray(data?.results) ? data.results : [];

  const results = rawResults
    .map((ex) => normalizeExercise(ex, languageId))
    .filter((ex) => ex?.id != null && ex?.name && ex.name.length > 0);

  return {
    results,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
    count: data?.count ?? results.length,
    limit,
    offset,
  };
}