import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../legal.css";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and conditions for using InboxNavigator's cold email infrastructure services, including Google Workspace inboxes, Outlook inboxes, and managed email setup.",
  alternates: {
    canonical: "https://inboxnavigator.com/terms",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://inboxnavigator.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Terms of Use",
      item: "https://inboxnavigator.com/terms",
    },
  ],
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <nav className="legal-nav">
        <Link href="/">
          <Image
            src="/images/inboxnavigator-logo.svg"
            alt="InboxNavigator"
            width={160}
            height={28}
            className="legal-nav-logo"
          />
        </Link>
        <Link href="/">Home</Link>
      </nav>

      <div className="legal-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        Terms of Use
      </div>

      <main className="legal-page">
        <h1>Terms of Use</h1>
        <p className="legal-effective-date">Effective Date: October 18, 2024</p>

        <p>
          This Terms of Use Agreement (the &quot;Agreement&quot;) constitutes a
          legally binding agreement by and between Inbox Navigator, operated by
          Faith Digital Media Private Limited (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;), and the client, whether personally or on behalf of an
          entity (&quot;Client&quot;), with regard to access and use of Inbox
          Navigator&apos;s website:{" "}
          <a href="https://www.inboxnavigator.com">www.inboxnavigator.com</a>{" "}
          (the &quot;Website&quot;) and any other media form, channel, mobile
          website or mobile application related, linked or otherwise connected
          thereto. Failure to agree and adhere to all of the terms, conditions,
          and obligations contained herein results in the express prohibition of
          the Client&apos;s use of the Website and services, and the Client is
          ordered to discontinue use immediately.
        </p>

        <h2>1. Services Provided</h2>

        <h3>1.1 Cold Email Infrastructure</h3>
        <ul>
          <li>We supply Google Workspace (G Suite) inboxes to clients.</li>
          <li>Initial commitment starts at 100 inbox accounts.</li>
        </ul>

        <h3>1.2 Domains</h3>
        <ul>
          <li>Domain costs are not included in our service fees.</li>
          <li>
            Clients may purchase domains independently or request our
            assistance.
          </li>
        </ul>

        <h3>1.3 Setup and Configuration</h3>
        <ul>
          <li>
            We guarantee the addition of necessary domain records (SPF, DMARC,
            DKIM).
          </li>
          <li>
            We set up warm-up processes, custom domain forwarding, and custom
            tracking.
          </li>
          <li>
            All inboxes are delivered directly into the client&apos;s Smartlead
            account.
          </li>
        </ul>

        <h2>2. Pricing and Payment</h2>
        <p>
          2.1 Pricing is based on the number of inboxes purchased.
        </p>
        <p>
          2.2 Bulk pricing discounts are available for higher volumes of
          inboxes.
        </p>
        <p>2.3 Payment methods are to be mutually agreed upon.</p>
        <p>
          2.4 We may retain card details on file for recurring charges, with
          client consent.
        </p>

        <h2>3. Client Responsibilities</h2>

        <h3>3.1 Information Provision</h3>
        <ul>
          <li>Provide types of domains desired for purchase.</li>
          <li>Supply names of actual inbox users.</li>
          <li>Promptly pay all invoices as they become due.</li>
        </ul>

        <h3>3.2 Compliance with Guidelines</h3>
        <ul>
          <li>Send only 15 to 25 emails per inbox per day.</li>
          <li>Use no more than two inboxes per domain.</li>
          <li>Verify every email before sending.</li>
          <li>
            Employ targeted outreach practices as recommended by us.
          </li>
        </ul>

        <h3>3.3 Acknowledgments</h3>
        <ul>
          <li>
            The client acknowledges that the majority of a cold email
            campaign&apos;s performance depends on their practices and usage.
          </li>
          <li>
            The client recognizes our limited control over overall performance
            and primary KPIs of cold email campaigns.
          </li>
        </ul>

        <h2>4. Our Responsibilities and Guarantees</h2>

        <h3>4.1 Service Delivery</h3>
        <ul>
          <li>
            Manage the end-to-end process of setting up and configuring inboxes
            and domains.
          </li>
          <li>
            Ensure all inboxes and domains are fully and correctly set up.
          </li>
          <li>
            Deliver inboxes directly into the client&apos;s Smartlead account.
          </li>
        </ul>

        <h3>4.2 Quality Assurance</h3>
        <ul>
          <li>
            Guarantee the addition of all necessary DNS records (SPF, DMARC,
            DKIM).
          </li>
          <li>
            Ensure warm-up processes, custom domain forwarding, and custom
            tracking are properly configured.
          </li>
        </ul>

        <h3>4.3 Performance Guarantees</h3>
        <ul>
          <li>
            If domain inbox health is less than 85% during the first two to
            three weeks of the warm-up period, we will investigate and rectify
            issues at no extra cost.
          </li>
          <li>
            If a cold email campaign following our guidelines experiences a
            bounce rate exceeding 25%, we will investigate and set up new
            infrastructure if the issue is attributable to our deliverables.
          </li>
        </ul>

        <h3>4.4 Replacement of Burned Inboxes and Domains</h3>
        <ul>
          <li>
            We will set up new inboxes and domains at no extra cost if they
            become burned, subject to our reasonable use clause.
          </li>
        </ul>

        <h2>5. Warm-Up Period</h2>
        <p>
          5.1 A minimum warm-up period of three weeks is recommended for optimal
          performance.
        </p>
        <p>
          5.2 We will monitor inbox health and performance metrics during this
          period.
        </p>

        <h2>6. Term and Termination</h2>
        <p>
          6.1 The agreement is effective upon signing and continues indefinitely
          until terminated.
        </p>
        <p>
          6.2 Termination conditions include breach of terms, convenience (with
          notice), and mutual agreement.
        </p>
        <p>
          6.3 Post-termination, clients must pay outstanding invoices, and we
          will deliver any pending completed deliverables.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          We shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages resulting from your use of our
          services.
        </p>

        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will
          provide notice of significant changes.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms of Use shall be governed by and construed in accordance
          with the laws of India without regard to conflict of law principles.
        </p>

        <h2>10. Disclaimer</h2>
        <p>
          The Website and services are provided on an as-is, as-available basis.
          The client agrees that its use of the Website and Services are at the
          Client&apos;s sole risk. We disclaim all warranties, express or
          implied, in connection with the Website and the Client&apos;s use
          thereof.
        </p>

        <h2>11. Contact Information</h2>
        <p>
          For any questions or complaints regarding the Website or services,
          please contact us at:
        </p>
        <p>
          Inbox Navigator under Faith Digital Media Private Limited
          <br />
          Email:{" "}
          <a href="mailto:kunal@inboxnavigator.com">
            kunal@inboxnavigator.com
          </a>
        </p>
        <p>
          By using our services, you acknowledge that you have read, understood,
          and agree to be bound by these Terms and Conditions.
        </p>
      </main>

      <footer className="legal-footer">
        <span>&copy; 2026 InboxNavigator</span>
        <Link href="/terms">Terms &amp; Conditions</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/refund">Refund Policy</Link>
      </footer>
    </>
  );
}
