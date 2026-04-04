"use client";

import { useState, useRef } from "react";

interface FaqItemData {
  question: string;
  answer: string;
}

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItemData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`faq-item${isOpen ? " open" : ""}`}>
      <div className="faq-q" role="button" tabIndex={0} onClick={onToggle}>
        <h4>{item.question}</h4>
        <span className="icon">+</span>
      </div>
      <div
        className="faq-a"
        ref={answerRef}
        style={{
          maxHeight: isOpen
            ? `${answerRef.current?.scrollHeight ?? 200}px`
            : undefined,
        }}
      >
        <p>{item.answer}</p>
      </div>
    </div>
  );
}

const generalFaqs: FaqItemData[] = [
  {
    question:
      "Can I set up profile pictures, master password, email forwarding?",
    answer:
      "Yes to all. You can customize everything: profile pictures, passwords, forwarding rules, signatures - whatever you need. We'll help with the technical setup to ensure everything works properly.",
  },
  {
    question: "Can you guarantee deliverability?",
    answer:
      "After the initial month or two, your sending practices, nature of campaigns, level of personalization, and new regulation policies will influence your deliverability. We monitor and optimize continuously, but results also depend on your campaign quality.",
  },
  {
    question: "Can you purchase new domains for me?",
    answer:
      "Yes, we can buy domains for you at $15/domain. As standard, we only buy .com domains as they perform the best.",
  },
  {
    question: "Do I have full control over the inboxes?",
    answer:
      "Absolutely. You get complete access to the inboxes and can easily log into them if you'd like to.",
  },
  {
    question: "Do you have ongoing support?",
    answer:
      "Yes, we provide ongoing monthly support to all of our clients. For clients with over 100 inboxes, we have a dedicated account manager and a private Slack channel for priority support.",
  },
  {
    question:
      "Do you import them into my sending platform for me and how do you do it?",
    answer:
      "Yes, we upload the accounts into your Smartlead/Instantly or any sending platform using OAuth, and we even turn on warmup for you.",
  },
  {
    question: "How is this better than IP-based providers?",
    answer:
      "Shared IPs from these providers are prone to blacklisting because they attract spammers and abusers. This means you're sharing servers with high-risk users, increasing the risk to your outbound emails. Our inboxes offer safer, dedicated infrastructure.",
  },
  {
    question: "How is this safer than IP-based inbox providers?",
    answer:
      "IP-based inbox providers share IPs among multiple users, increasing the risk of blacklisting. Our service provides dedicated, isolated infrastructure for each client.",
  },
  {
    question: "How long do I need to warm the inboxes up for?",
    answer:
      "We recommend a 3-week warmup period before you start sending cold emails.",
  },
  {
    question: "How long will it take to get everything set up?",
    answer: "Everything would get delivered in less than 72 hours.",
  },
  {
    question: "If accounts get disconnected do you handle that?",
    answer:
      "Yes, we handle all technical issues including disconnections at any point in time.",
  },
  {
    question: "Is there any flexibility on pricing?",
    answer:
      "Yes, we offer flexible pricing based on the specific needs and scale of your campaigns. Let's discuss your requirements, and we can work out a plan that fits.",
  },
  {
    question: "What Sending tools do you integrate with?",
    answer:
      "We integrate with all major cold email platforms: Smartlead, Instantly, Lemlist, Pipl, Reply.io, and similar tools. Our inboxes work seamlessly with any tool that supports OAuth.",
  },
  {
    question: "What happens when and if an account burns down?",
    answer:
      "We have a free replacement policy - if an inbox gets burned, we'll replace it at no cost (just cover domain costs if new domains are needed).",
  },
  {
    question: "What's included in the service?",
    answer:
      "Everything you need: complete DFY inbox setup, technical configuration, domain management, custom tracking domains, warmup configuration, platform import, and ongoing support.",
  },
];

const domainFaqs: FaqItemData[] = [
  {
    question: "Can I bring domains I currently own to Inbox Navigator?",
    answer:
      "Yes, you can use your existing domains without any extra fees. Just make sure they aren't connected with any existing Google Workspace or Microsoft 365 account.",
  },
  {
    question: "Can I use my current domains?",
    answer:
      "Yes, but be aware that previously used domains may have reputation issues or low deliverability which can carry over to your brand new infrastructure.",
  },
  {
    question: "Can I use my primary domain for outreach?",
    answer:
      "We recommend using secondary domains to protect your primary domain's reputation. This strategy helps mitigate risks associated with cold outreach.",
  },
  {
    question: "Do I own the domains I purchase from Inbox Nav?",
    answer:
      "Yes, you have full ownership of any domains purchased through us.",
  },
  {
    question: "How do I pay for domains?",
    answer:
      "You can buy domain credits, 1 credit = 1 .com domain. Domain credits don't expire, and you can redeem them anytime.",
  },
  {
    question: "What does your domain setup service include?",
    answer:
      "We handle all aspects: configuring domains, SPF, DMARC, and DKIM records, custom domain tracking, and domain forwarding.",
  },
  {
    question: "Which platforms do you support for domain setup?",
    answer: "We support all domain providers, we don't discriminate.",
  },
];

const outlookFaqs: FaqItemData[] = [
  {
    question: "Are these reseller inboxes?",
    answer:
      "No, these are not reseller inboxes. They're built specifically for you, giving you dedicated access and control with no shared infrastructure.",
  },
  {
    question: "Do I get a dedicated IP?",
    answer:
      "Yes, every single order comes with a dedicated IP and an individual tenant, so there is absolutely no sharing with other customers. Your sending reputation stays completely isolated, which means what other senders do can never impact your deliverability. This is one of the key reasons our inboxes consistently outperform shared infrastructure providers.",
  },
  {
    question: "Do you import them into my sending platform?",
    answer:
      "Yes, we take care of that for you, ensuring a smooth integration with your sending platform.",
  },
  {
    question: "For Outlook, what all do we get?",
    answer:
      "You get the full package: technical setup, inbox and user creation, account import, and ongoing management. Basically, we handle everything.",
  },
  {
    question: "How much of my stack should be Outlook-based?",
    answer:
      "It depends on who you're targeting. If you're focusing on larger companies, 30-40% Outlook inboxes is ideal. For SMBs or startups, a lower percentage works fine.",
  },
  {
    question: "What is a tenant in Microsoft?",
    answer:
      "A tenant is essentially the environment or workspace where your inboxes live. It's tied to an IP address, and its reputation directly affects your deliverability.",
  },
];

const faqTabs = [
  { key: "general", label: "General", items: generalFaqs },
  { key: "domains", label: "Domains", items: domainFaqs },
  { key: "outlook", label: "Outlook", items: outlookFaqs },
];

export default function FaqSection() {
  const [activeTab, setActiveTab] = useState("general");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const currentFaqs =
    faqTabs.find((t) => t.key === activeTab)?.items ?? generalFaqs;

  return (
    <>
      <div className="faq-tabs">
        {faqTabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => {
              setActiveTab(tab.key);
              setOpenIndex(null);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {faqTabs.map((tab) => (
        <div
          key={tab.key}
          className={`faq-panel${activeTab === tab.key ? " active" : ""}`}
          id={`faq-${tab.key}`}
        >
          {tab.items.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={activeTab === tab.key && openIndex === i}
              onToggle={() =>
                setOpenIndex((prev) =>
                  activeTab === tab.key && prev === i ? null : i
                )
              }
            />
          ))}
        </div>
      ))}
    </>
  );
}
