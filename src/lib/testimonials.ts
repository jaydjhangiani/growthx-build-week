export const TESTIMONIAL_MAX_LENGTH = 800;
export const TESTIMONIAL_ATTRIBUTION_MAX_LENGTH = 120;
export const TESTIMONIAL_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const TESTIMONIAL_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function validateWrittenTestimonial(quote: string, attribution: string) {
  const cleanQuote = quote.trim();
  const cleanAttribution = attribution.trim();
  if (!cleanQuote) return "Add the testimonial text.";
  if (cleanQuote.length > TESTIMONIAL_MAX_LENGTH)
    return `Keep the testimonial under ${TESTIMONIAL_MAX_LENGTH} characters.`;
  if (cleanAttribution.length > TESTIMONIAL_ATTRIBUTION_MAX_LENGTH)
    return `Keep the name or context under ${TESTIMONIAL_ATTRIBUTION_MAX_LENGTH} characters.`;
  return null;
}

export function validateTestimonialImage(file: Pick<File, "size" | "type">) {
  if (!TESTIMONIAL_IMAGE_TYPES.includes(file.type as (typeof TESTIMONIAL_IMAGE_TYPES)[number]))
    return "Choose a JPG, PNG or WebP image.";
  if (file.size > TESTIMONIAL_IMAGE_MAX_BYTES)
    return "Choose an image smaller than 5 MB.";
  return null;
}
