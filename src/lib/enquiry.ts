export const presetEnquiryFields = [
  { id: "name", label: "Name", type: "text", placeholder: "Your name" },
  { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { id: "phone", label: "Phone number", type: "tel", placeholder: "+91 98765 43210" },
  { id: "contactMethod", label: "Preferred contact method", type: "select", options: ["Email", "Phone call", "Text message"] },
  { id: "appointmentFormat", label: "Preferred appointment format", type: "select", options: ["Online", "In person", "No preference"] },
  { id: "message", label: "Short message", type: "textarea", placeholder: "What would you like support with?" },
] as const;

export type EnquiryFieldId = typeof presetEnquiryFields[number]["id"];
export type EnquiryFieldConfig = { id: EnquiryFieldId; enabled: boolean; required: boolean };
export type EnquiryResponses = Partial<Record<EnquiryFieldId, string>>;

export const defaultEnquiryConfig: EnquiryFieldConfig[] = presetEnquiryFields.map((field) => ({
  id: field.id,
  enabled: true,
  required: field.id === "name" || field.id === "email",
}));

export function validateEnquiryResponses(config: EnquiryFieldConfig[], responses: EnquiryResponses) {
  const errors: Partial<Record<EnquiryFieldId, string>> = {};
  for (const field of config) {
    if (!field.enabled) continue;
    const value = responses[field.id]?.trim() ?? "";
    if (field.required && !value) errors[field.id] = `${presetEnquiryFields.find((item) => item.id === field.id)?.label} is required.`;
    if (field.id === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = "Enter a valid email address.";
  }
  return errors;
}
