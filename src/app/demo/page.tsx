import Image from "next/image";
import type { Metadata } from "next";
import { primaryNavigation, samplePractice } from "@/content/sample-practice";

export const metadata: Metadata = {
  title: "Diva Mehta · Releaf sample website",
  description: "A fictional sample psychologist website created with Releaf.",
};

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  const practice = samplePractice;

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Diva Mehta, home">
          <span>D</span>
          <span>Diva Mehta</span>
        </a>
        <nav aria-label="Main navigation">
          {primaryNavigation.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <a className="header-cta" href="#booking">Book a call <Arrow /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{practice.credential} · Mumbai</p>
          <h1>A steady place to<br /><em>hear yourself</em> clearly.</h1>
          <p className="hero-intro">{practice.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#booking">Book a discovery call <Arrow /></a>
            <a className="text-link" href="#about">How I work <span aria-hidden="true">↓</span></a>
          </div>
          <p className="availability"><span /> Accepting new clients · Online & in person</p>
        </div>
        <div className="portrait-wrap">
          <div className="portrait-frame">
            <Image src="/diva-mehta.png" alt="Fictional portrait of Diva Mehta in her counselling room" fill priority sizes="(max-width: 800px) 88vw, 42vw" />
          </div>
          <p className="portrait-note">A quiet room. Your pace.<br />No need to arrive with the right words.</p>
        </div>
      </section>

      <section className="ticker" aria-label="Practice focus areas">
        {practice.focusAreas.map((area) => <span key={area}>{area}</span>)}
      </section>

      <section className="section about" id="about">
        <div>
          <p className="eyebrow">A little about me</p>
          <h2>Therapy can be both<br />gentle and <em>honest.</em></h2>
        </div>
        <div className="about-copy">
          <p className="lead">{practice.biography}</p>
          <p>{practice.approach}</p>
          <a className="text-link" href="#approach">Read about my approach <Arrow /></a>
        </div>
      </section>

      <section className="section approach" id="approach">
        <p className="eyebrow light">What we can explore</p>
        <div className="approach-grid">
          <h2>You don’t have to carry it<br /><em>alone.</em></h2>
          <div className="focus-list">
            {practice.focusAreas.map((area, index) => (
              <div key={area}><span>0{index + 1}</span><h3>{area}</h3><span aria-hidden="true">↗</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section services" id="services">
        <div className="section-heading">
          <div><p className="eyebrow">Ways to work together</p><h2>Support that meets you<br /><em>where you are.</em></h2></div>
          <p>Sessions are confidential and shaped around what you need—not a fixed programme.</p>
        </div>
        <div className="service-grid">
          {practice.services.map((service, index) => (
            <article className="service-card" key={service.title}>
              <span className="card-number">0{index + 1}</span>
              <h3>{service.title}</h3>
              <p>{service.detail}</p>
              <dl><div><dt>Format</dt><dd>{service.format}</dd></div><div><dt>Fee</dt><dd>{service.fee}</dd></div></dl>
              <a href="#booking">Choose this session <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section qualifications">
        <p className="eyebrow">Training & practice</p>
        <div className="qualification-grid">
          <h2>Care backed by<br /><em>thoughtful training.</em></h2>
          <ul>{practice.qualifications.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section journal" id="blog">
        <div className="section-heading compact">
          <div><p className="eyebrow">From the journal</p><h2>Words for the space<br /><em>between sessions.</em></h2></div>
          <a className="text-link" href="#blog">View all articles <Arrow /></a>
        </div>
        <div className="post-grid">
          {practice.posts.map((post, index) => (
            <article className="post-card" key={post.title}>
              <div className={`post-art art-${index + 1}`}><span>{post.tag}</span></div>
              <p className="post-meta">{post.date} · {post.read}</p>
              <h3>{post.title}</h3>
              <a href="#blog" aria-label={`Read ${post.title}`}>Read article <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="booking" id="booking">
        <div>
          <p className="eyebrow light">A first step</p>
          <h2>See if this feels<br />like the <em>right fit.</em></h2>
          <p>Book a free 15-minute call. You can ask questions, tell me what brings you here, and decide without pressure.</p>
        </div>
        <div className="booking-card">
          <p>Free discovery call</p><strong>15 minutes · Online</strong>
          <div className="date-row"><span>Mon<br /><b>07</b></span><span>Tue<br /><b>08</b></span><span>Wed<br /><b>09</b></span></div>
          <button type="button">View available times <Arrow /></button>
          <small>Scheduling will be connected through Calendly.</small>
        </div>
      </section>

      <section className="section enquiry" id="enquiry">
        <div>
          <p className="eyebrow">Prefer to write?</p>
          <h2>Send a private<br /><em>enquiry.</em></h2>
          <p>Share only what feels comfortable. I’ll reply by email within two working days.</p>
          <p className="contact-detail">hello@divamehta.in<br />Bandra West, Mumbai</p>
        </div>
        <form className="enquiry-form">
          <label>Name<input type="text" name="name" placeholder="Your name" /></label>
          <label>Email<input type="email" name="email" placeholder="you@example.com" /></label>
          <label>What would you like support with?<textarea name="message" rows={4} placeholder="A short note is enough" /></label>
          <label className="consent"><input type="checkbox" name="consent" /> <span>I understand this form is for enquiries and not emergency support.</span></label>
          <button className="button button-primary" type="button">Send enquiry <Arrow /></button>
        </form>
      </section>

      <section className="section faq">
        <p className="eyebrow">Common questions</p>
        <div className="faq-grid"><h2>Before we<br /><em>begin.</em></h2><div>
          <details><summary>Is therapy confidential?<span>+</span></summary><p>Yes. We’ll also discuss the limited safety and legal exceptions before beginning.</p></details>
          <details><summary>How often will we meet?<span>+</span></summary><p>Most clients begin weekly. We can decide together based on your needs.</p></details>
          <details><summary>Do you offer emergency support?<span>+</span></summary><p>No. This practice is not an emergency service.</p></details>
        </div></div>
      </section>

      <footer><a className="wordmark inverse" href="#top"><span>D</span><span>Diva Mehta</span></a><p>Fictional demo website made with Releaf.</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
