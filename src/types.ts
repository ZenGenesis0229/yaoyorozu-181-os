export type SourceStatus = "classical";

export type HumanOSLayer = "Brain" | "Heart" | "Body" | "Soul";

export type Deity = {
  id: string;
  name_ja: string;
  name_kana: string;
  name_romaji: string;
  category: string;
  category_label: string;
  system: string;
  element: string[];
  human_os_layer: HumanOSLayer[];
  brain: number;
  heart: number;
  body: number;
  soul: number;
  role: string;
  archetype: string;
  gift: string;
  shadow: string;
  emotion: string;
  body_area: string;
  frequency: number;
  tarot_correspondence: string;
  iching_keyword: string;
  description_short: string;
  description_long: string;
  activation_question: string;
  practice: string;
  keywords: string[];
  related_deities: string[];
  source_status: SourceStatus;
  source_text: string[];
  historical_note: string;
  symbolic_interpretation: string;
};

export type DiagnosisAnswers = {
  heavyLayer: HumanOSLayer;
  missingPower: string;
  emotion: string;
  destroy: string;
  cultivate: string;
};

export type DiagnosisResult = {
  current_deity: Deity;
  missing_deity: Deity;
  shadow_deity: Deity;
  activation_practice: string;
};
