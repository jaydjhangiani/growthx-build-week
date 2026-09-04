import type { Metadata } from "next";
import { WebsitePreview } from "@/components/onboarding/preference-studio";
import { samplePractice } from "@/content/sample-practice";

export const metadata: Metadata = {
  title: "Diva Mehta · Releaf sample website",
  description: "A fictional sample psychologist website created with Releaf.",
};

const demoSections = [
  "introduction",
  "about",
  "who-i-help",
  "approach",
  "services",
  "qualifications",
  "blog",
  "booking",
  "enquiry",
  "faqs",
  "contact",
] as const;

export default function DemoPage() {
  return (
    <main className="published-site demo-published-site">
      <WebsitePreview
        profile={{
          fullName: samplePractice.name,
          city: "Mumbai",
          biography: samplePractice.biography,
          whoYouHelp: samplePractice.introduction,
          specializations: [...samplePractice.focusAreas],
          therapeuticApproach: samplePractice.approach,
          profilePhotoUrl: "/diva-mehta.png",
          qualifications: [...samplePractice.qualifications],
          contactEmail: "hello@divamehta.in",
          services: samplePractice.services.map((service) => ({
            name: service.title,
            format: service.format.split(" · ")[0].toLowerCase(),
            durationMinutes: Number.parseInt(service.format.match(/\d+/)?.[0] ?? "50", 10),
            feeInr: Number.parseInt(service.fee.replace(/\D/g, ""), 10) || 0,
          })),
        }}
        preferences={{
          enabledSections: [...demoSections],
          palette: "monsoon",
          tone: "warm",
          visualStyle: "editorial",
        }}
        content={{
          headline: samplePractice.headline,
          heroEyebrow: `${samplePractice.credential} · Mumbai`,
          heroSupport: samplePractice.introduction,
          biography: samplePractice.biography,
          whoYouHelp: samplePractice.introduction,
          therapeuticApproach: samplePractice.approach,
        }}
        appearance={{
          headingFont: "editorial",
          headingSize: "medium",
          bodyFont: "clean",
          bodySize: "medium",
          testimonialSize: "medium",
          sectionSpacing: "comfortable",
          navbarLayout: "classic",
          navbarButtonStyle: "solid",
          imageBorder: false,
          imageBorderColor: "ink",
          sectionBackgrounds: [
            { sectionId: "who-i-help", background: "dark" },
            { sectionId: "booking", background: "dark" },
            { sectionId: "faqs", background: "soft" },
          ],
          sectionAlignments: [],
          imageShape: "arch",
          imageBackground: "soft",
          imagePadding: "balanced",
        }}
        sectionOrder={demoSections}
        interactive
      />
    </main>
  );
}
