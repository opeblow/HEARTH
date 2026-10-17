import { z } from "zod";

/**
 * Schemas for the Qloo Taste API (hackathon host). Every live response is
 * validated here so schema drift surfaces as a clear error instead of a silent
 * bug.
 *
 * Two real-world quirks are handled explicitly:
 * - missing fields come back as `null`, not as an absent key, so every optional
 *   field is null-tolerant and normalised to `undefined`;
 * - insights wrap entities under `results.entities` while search returns a flat
 *   `results` array, and entities carry `subtype` (the real domain type), a
 *   `tags` array of objects, plus `location` and rich `properties`.
 */

/** Accepts a string, `null`, or absence — always yields `string | undefined`. */
const optStr = z
  .string()
  .nullish()
  .transform((v) => v ?? undefined);

const optNum = z
  .number()
  .nullish()
  .transform((v) => v ?? undefined);

/** Null-tolerant object/array/record: yields the value or `undefined`. */
function opt<T extends z.ZodType>(inner: T) {
  return inner.nullish().transform((v) => v ?? undefined);
}

export const qlooTagSchema = z.object({
  id: optStr,
  name: optStr,
  type: optStr,
  weight: z
    .number()
    .nullish()
    .transform((v) => v ?? undefined),
});

const tagLike = z.union([z.string(), qlooTagSchema]);

const coordsRecord = opt(z.record(z.string(), z.unknown()));

const imageLike = z.union([
  z.string(),
  z.object({ url: optStr }).transform((v) => v as { url?: string }),
]);

/** Arrays where the API may send `null` for the whole array or for elements. */
function optArray<T extends z.ZodType>(inner: T) {
  return z
    .array(z.union([inner, z.null()]))
    .nullish()
    .transform((v) => (v ?? []).filter((x) => x != null) as z.infer<T>[]);
}

export const qlooEntitySchema = z.object({
  entity_id: z.string(),
  name: optStr,
  type: optStr,
  subtype: optStr,
  disambiguation: optStr,
  popularity: optNum,
  affinity: optNum,
  location: coordsRecord,
  tags: optArray(qlooTagSchema),
  properties: opt(
    z.object({
      name: optStr,
      image: opt(imageLike),
      images: optArray(imageLike),
      tags: optArray(tagLike),
      geolocation: coordsRecord,
      price_level: z
        .number()
        .nullish()
        .transform((v) => v ?? undefined),
      neighborhood: optStr,
      geocode: opt(
        z.object({
          city: optStr,
          name: optStr,
          metro: optStr,
          country: optStr,
        }),
      ),
    }),
  ),
});

export type QlooEntity = z.infer<typeof qlooEntitySchema>;

export const qlooInsightItemSchema = qlooEntitySchema;

export const qlooInsightsResponseSchema = z.object({
  success: opt(z.boolean()),
  results: opt(
    z.object({
      entities: opt(z.array(qlooInsightItemSchema)),
    }),
  ),
  warnings: opt(z.array(z.string())),
});

export const qlooSearchResponseSchema = z.object({
  results: opt(z.array(qlooEntitySchema)),
  warnings: opt(z.array(z.string())),
});

export const qlooTagsResponseSchema = z.object({
  results: opt(z.array(qlooTagSchema)),
  tags: opt(z.array(qlooTagSchema)),
});

/**
 * Insight query parameters. Names are kept in one place and confirmed against
 * live responses: the API accepts `filter` (type / location / popularity /
 * exclude) and `signal.interests`, but rejects our former `operator` block, so
 * it is intentionally absent here.
 */
export const insightParamsSchema = z.object({
  filter: z
    .object({
      type: z.string().optional(),
      location: z.object({ query: z.string() }).optional(),
      tags: z.array(z.string()).optional(),
      popularity: z.object({ min: z.number(), max: z.number() }).optional(),
      exclude: z.object({ entities: z.array(z.string()) }).optional(),
      results: z.object({ entities: z.array(z.string()) }).optional(),
    })
    .optional(),
  signal: z
    .object({
      interests: z
        .object({
          entities: z.array(z.string()).optional(),
          tags: z.array(z.string()).optional(),
        })
        .optional(),
      location: z.object({ query: z.string() }).optional(),
    })
    .optional(),
  bias: z.object({ trends: z.boolean() }).optional(),
  take: z.number().int().positive().max(100).optional(),
});

export type InsightParams = z.infer<typeof insightParamsSchema>;
