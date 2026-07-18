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

  const cards = [
    card(
      `${dive.id}:core`,
      "Core idea",
      `What is the main idea behind “${dive.title}”?`,
      dive.summary,
      "Start with the mental model",
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
        "Compare",
        `${subjectLabel || "Concept"}: How should you recognise “${subject}”?`,
        answer,
        section.title,
      ));
    });
  });

  dive.traps?.forEach((trap, trapIndex) => {
    cards.push(card(
      `${dive.id}:trap-${trapIndex}`,
      "Exam trap",
      `Which almost-right assumption should you avoid?`,
      trap,
      `Trap ${trapIndex + 1} · ${dive.title}`,
    ));
  });

  if (dive.check?.question && dive.check?.answer) {
    cards.push(card(
      `${dive.id}:check`,
      "Apply it",
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
