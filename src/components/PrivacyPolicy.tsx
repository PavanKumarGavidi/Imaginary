import { IconAperture, IconArrow } from "./Icons";

/**
 * Privacy Policy page for Imagine Studio.
 * Customize the content to match your actual business practices.
 */
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="border-b border-[var(--line-soft)] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#top" className="flex items-center gap-3">
            <IconAperture width={22} height={22} className="text-[var(--amber)]" />
            <span className="font-display text-lg tracking-[0.12em] text-[var(--ink)]">IMAGINE</span>
          </a>
          <a href="#top" className="uline font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
            ← Back to the studio
          </a>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="kicker">Legal</span>
            <span className="h-px flex-1 bg-[var(--line-soft)]" />
          </div>
          <h1 className="font-display text-5xl leading-[1.0] text-[var(--ink)] md:text-6xl">
            Privacy <span className="italic text-[var(--amber)]">Policy</span>
          </h1>
          <p className="mt-4 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-[var(--muted)]">
          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Introduction</h2>
            <p className="leading-relaxed">
              Imagine Studio ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you visit our website, 
              book a photography session, or interact with our services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Information We Collect</h2>
            <p className="mb-3 leading-relaxed">We collect information that you provide directly to us, including:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address when you book a session or contact us.</li>
              <li><strong>Booking Details:</strong> Session preferences, dates, locations, and special requests.</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe. We do not store credit card details on our servers.</li>
              <li><strong>Photographs:</strong> Images captured during your session, which we use to deliver your ordered products.</li>
              <li><strong>Communications:</strong> Correspondence between you and our studio, including emails and messages.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">How We Use Your Information</h2>
            <p className="mb-3 leading-relaxed">We use the information we collect to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Process and fulfill your booking requests</li>
              <li>Communicate with you about your sessions and deliverables</li>
              <li>Send you invoices and process payments</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send promotional materials (only with your consent)</li>
              <li>Improve our services and website experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Photography & Image Usage</h2>
            <p className="leading-relaxed mb-3">
              By booking a session with Imagine Studio, you grant us permission to use the photographs taken during your session 
              for our portfolio, website, social media, and marketing materials, unless you explicitly request otherwise in writing.
            </p>
            <p className="leading-relaxed">
              If you prefer that certain images not be used for promotional purposes, please inform us at the time of booking or 
              before your session. We respect your privacy and will honor your preferences.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Data Storage & Security</h2>
            <p className="leading-relaxed">
              Your data is stored securely using industry-standard encryption and security practices. We use Supabase for database 
              storage and Stripe for payment processing, both of which comply with strict security standards. We implement appropriate 
              technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, 
              or destruction.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Third-Party Services</h2>
            <p className="mb-3 leading-relaxed">We use the following third-party services to operate our business:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>EmailJS:</strong> Email notifications</li>
              <li><strong>Netlify:</strong> Website hosting</li>
              <li><strong>Google Analytics:</strong> Website analytics (if enabled)</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              These services have their own privacy policies, and we encourage you to review them. We only share your data with 
              these services as necessary to provide our services to you.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Your Rights</h2>
            <p className="mb-3 leading-relaxed">You have the right to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal obligations)</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              To exercise any of these rights, please contact us using the information below.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Cookies & Tracking</h2>
            <p className="leading-relaxed">
              Our website may use cookies and similar tracking technologies to enhance your experience and analyze website traffic. 
              You can control cookie preferences through your browser settings. If you disable cookies, some features of our website 
              may not function properly.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including 
              satisfying legal, accounting, or reporting requirements. Booking records are typically retained for 7 years for tax and 
              legal compliance. Photographs are retained according to our service agreement with you.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Children's Privacy</h2>
            <p className="leading-relaxed">
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information 
              from children. If you are a parent or guardian and believe your child has provided us with personal data, please contact 
              us so we can take appropriate action.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by posting the new policy on this page with an updated "Last updated" date. 
              We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">Contact Us</h2>
            <p className="mb-3 leading-relaxed">
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="border-l-4 border-[var(--amber)] pl-6 py-2">
              <p className="font-display text-xl text-[var(--ink)] mb-2">Imagine Studio</p>
              <p className="leading-relaxed">
                Email: <a href="mailto:desk@imagine.studio" className="text-[var(--amber)] hover:underline">desk@imagine.studio</a><br />
                Phone: (503) 555-0114<br />
                Address: 14 Mercer Lane, Pearl District, Portland, OR 97209
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-display mb-4 text-2xl text-[var(--ink)]">California Residents</h2>
            <p className="leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), 
              including the right to know what personal information we collect, the right to delete your information, and the 
              right to opt-out of the sale of your personal information. We do not sell your personal information.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 border-t border-[var(--line-soft)] pt-10 text-center">
          <p className="font-display text-2xl italic text-[var(--ink)]">Questions about your privacy?</p>
          <p className="mt-2 text-sm text-[var(--muted)]">We're here to help. Reach out anytime.</p>
          <a href="#book" className="btn-solid mt-6 inline-flex">
            Contact us <IconArrow width={15} height={15} />
          </a>
        </div>
      </main>
    </div>
  );
}
