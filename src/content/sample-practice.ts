export const primaryNavigation = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Journal", href: "#blog" },
  { label: "Book", href: "#booking" },
  { label: "Enquire", href: "#enquiry" },
] as const;

export const samplePractice = {
  name: "Diva Mehta",
  credential: "Counselling Psychologist",
  location: "Bandra West, Mumbai · Online across India",
  headline: "A steady place to hear yourself clearly.",
  introduction:
    "Therapy for young adults navigating anxiety, relationships, identity, and the quiet pressure to have everything figured out.",
  biography:
    "I work with adults who look capable on the outside but feel overwhelmed underneath. Our sessions make room for what is difficult, without rushing you toward a neat answer.",
  approach:
    "My approach is collaborative, trauma-informed, and grounded in each person’s pace. We may notice patterns, practise new ways of responding, and stay curious about what your emotions are trying to protect.",
  qualifications: [
    "M.A. Counselling Psychology",
    "Advanced training in trauma-informed practice",
    "5 years of experience",
    "Sessions in English and Hindi",
  ],
  focusAreas: ["Anxiety & overwhelm", "Relationships", "Self-worth", "Life transitions"],
  services: [
    {
      title: "Individual therapy",
      detail: "A private, ongoing space for adults aged 18 and above.",
      format: "Online · 50 minutes",
      fee: "₹2,000 per session",
    },
    {
      title: "Discovery call",
      detail: "A short conversation to see whether working together feels right.",
      format: "Online · 15 minutes",
      fee: "No fee",
    },
  ],
  posts: [
    { title: "When rest still feels unproductive", date: "18 August 2026", tag: "Burnout", read: "5 min read" },
    { title: "What a boundary can sound like", date: "02 August 2026", tag: "Relationships", read: "4 min read" },
    { title: "You do not need a crisis to begin therapy", date: "17 July 2026", tag: "Starting therapy", read: "6 min read" },
  ],
} as const;
