"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { WebsitePreview } from "@/components/onboarding/preference-studio";
import { PublicEnquiryForm } from "@/components/enquiries/public-enquiry-form";
import { PublicJournal } from "@/components/website/public-journal";
import { PublicCalendly } from "@/components/website/public-calendly";
import { PublicTestimonials } from "@/components/website/public-testimonials";

export function PublishedWebsite({ subdomain }: { subdomain: string }) {
  const site = useQuery(api.publishing.getPublicSite, { subdomain });
  const record = useMutation(api.analytics.record);
  const viewRecorded = useRef(false);
  useEffect(() => {
    if (!site || viewRecorded.current) return;
    viewRecorded.current = true;
    void record({ subdomain, eventType: "website_view" });
  }, [record, site, subdomain]);
  if (site === undefined)
    return <main className="public-site-state">Opening website…</main>;
  if (site === null)
    return (
      <main className="public-site-state">
        <div className="releaf-mark">R</div>
        <h1>Website not found</h1>
        <p>This address has not been published.</p>
      </main>
    );
  return (
    <main className="published-site">
      <WebsitePreview
        profile={{
          fullName: site.fullName,
          city: site.city,
          profilePhotoUrl: site.profilePhotoUrl,
          qualifications: site.qualifications,
          certifications: site.certifications,
          specializations: site.specializations,
          services: site.services,
          contactEmail: site.contactEmail,
          biography: site.biography,
          whoYouHelp: site.whoYouHelp,
          therapeuticApproach: site.therapeuticApproach,
        }}
        preferences={{
          enabledSections: site.enabledSections,
          palette: site.palette,
          tone: site.tone,
          visualStyle: site.visualStyle,
        }}
        appearance={{
          headingFont: site.headingFont,
          headingSize: site.headingSize,
          bodyFont: site.bodyFont,
          bodySize: site.bodySize,
          testimonialSize: site.testimonialSize ?? "medium",
          sectionSpacing: site.sectionSpacing,
          navbarLayout: site.navbarLayout ?? "classic",
          navbarButtonStyle: site.navbarButtonStyle ?? "solid",
          imageBorder: site.imageBorder ?? false,
          imageBorderColor: site.imageBorderColor ?? "ink",
          sectionBackgrounds: site.sectionBackgrounds ?? [],
          sectionAlignments: site.sectionAlignments ?? [],
          imageShape: site.imageShape ?? "arch",
          imageBackground: site.imageBackground ?? "soft",
          imagePadding: site.imagePadding ?? "balanced",
        }}
        content={{
          headline: site.headline,
          heroEyebrow: site.heroEyebrow,
          heroSupport: site.heroSupport,
          exploreHeading: site.exploreHeading,
          biography: site.biography,
          whoYouHelp: site.whoYouHelp,
          therapeuticApproach: site.therapeuticApproach,
        }}
        sectionOrder={site.sectionOrder}
        interactive
        bookingUrl={site.calendlyUrl}
        blogContent={<PublicJournal subdomain={subdomain} />}
        testimonialContent={<PublicTestimonials subdomain={subdomain} />}
        bookingContent={
          <PublicCalendly url={site.calendlyUrl} name={site.fullName} />
        }
        enquiryContent={<PublicEnquiryForm subdomain={subdomain} />}
        onBookingClick={() =>
          void record({ subdomain, eventType: "calendly_click" })
        }
      />
    </main>
  );
}
