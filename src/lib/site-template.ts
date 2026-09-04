const navigationLabels: Record<string, string> = {
  about: "About",
  "who-i-help": "Therapy",
  services: "Services",
  blog: "Journal",
  booking: "Book",
  enquiry: "Enquire",
};

export function orderedEnabledSections(
  sectionOrder: readonly string[],
  enabledSections: readonly string[],
) {
  const enabled = new Set(enabledSections);
  const seen = new Set<string>();

  return sectionOrder.filter((sectionId) => {
    if (!enabled.has(sectionId) || seen.has(sectionId)) return false;
    seen.add(sectionId);
    return true;
  });
}

export function navigationForSections(sectionIds: readonly string[]) {
  return sectionIds.flatMap((sectionId) => {
    const label = navigationLabels[sectionId];
    return label ? [{ label, href: `#${sectionId}` }] : [];
  });
}

export function formatServiceDetails(service: {
  format: string;
  durationMinutes: number;
  feeInr: number;
}) {
  const format = service.format
    ? service.format.charAt(0).toUpperCase() + service.format.slice(1)
    : "Session";
  const minutes = `${service.durationMinutes} ${
    service.durationMinutes === 1 ? "minute" : "minutes"
  }`;

  return {
    format: `${format} · ${minutes}`,
    fee:
      service.feeInr > 0
        ? `₹${service.feeInr.toLocaleString("en-IN")} per session`
        : "No fee",
  };
}
