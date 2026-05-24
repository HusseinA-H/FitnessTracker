// src/data/exercises/exercises.mapper.js

const ENGLISH_LANGUAGE_ID = 2;

function stripHtml(html = "") {
  return String(html).replace(/<[^>]*>/g, "").trim();
}

function pickEnglishTranslation(exercise, languageId = ENGLISH_LANGUAGE_ID) {
  const translations = Array.isArray(exercise?.translations)
    ? exercise.translations
    : [];

  const isLangMatch = (t) => {
    const lang = t?.language;
    if (typeof lang === "number") return lang === languageId;
    if (typeof lang === "object" && lang !== null) {
      if (typeof lang.id === "number") return lang.id === languageId;
      if (typeof lang.short_name === "string")
        return lang.short_name.toLowerCase() === "en";
    }
    return false;
  };

  return translations.find(isLangMatch) || translations[0] || null;
}

export function normalizeExercise(exercise, languageId = ENGLISH_LANGUAGE_ID) {
  const t = pickEnglishTranslation(exercise, languageId);

  const rawName =
    (exercise?.name && String(exercise.name).trim()) ||
    (t?.name && String(t.name).trim()) ||
    (exercise?.name_original && String(exercise.name_original).trim()) ||
    "";

  const rawDesc =
    exercise?.description || t?.description || exercise?.description_original || "";

  const category =
    exercise?.category?.name || exercise?.category?.id || "Unknown";

  const equipment = Array.isArray(exercise?.equipment)
    ? exercise.equipment.map((e) => e?.name || e?.id).filter(Boolean)
    : [];

  const muscles = Array.isArray(exercise?.muscles)
    ? exercise.muscles.map((m) => m?.name || m?.id).filter(Boolean)
    : [];

  const musclesSecondary = Array.isArray(exercise?.muscles_secondary)
    ? exercise.muscles_secondary.map((m) => m?.name || m?.id).filter(Boolean)
    : [];

  return {
    id: exercise?.id,
    name: rawName,
    description: stripHtml(rawDesc),
    category,
    equipment,
    muscles,
    musclesSecondary,
  };
}