// Legal pages. DRAFT TEXT — must be reviewed by the company / a lawyer before launch.
// Later editable from the admin panel (see BACKEND.md).

import type { LegalPage } from "@/types/content";

const company = "Melamchi Tech";
const store = "TOPX Nepal";

export const legalPages: LegalPage[] = [
  {
    slug: "refund-policy",
    title: "Refund policy",
    description: `When and how ${store} refunds orders for game top-ups, gift cards, subscriptions and software.`,
    updated: "2026-11-15",
    sections: [
      {
        id: "summary",
        heading: "In short",
        bullets: [
          "If we can't deliver your order, you get a full refund.",
          "If a code or key we delivered doesn't work, we replace it or refund it.",
          "Digital products that were delivered correctly can't be returned.",
          "Refunds go back to the same eSewa, Khalti, IME Pay or bank account you paid from.",
        ],
      },
      {
        id: "full-refund",
        heading: "When you get a full refund",
        bullets: [
          "The product or package is out of stock after you paid.",
          "We could not deliver within 24 hours for a reason on our side.",
          "You were charged twice for the same order.",
          "A gift card code or licence key we delivered is invalid and we cannot replace it.",
        ],
      },
      {
        id: "no-refund",
        heading: "When we can't give a refund",
        paragraphs: ["Digital products are delivered instantly and can't be taken back, so we can't refund when:"],
        bullets: [
          "The top-up was sent to the Player ID / account you entered, but the ID was wrong. Always double-check your ID before ordering.",
          "A code or key was delivered, works, and has been revealed or redeemed.",
          "A subscription was activated on the account you gave us.",
          "You changed your mind after delivery.",
        ],
      },
      {
        id: "how",
        heading: "How to ask for a refund",
        bullets: [
          "Message us on WhatsApp or through the Support page within 7 days of your order.",
          "Share your order number (or payment screenshot) and what went wrong.",
          "We reply within 24 hours. Approved refunds are usually sent the same working day.",
        ],
      },
      {
        id: "delays",
        heading: "Delays",
        paragraphs: [
          "Most orders arrive within minutes. Occasionally a game publisher or payment provider is slow. If your order is late, contact us — we will either complete it or refund it, your choice.",
        ],
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    description: `How ${store} collects, uses and protects your personal information.`,
    updated: "2026-11-15",
    sections: [
      {
        id: "who",
        heading: "Who we are",
        paragraphs: [`${store} is operated by ${company}, Kathmandu, Nepal. This policy explains what information we collect when you use our website or order from us, and how we use it.`],
      },
      {
        id: "collect",
        heading: "Information we collect",
        bullets: [
          "Contact details you give us: name, phone / WhatsApp number and email address.",
          "Order details: the product, package and the details needed to deliver it, such as a game Player ID, server or the email of the account to activate.",
          "Payment information: the payment method and transaction reference. We never see or store your eSewa, Khalti or bank passwords or PINs.",
          "Messages you send to our support team.",
          "Basic technical data such as browser type and pages visited, used to keep the site fast and secure.",
        ],
      },
      {
        id: "use",
        heading: "How we use it",
        bullets: [
          "To deliver your order and send you codes, keys or confirmations.",
          "To answer your questions and give support.",
          "To prevent fraud and keep your orders secure.",
          "To send offers only if you ask us to (for example “Get deal alerts”). You can stop them any time.",
        ],
      },
      {
        id: "share",
        heading: "Who we share it with",
        paragraphs: ["We never sell your personal information. We only share what is needed to complete your order with:"],
        bullets: [
          "Game publishers and official suppliers, to deliver top-ups and codes.",
          "Payment providers, to process and verify payments.",
          "Authorities, only when required by Nepali law.",
        ],
      },
      {
        id: "passwords",
        heading: "We never ask for passwords",
        paragraphs: ["We will never ask for your game, app or email password. If someone claiming to be us asks for it, do not share it and report it to us."],
      },
      {
        id: "storage",
        heading: "How long we keep it & security",
        paragraphs: [
          "We keep order records for as long as required for accounting and legal purposes, and delete or anonymise information we no longer need. Information is stored securely and only authorised staff can access it.",
          "The website stores only your light/dark theme choice in your browser. We don't use advertising cookies.",
        ],
      },
      {
        id: "rights",
        heading: "Your choices",
        paragraphs: ["You can ask us what information we hold about you, ask us to correct it, or ask us to delete it (unless we must keep it by law). Contact us using the details below."],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    description: `The terms for using the ${store} website and buying from us.`,
    updated: "2026-11-15",
    sections: [
      {
        id: "about",
        heading: "About these terms",
        paragraphs: [`These terms apply when you use the ${store} website or buy from ${store}, operated by ${company}, Kathmandu, Nepal. By placing an order you agree to them.`],
      },
      {
        id: "orders",
        heading: "Orders & prices",
        bullets: [
          "All prices are in Nepalese Rupees (NPR) and include any fees shown at checkout.",
          "An order is confirmed only after we confirm it and receive payment.",
          "Prices and availability can change; the price confirmed with your order is the price you pay.",
          "Deal prices apply only while the deal is running.",
        ],
      },
      {
        id: "delivery",
        heading: "Delivery",
        bullets: [
          "Top-ups and codes are usually delivered within minutes; subscriptions within the time shown on the product page.",
          "You are responsible for entering the correct Player ID, server or account email. Top-ups sent to a wrong ID can't be reversed.",
          "Gift cards and licences must match your account region where stated.",
        ],
      },
      {
        id: "use",
        heading: "Fair use",
        bullets: [
          "Do not use stolen payment methods, false information or our services for anything illegal.",
          "Do not resell our products without joining our reseller program.",
          "We may cancel and refund orders that look fraudulent.",
        ],
      },
      {
        id: "brands",
        heading: "Brands & trademarks",
        paragraphs: [
          `Product names, logos and brands (for example PUBG, Free Fire, Netflix, Google Play, Microsoft) belong to their owners. ${store} is an independent seller and is not affiliated with or endorsed by them unless stated.`,
        ],
      },
      {
        id: "liability",
        heading: "Our responsibility",
        paragraphs: [
          "We do our best to keep the site and deliveries running smoothly. If something goes wrong with an order, our responsibility is limited to completing the order or refunding what you paid for it, as described in our Refund policy.",
          "Game publishers and service providers may change or suspend their own services; we are not responsible for their decisions.",
        ],
      },
      {
        id: "law",
        heading: "Governing law & changes",
        paragraphs: [
          "These terms are governed by the laws of Nepal. We may update them from time to time; the date at the top shows the latest version.",
        ],
      },
    ],
  },
];
