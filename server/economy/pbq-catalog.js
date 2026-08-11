export const CIPHER_STANDARD_PBQ_UNLOCKS = Object.freeze(["p014", "p018", "p033"]);

export const CIPHER_UNLOCKABLE_PBQ_IDS = Object.freeze([
  "p002", "p003", "p004", "p005", "p006", "p007", "p008", "p009", "p010", "p011", "p012", "p013",
  "p014", "p015", "p016", "p017", "p018", "p019", "p020", "p021", "p022", "p023", "p024", "p025",
  "p026", "p027", "p028", "p029", "p030", "p031", "p032", "p033", "p034", "p035", "p036", "p037",
  "p038", "p039", "p040", "p041", "p042", "p043", "p044", "p045", "p046", "p047", "p048", "p049",
  "p050", "p051", "p052", "p054", "p055", "p056", "p057", "p058", "p060", "p061", "p062", "p064",
  "p066", "p067", "p068", "p069", "p070", "p073", "p074", "p075", "p077", "p078", "p079", "p080",
  "p082", "p083", "p084", "p085", "p086", "p089", "p094", "p095", "p096", "p099", "p201", "p202",
  "p203", "p204", "p205", "p206", "p207", "p208", "p209", "p210", "p211", "p212", "p213", "p214",
  "p215", "p216", "p217", "p218", "p219", "p220", "p221",
  "p222",
]);

export const CIPHER_UNLOCKABLE_PBQ_SET = new Set(CIPHER_UNLOCKABLE_PBQ_IDS);

export function chooseNextCipherPbq(unlockedIds = []) {
  const unlocked = new Set(unlockedIds);
  const standard = CIPHER_STANDARD_PBQ_UNLOCKS.find(id => !unlocked.has(id));
  if (standard) return standard;

  const candidates = CIPHER_UNLOCKABLE_PBQ_IDS.filter(id => !unlocked.has(id));
  if (!candidates.length) return "";
  return candidates[Math.floor(Math.random() * candidates.length)];
}
