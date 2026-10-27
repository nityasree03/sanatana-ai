import type { CompanionId } from "@/lib/companions";

export type VerificationStatus =
  "verified-clean-source" | "checked-against-scan" | "ocr-cleaned-spot-checked";

export interface Passage {
  id: string;
  work_id: string;
  work: string;
  section: string;
  reference: string;
  order: number;
  companions: CompanionId[];
  speaker: string | null;
  translation: { language: string; text: string; translator: string; source_id: string };
  original: { language: string; script: string; text: string; source_id: string } | null;
  transliteration: { scheme: string; text: string; method: string } | null;
  verification_status: VerificationStatus;
  notes: string[];
  ingested_at: string;
}

export interface SourceInfo {
  id: string;
  title: string;
  translator: string | null;
  edition: string;
  year: string;
  license: string;
  rightsNote: string;
  url: string;
  scanUrl: string | null;
  language: string;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  companions: CompanionId[];
  passageCount: number;
  sections: string[];
  sources: SourceInfo[];
}

export interface SearchHit {
  passage: Passage;
  score: number;
  /** Which methods found this passage. */
  matchedBy: ("keyword" | "meaning")[];
}

export const STATUS_TEXT: Record<VerificationStatus, string> = {
  "verified-clean-source": "From a clean public-domain text",
  "checked-against-scan": "Checked against the original printed scan",
  "ocr-cleaned-spot-checked": "Cleaned from a scan; awaiting full proofreading",
};
