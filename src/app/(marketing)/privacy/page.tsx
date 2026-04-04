import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "../legal.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How InboxNavigator collects, uses, and protects your personal data. Read our full privacy policy covering data handling, user rights, and international data transfers.",
};

export default function PrivacyPolicyPage() {
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
        <h1>Privacy Policy</h1>
        <p className="legal-effective-date">Effective Date: October 18, 2024</p>

        <p>
          This Privacy Policy describes how Inbox Navigator, operated by Faith
          Digital Media Private Limited (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;), collects, uses, and shares information about you when
          you use our website (
          <a href="https://www.inboxnavigator.com">www.inboxnavigator.com</a>)
          and services.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Information You Provide to Us</h3>
        <ul>
          <li>Contact information (e.g., name, email address)</li>
          <li>Billing information</li>
          <li>
            Account credentials for services we manage on your behalf
          </li>
          <li>Types of domains desired for purchase</li>
          <li>Names of actual inbox users</li>
          <li>Any other information you choose to provide</li>
        </ul>

        <h3>1.2 Information We Collect Automatically</h3>
        <ul>
          <li>Usage data (e.g., email sending patterns, domain health)</li>
          <li>IP address and device information</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Set up and configure inboxes and domains</li>
          <li>Monitor inbox health and performance metrics</li>
          <li>
            Send technical notices, updates, security alerts, and support
            messages
          </li>
          <li>
            Respond to your comments, questions, and customer service requests
          </li>
          <li>
            Enforce our terms and conditions and protect our rights and the
            rights of others
          </li>
        </ul>

        <h2>3. Sharing of Information</h2>
        <p>We may share your information:</p>
        <ul>
          <li>
            With vendors, consultants, and other service providers who need
            access to such information to carry out work on our behalf
          </li>
          <li>
            In response to a request for information if we believe disclosure is
            in accordance with, or required by, any applicable law or legal
            process
          </li>
          <li>
            If we believe your actions are inconsistent with our user agreements
            or policies, or to protect the rights, property, and safety of Inbox
            Navigator or others
          </li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>
          We retain your information for as long as necessary to provide our
          services and fulfill the purposes outlined in this Privacy Policy,
          unless a longer retention period is required or permitted by law.
        </p>

        <h2>5. Security</h2>
        <p>
          We take reasonable measures to help protect information about you from
          loss, theft, misuse, unauthorized access, disclosure, alteration, and
          destruction.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your
          personal information, including the right to:
        </p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Delete your personal information</li>
          <li>
            Object to or restrict the processing of your personal information
          </li>
          <li>Data portability</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information
          provided in the &quot;Contact Us&quot; section.
        </p>

        <h2>7. Changes to This Privacy Policy</h2>
        <p>
          We may change this Privacy Policy from time to time. If we make
          changes, we will notify you by revising the date at the top of the
          policy and, in some cases, provide you with additional notice.
        </p>

        <h2>8. Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to children under 13. We do not
          knowingly collect personal information from children under 13. If we
          learn we have collected or received personal information from a child
          under 13 without verification of parental consent, we will delete that
          information.
        </p>

        <h2>9. International Data Transfers</h2>
        <p>
          We are based in India and the information we collect is governed by
          Indian law. By accessing or using our services or otherwise providing
          information to us, you consent to the processing, transfer, and
          storage of information in and to India and other countries, where you
          may not have the same rights and protections as you do under local law.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
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
          and agree to be bound by this Privacy Policy.
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
