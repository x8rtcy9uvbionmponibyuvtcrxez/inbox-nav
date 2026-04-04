import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../legal.css";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how InboxNavigator uses cookies and similar tracking technologies on our website. Details on cookie types, purposes, and how to manage your preferences.",
};

export default function CookiePolicyPage() {
  return (
    <>
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

      <main className="legal-page">
        <h1>Cookie Policy</h1>
        <p className="legal-effective-date">Effective Date: October 11, 2024</p>

        <p>
          Thank you for using Inbox Navigator. This Cookie Policy explains how
          we use cookies and similar technologies to recognize you when you visit
          our website at{" "}
          <a href="https://www.inboxnavigator.com">www.inboxnavigator.com</a>.
          It explains what these technologies are and why we use them, as well as
          your rights to control our use of them.
        </p>

        <h2>Why Do We Use Cookies</h2>
        <p>
          We use first-party and third-party cookies for several reasons. Some
          cookies are required for technical reasons in order for our website to
          operate, and we refer to these as &quot;essential&quot; or
          &quot;strictly necessary&quot; cookies. Other cookies enable us to
          track and target the interests of our users to enhance the experience
          on our website. Third parties serve cookies through our website for
          advertising, analytics, and other purposes.
        </p>

        <h2>Types of Cookies We Use</h2>
        <ol>
          <li>
            <strong>Strictly Necessary Cookies:</strong> These cookies are
            essential for you to browse the website and use its features, such as
            accessing secure areas of the site.
          </li>
          <li>
            <strong>Performance Cookies:</strong> These cookies collect
            information about how you use our website, like which pages you
            visited and which links you clicked on. None of this information can
            be used to identify you. It is all aggregated and, therefore,
            anonymized.
          </li>
          <li>
            <strong>Functionality Cookies:</strong> These cookies allow the
            website to remember choices you make (such as your user name,
            language, or the region you are in) and provide enhanced, more
            personal features.
          </li>
          <li>
            <strong>Targeting Cookies:</strong> These cookies are used to deliver
            advertisements more relevant to you and your interests.
          </li>
        </ol>

        <h2>How Can I Control Cookies</h2>
        <p>
          You have the right to decide whether to accept or reject cookies. You
          can exercise your cookie preferences by clicking on the appropriate
          opt-out links provided in the cookie banner.
        </p>
        <p>
          You can set or amend your web browser controls to accept or refuse
          cookies. If you choose to reject cookies, you may still use our
          website, though your access to some functionality and areas of our
          website may be restricted.
        </p>

        <h2>Changes to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time in order to reflect
          changes to the cookies we use or for other operational, legal, or
          regulatory reasons. Please revisit this Cookie Policy regularly to stay
          informed about our use of cookies and related technologies.
        </p>
        <p>
          The date at the top of this Cookie Policy indicates when it was last
          updated.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about our use of cookies or other
          technologies, please contact us at:
        </p>
        <p>
          Inbox Navigator under Faith Digital Media Private Limited
          <br />
          A-21, Oberoi Apartments, Civil Lines, New Delhi 110054, India
          <br />
          Email:{" "}
          <a href="mailto:kunal@inboxnavigator.com">
            kunal@inboxnavigator.com
          </a>
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
