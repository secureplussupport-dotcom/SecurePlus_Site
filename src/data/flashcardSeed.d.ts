export interface FlashcardSeedCard {
  id: string;
  domain_id: 1 | 2 | 3 | 4 | 5;
  term: string;
  full_form: string;
  keywords: string[];
  concept_tags: string[];
  definition: string;
  exam_trap: string;
  port_or_protocol: string;
  is_acronym: boolean;
  example: string;
  legacy_ids: string[];
  definition_source: string;
}
export interface FlashcardSeed {
  version: number;
  domains: {id: number; title: string}[];
  decks: {id: string; code: string; title: string; domain_id: number; section_id: string; section_title: string; card_ids: string[]}[];
  cards: FlashcardSeedCard[];
  legacy_decks: Record<string, string[]>;
  source_note: string;
  source_url: string;
}
