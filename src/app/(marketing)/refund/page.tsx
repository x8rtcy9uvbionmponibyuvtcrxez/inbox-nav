import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../legal.css";

export const metadata: Metadata = {
  title: "Refund and Return Policy",
  description:
    "InboxNavigator's refund and return policy for cold email infrastructure services. Understand our cancellation terms, refund eligibility, and how to request a refund.",
  alternates: {
    canonical: "https://inboxnavigator.com/refund",
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
      name: "Refund and Return Policy",
      item: "https://inboxnavigator.com/refund",
    },
  ],
};

export default function RefundPolicyPage() {
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
        Refund and Return Policy
      </div>

      <main className="legal-page">
        <h1>Refund and Return Policy</h1>
        <p className="legal-effective-date">Effective Date: October 11, 2024</p>

        <p>
          Thank you for choosing Inbox Navigator. Please read this Refund Policy
          carefully before making a purchase. By making a purchase, you agree to
          abide by the terms outlined herein.
        </p>

        <h2>1. No Refunds Once Work Has Begun</h2>
        <p>
          Due to the nature of our digital services, once we have begun work on
          your order (including but not limited to setting up inboxes,
          configuring domains, or initiating warm-up processes), no refunds will
          be issued. All purchases are considered final at this stage.
        </p>

        <h2>2. Refunds Before Work Commencement</h2>
        <p>
          If you choose to cancel your order before we have started any work, you
          may be eligible for a full refund. To request a cancellation and
          refund:
        </p>
        <ul>
          <li>
            Contact our customer support team immediately at{" "}
            <a href="mailto:kunal@inboxnavigator.com">
              kunal@inboxnavigator.com
            </a>
          </li>
          <li>Provide your order details and reason for cancellation</li>
          <li>
            We will process your request and issue a refund if no work has
            commenced
          </li>
        </ul>
        <p>
          Please note that the determination of whether work has commenced is at
          the sole discretion of Inbox Navigator.
        </p>

        <h2>3. Free Swapping and Replacements Before Work Commencement</h2>
        <p>Prior to the commencement of work, we offer:</p>
        <ul>
          <li>
            <strong>Free swapping of services:</strong> You may change your order
            details, such as the type of domains or inbox configurations, at no
            additional cost.
          </li>
          <li>
            <strong>Free replacements:</strong> If you wish to replace one
            service with another of equal value, we will accommodate such
            requests free of charge.
          </li>
        </ul>
        <p>
          To request a swap or replacement, contact our customer support team at{" "}
          <a href="mailto:kunal@inboxnavigator.com">
            kunal@inboxnavigator.com
          </a>{" "}
          before work has begun on your order.
        </p>

        <h2>4. Refunds in Exceptional Circumstances</h2>
        <p>Refunds may be considered in exceptional circumstances, such as:</p>
        <ul>
          <li>In the event of duplicate charges</li>
          <li>
            If there is a technical issue that prevents the customer from
            accessing the purchased service, and the issue cannot be resolved by
            our technical support team within a reasonable timeframe
          </li>
          <li>
            Any other circumstances deemed exceptional by Inbox Navigator
          </li>
        </ul>

        <h2>5. Submitting a Refund Request</h2>
        <p>
          Customers who believe they qualify for a refund must submit a request
          in writing to our customer support team at{" "}
          <a href="mailto:kunal@inboxnavigator.com">
            kunal@inboxnavigator.com
          </a>
          . The request must include:
        </p>
        <ul>
          <li>Order details (order number, date of purchase)</li>
          <li>Explanation of the circumstances warranting a refund</li>
          <li>
            Any supporting documentation or evidence relevant to the refund
            request
          </li>
        </ul>

        <h2>6. Refund Processing</h2>
        <p>
          Once a refund request is received, it will be reviewed by our team
          within a reasonable timeframe. We reserve the right to approve or deny
          refund requests at our discretion based on the merits of the
          circumstances presented.
        </p>

        <h2>7. Refund Method</h2>
        <p>
          Approved refunds will be processed using the original method of
          payment. Please note that it may take some time for the refunded amount
          to reflect in your account, depending on your financial
          institution&apos;s policies.
        </p>

        <h2>8. Modifications to the Policy</h2>
        <p>
          Inbox Navigator reserves the right to modify or update this Refund
          Policy at any time without prior notice. Any changes to the policy will
          be effective immediately upon posting on our website.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions or concerns regarding our Refund Policy,
          please contact us at:
        </p>
        <p>
          Inbox Navigator
          <br />
          Email:{" "}
          <a href="mailto:kunal@inboxnavigator.com">
            kunal@inboxnavigator.com
          </a>
        </p>
        <p>
          By making a purchase from us, you acknowledge that you have read,
          understood, and agreed to abide by the terms of this Refund Policy.
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
