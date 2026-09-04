export type WebsiteFaq = {
  question: string;
  answer: string;
};

export const defaultWebsiteFaqs: WebsiteFaq[] = [
  {
    question: "Is therapy confidential?",
    answer:
      "Confidentiality and its limited safety and legal exceptions are discussed before beginning.",
  },
  {
    question: "How often will we meet?",
    answer: "Session frequency can be decided together based on your needs.",
  },
  {
    question: "Do you offer emergency support?",
    answer: "This practice is not an emergency service.",
  },
];

export function visibleWebsiteFaqs(faqs: WebsiteFaq[]) {
  return faqs
    .map((faq) => ({
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    }))
    .filter((faq) => faq.question && faq.answer);
}
