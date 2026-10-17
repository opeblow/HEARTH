import "server-only";
import { z } from "zod";
import { serverEnv, hasLlm } from "@/lib/security/env";

/**
 * Provider-agnostic LLM client. Any OpenAI-compatible /chat/completions endpoint
 * works; the model is chosen by env var. Requests and responses never log
 * personal text. Returns null on any failure so callers can fall back to the
 * deterministic, fully-grounded path.
 */
export async function completeJson<T>({
  system,
  user,
  schema,
  maxTokens = 900,
}: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
}): Promise<T | null> {
  if (!hasLlm()) return null;
  const env = serverEnv();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${env.LLM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        temperature: 0.4,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = schema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}
