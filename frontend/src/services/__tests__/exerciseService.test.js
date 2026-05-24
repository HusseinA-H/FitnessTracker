import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { fetchExercises } from "@data/exercises/exercises.repository";

describe("fetchExercises", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes exercises and strips HTML", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 1,
        results: [
          {
            id: 10,
            translations: [
              { language: 2, name: "Bench Press", description: "<p>Hello</p>" },
            ],
            category: { name: "Chest" },
            equipment: [{ name: "Barbell" }],
            muscles: [{ name: "Pectoralis major" }],
            muscles_secondary: [{ name: "Triceps brachii" }],
          },
        ],
      }),
    });

    const data = await fetchExercises({ limit: 20, offset: 0, languageId: 2 });

    expect(data.results).toHaveLength(1);
    expect(data.results[0]).toEqual({
      id: 10,
      name: "Bench Press",
      description: "Hello",
      category: "Chest",
      equipment: ["Barbell"],
      muscles: ["Pectoralis major"],
      musclesSecondary: ["Triceps brachii"],
    });
  });

  it("filters out exercises with no name", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 2,
        results: [{ id: 1, translations: [] }, { id: 2, translations: [] }],
      }),
    });

    const data = await fetchExercises({ languageId: 2 });
    expect(data.results).toHaveLength(0);
  });
});