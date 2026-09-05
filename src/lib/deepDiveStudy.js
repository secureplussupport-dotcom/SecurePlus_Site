import { getSy0701DeepDiveProfile } from "../data/sy0701DeepDiveMap.js";

const cleanText = value => typeof value === "string" ? value.trim() : "";

const card = (id, kind, front, back, context) => ({
  id,
  kind,
  front: cleanText(front),
  back: cleanText(back),
  context: cleanText(context),
});

export function buildDeepDiveFlashcards(dive) {
  if (!dive?.id) return [];
  const syllabus = getSy0701DeepDiveProfile(dive);
  const lessonTitle = syllabus?.title || dive.title;

  const cards = [
    card(
      `${dive.id}:core`,
      "Core idea",
      `What is the exam focus of “${lessonTitle}”?`,
      syllabus?.plainSummary || dive.summary,
      `SY0-701 objective ${syllabus?.objectiveCodes?.join(" / ") || "review"}`,
    ),
  ];

  dive.sections?.forEach((section, sectionIndex) => {
    if (!section?.table?.columns?.length) return;
    const [subjectLabel, ...detailLabels] = section.table.columns;

    section.table.rows?.forEach((row, rowIndex) => {
      const [subject, ...details] = row;
      const answer = details
        .map((detail, detailIndex) => `${detailLabels[detailIndex] || "Remember"}: ${detail}`)
        .join("\n");

      cards.push(card(
        `${dive.id}:table-${sectionIndex}-${rowIndex}`,
        syllabus?.beyondSections?.includes(sectionIndex) ? "Beyond textbook" : "Compare",
        `${subjectLabel || "Concept"}: How should you recognise “${subject}”?`,
        answer,
        section.title,
      ));
    });
  });

  dive.traps?.forEach((trap, trapIndex) => {
    cards.push(card(
      `${dive.id}:trap-${trapIndex}`,
      syllabus?.includesBeyondTextbook ? "Exam + beyond" : "Exam trap",
      `Which almost-right assumption should you avoid?`,
      trap,
      `${syllabus?.includesBeyondTextbook ? "Check the lesson scope" : `Trap ${trapIndex + 1}`} · ${lessonTitle}`,
    ));
  });

  if (dive.check?.question && dive.check?.answer) {
    cards.push(card(
      `${dive.id}:check`,
      syllabus?.includesBeyondTextbook ? "Apply + beyond" : "Apply it",
      dive.check.question,
      dive.check.answer,
      "Lesson check",
    ));
  }

  return cards.filter(item => item.front && item.back);
}

export function buildDeepDiveDeck(dives = []) {
  return dives.flatMap(buildDeepDiveFlashcards);
}

export function buildDeepDivePracticeQuestions(dive) {
  if (!dive?.id) return [];
  const profile = getSy0701DeepDiveProfile(dive);
  const keywordGuide = (profile?.keywordGuide || []).filter(item => item?.term && item?.meaning);
  const makeOptions = (answer, pool, seed = 0) => {
    const unique = Array.from(new Set(pool.filter(Boolean)));
    const alternatives = unique.filter(item => item !== answer);
    const rotated = alternatives.length
      ? alternatives.map((_, index) => alternatives[(index + seed) % alternatives.length])
      : [];
    const selected = [answer, ...rotated.slice(0, 3)];
    const shift = selected.length ? seed % selected.length : 0;
    return selected.map((_, index) => selected[(index + shift) % selected.length]);
  };

  const keywordQuestions = keywordGuide.slice(0, 3).map((item, index) => ({
    id: `${dive.id}:practice-keyword-${index}`,
    kind: "Keyword match",
    prompt: "Which exam term matches this explanation?",
    clue: item.meaning,
    answer: item.term,
    options: makeOptions(item.term, keywordGuide.map(entry => entry.term), index + 1),
    optionFeedback: Object.fromEntries(keywordGuide.map(entry => [entry.term, `${entry.term}: ${entry.meaning}`])),
    explanation: `${item.term}: ${item.meaning}`,
    source: `SY0-701 objective ${profile.objectiveCodes.join(" / ")}`,
  }));

  const comparisonQuestions = [];
  dive.sections?.forEach((section, sectionIndex) => {
    // Optional enrichment remains readable, but must not become an exam-scoped quiz.
    if (profile?.beyondSections?.includes(sectionIndex)) return;
    const columns = section?.table?.columns || [];
    const rows = section?.table?.rows || [];
    const answerPool = rows.map(row => String(row?.[0] || "").trim()).filter(Boolean);
    if (answerPool.length < 2) return;
    // A comparison table is not necessarily a valid single-answer quiz. For
    // example, a confusion matrix repeats both subjects and observations.
    const clues = rows.map(row => String(row?.[1] || "").trim().toLowerCase());
    if (new Set(answerPool.map(answer => answer.toLowerCase())).size !== answerPool.length
      || new Set(clues).size !== clues.length) return;
    rows.forEach((row, rowIndex) => {
      const answer = String(row?.[0] || "").trim();
      const clue = String(row?.[1] || "").trim();
      if (!answer || !clue) return;
      const detail = row
        .slice(1)
        .map((cell, index) => `${columns[index + 1] || "Remember"}: ${cell}`)
        .join(" · ");
      comparisonQuestions.push({
        id: `${dive.id}:practice-compare-${sectionIndex}-${rowIndex}`,
        kind: "Scenario sort",
        prompt: `Which ${String(columns[0] || "concept").toLowerCase()} fits this clue?`,
        clue,
        answer,
        options: makeOptions(answer, answerPool, rowIndex + sectionIndex + 1),
        sectionIndex,
        optionFeedback: Object.fromEntries(rows.map(candidate => [
          String(candidate[0]).trim(),
          candidate.slice(1).map((cell, index) => `${columns[index + 1] || "Remember"}: ${cell}`).join(" · "),
        ])),
        explanation: detail,
        source: section.title,
      });
    });
  });

  return [...keywordQuestions, ...comparisonQuestions.slice(0, 3)]
    .filter(question => question.options.length >= 2);
}

export function formatDeepDiveReviewDate(value = "2026-07-18") {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
