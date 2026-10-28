/** A small, provider-neutral interface so the AI service can be swapped later. */

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface GenerateRequest {
  system: string;
  turns: ChatTurn[];
  /** JSON Schema the reply must follow (the provider returns JSON text). */
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GenerateResult {
  text: string;
  model: string;
}

export type AiErrorKind = "quota" | "unavailable" | "blocked" | "bad-response" | "config";

export class AiError extends Error {
  constructor(
    readonly kind: AiErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export interface AiProvider {
  /** Shown to users, e.g. "Gemini" or "Practice mode". */
  label: string;
  model: string;
  /** True only for the offline practice provider used in tests. */
  practice: boolean;
  generate(req: GenerateRequest): Promise<GenerateResult>;
}
