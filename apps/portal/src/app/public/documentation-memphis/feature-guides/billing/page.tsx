import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { BillingAnimator } from "./billing-animator";

export const metadata = getDocMetadata("feature-guides/billing");

// --- Data ---------------------------------------------------------------

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Your Financial Command Center",
        description:
            "Billing is not a page you visit once and forget. It is the financial nerve center of your Splits Network account. Every subscription detail, every payment method, every invoice, every charge -- it all lives here. When a payment fails and your access is at risk, this is where you fix it. When your team outgrows the current plan, this is where you upgrade. When finance asks for a receipt from six months ago, this is where you find it. Treat billing like your dashboard for money.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Invoices And Receipts",
        description:
            "Every charge on your account generates an invoice. These invoices are stored permanently and available for download at any time. They include line items, tax breakdowns, payment method used, and transaction IDs that match your bank statement. For organizations that need to reconcile expenses against accounting systems or submit receipts for reimbursement, the invoice history is the single source of truth. No more hunting through email for Stripe receipts.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrow-up-right-dots",
        title: "Plan Flexibility",
        description:
            "Plans are not prisons. If your team grows, your plan should grow with it. If you need more seats, higher limits, or premium features, upgrades happen instantly with prorated billing so you only pay the difference. If you need to scale down, downgrades take effect at the next billing cycle. The platform handles the math -- proration, credits, and adjustments -- so you never overpay and you are never surprised by a bill.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Payment Security",
        description:
            "Your payment data never touches our servers. All payment processing runs through Stripe, which is PCI DSS Level 1 certified -- the highest level of payment security compliance. Card numbers are tokenized on entry and stored in Stripe's vault. When you see your card ending in 4242 on the billing page, that is a token reference, not your actual card data. You can add, remove, and update payment methods with confidence that your financial information is protected.",
    },
];

const planTiers = [
    {
        name: "Starter",
        icon: "fa-duotone fa-regular fa-seedling",
        description:
            "Built for solo recruiters and small agencies getting started on the platform. Starter gives you access to the core marketplace -- post roles, submit candidates, track applications, and close placements. Limits are generous enough for steady deal flow but designed to keep things simple. When you consistently hit the ceiling on seats or active roles, that is your signal to move up.",
        features: [
            "Up to 3 team seats",
            "25 active roles",
            "Basic analytics dashboard",
            "Email notifications",
            "Standard support response times",
        ],
        color: "info",
    },
    {
        name: "Professional",
        icon: "fa-duotone fa-regular fa-briefcase",
        description:
            "The plan most growing agencies land on. Professional removes the guardrails that hold Starter back and adds the tools that serious recruiting operations need. More seats, more roles, priority support, and advanced analytics that show you where your pipeline is strong and where it leaks. If you are billing clients and managing a team, Professional is the baseline.",
        features: [
            "Up to 15 team seats",
            "Unlimited active roles",
            "Advanced analytics and reporting",
            "Priority email and chat support",
            "Custom branding options",
            "API access for integrations",
        ],
        color: "warning",
    },
    {
        name: "Enterprise",
        icon: "fa-duotone fa-regular fa-building",
        description:
            "For organizations where recruiting is a revenue line, not an expense line. Enterprise gives you everything with no limits, plus dedicated support, custom integrations, SLA guarantees, and the ability to run the platform your way. If you process high volumes, operate across multiple regions, or have compliance requirements that demand white-glove service, Enterprise is the only plan that makes sense.",
        features: [
            "Unlimited seats",
            "Unlimited everything",
            "Dedicated account manager",
            "Custom SLA guarantees",
            "SSO and advanced security",
            "Custom API integrations",
            "Quarterly business reviews",
        ],
        color: "success",
    },
];

const paymentMethodSteps = [
    {
        number: "01",
        title: "Navigate To Billing Settings",
        description:
            "Open Settings from your sidebar and select Billing. The billing overview shows your current plan, next billing date, and active payment method. The Payment Methods section sits below the plan summary. If you are a Company Admin, you see all payment methods on the account. Team members with billing access see only the methods they added.",
        detail:
            "Only users with Billing Access or Company Admin role can view and manage payment methods. If you do not see the Billing option in Settings, ask your Company Admin to grant you billing permissions. This restriction exists to prevent unauthorized changes to financial settings.",
        tip: "Bookmark the billing page if you manage payments regularly. One click beats navigating through Settings every time.",
    },
    {
        number: "02",
        title: "Add A New Payment Method",
        description:
            "Click Add Payment Method. A secure form powered by Stripe appears inline. Enter your card details -- number, expiry, CVC, and billing address. The form validates in real time. Once submitted, the card is tokenized through Stripe and stored securely. The new card appears in your payment methods list immediately.",
        detail:
            "We accept Visa, Mastercard, and American Express. Some enterprise accounts can use ACH bank transfers or wire payments -- contact your account manager to set this up. Prepaid cards may be declined depending on the issuing bank. If your card is declined, the error message will indicate whether the issue is with the card itself or with the billing address verification.",
        tip: "Use a company card rather than a personal card for business subscriptions. When employees leave, you do not want billing disruptions because the card walked out the door with them.",
    },
    {
        number: "03",
        title: "Set A Default Payment Method",
        description:
            "If you have multiple payment methods on file, one must be designated as default. The default card is charged for subscription renewals, plan upgrades, and any automatic charges. Click the three-dot menu on any payment method and select Set as Default. The change takes effect immediately.",
        detail:
            "If your default payment method fails during a renewal attempt, the system will try each remaining payment method in the order they were added. If all methods fail, your account enters a grace period before access is restricted. Keeping a backup payment method on file is the simplest insurance against billing disruptions.",
        tip: "After adding a new card, set it as default immediately if it is replacing an expiring card. Do not wait until the old card fails at renewal.",
    },
    {
        number: "04",
        title: "Remove An Old Payment Method",
        description:
            "Click the three-dot menu on any payment method and select Remove. The card is deleted from Stripe's vault and no longer available for charges. You cannot remove the default payment method if it is the only one on file -- add a replacement first, set it as default, then remove the old card.",
        detail:
            "Removed cards cannot be recovered. If you remove a card by mistake, you will need to re-enter the full card details to add it back. Card removal does not affect past invoices -- those transactions are already processed and the card reference is retained in the invoice record for audit purposes.",
        tip: "When a team member leaves and their personal card was on file, replace it immediately. Do not discover this at renewal time.",
    },
];

const invoiceItems = [
    {
        icon: "fa-duotone fa-regular fa-receipt",
        title: "Invoice History",
        description:
            "Every charge generates an invoice. The Invoice History section shows all invoices in reverse chronological order -- most recent first. Each entry displays the invoice date, amount, status (paid, pending, failed), and a download link. Invoices are available in PDF format and include your organization name, billing address, line items, tax calculations, and the payment method used.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        title: "Finding A Specific Invoice",
        description:
            "Filter invoices by date range or status. If finance asks for all invoices from Q3, set the date range to July through September and export the results. If you are troubleshooting a failed payment, filter by Failed status to see which invoices need resolution. The search is instant -- even accounts with hundreds of invoices load in under a second.",
    },
    {
        icon: "fa-duotone fa-regular fa-download",
        title: "Downloading And Sharing",
        description:
            "Click the download icon on any invoice to get a PDF. The PDF is formatted for accounting submission with all required fields: invoice number, date, seller information, buyer information, line items with descriptions, subtotal, tax, and total. For bulk downloads, select multiple invoices and use the Export Selected option to get a ZIP file.",
    },
    {
        icon: "fa-duotone fa-regular fa-calculator",
        title: "Understanding Line Items",
        description:
            "Each invoice breaks down exactly what you are being charged for. Subscription fees show the plan name and billing period. Prorated charges from mid-cycle upgrades show the calculation: days remaining times daily rate. Credits from downgrades appear as negative line items. Taxes are calculated based on your billing address jurisdiction. Nothing is hidden -- every dollar has a line item.",
    },
];

const upgradeDowngradeSteps = [
    {
        number: "01",
        name: "Evaluate Your Needs",
        description:
            "Before changing plans, review your current usage against your plan limits. Are you consistently hitting seat limits? Do you need analytics features that your current plan does not include? Are support response times critical for your operation? The Usage section on the billing page shows exactly where you stand against each limit. Data-driven decisions beat guesswork.",
        who: "Company Admins and users with billing access",
        color: "info",
    },
    {
        number: "02",
        name: "Preview The Change",
        description:
            "Click Change Plan to see all available tiers side by side. Each tier shows its features, limits, and pricing. When you select a new plan, the system previews the financial impact before you confirm: the prorated credit for unused time on your current plan, the prorated charge for the new plan, and the net amount due today. For downgrades, you see the effective date and any features you will lose.",
        who: "Company Admins only",
        color: "warning",
    },
    {
        number: "03",
        name: "Confirm And Apply",
        description:
            "Review the preview and click Confirm. Upgrades apply immediately -- your new features, limits, and seats are available within seconds. Your default payment method is charged the prorated difference. Downgrades take effect at the end of the current billing cycle so you keep full access until you have paid for. Both actions generate an invoice documenting the change.",
        who: "Company Admins only",
        color: "success",
    },
    {
        number: "04",
        name: "Communicate The Change",
        description:
            "After a plan change, notify your team about what has changed. If you upgraded, new features or seats are available. If you downgraded, some features may become unavailable at cycle end. Team members do not receive automatic notifications about plan changes -- this is a manual communication step that prevents confusion.",
        who: "Company Admins and team leads",
        color: "secondary",
    },
];

const billingCycleItems = [
    {
        icon: "fa-duotone fa-regular fa-calendar-days",
        title: "Monthly Billing Cycles",
        description:
            "Most accounts operate on monthly billing cycles. Your cycle starts on the day you first subscribed and renews on the same day each month. If you subscribed on March 15th, you are billed on the 15th of every month. For months where the billing date does not exist (like February 30th), you are billed on the last day of the month. The billing page shows your exact next renewal date at all times.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-range",
        title: "Annual Billing",
        description:
            "Annual billing is available on Professional and Enterprise plans. You pay for 12 months upfront at a discounted rate -- typically 15-20% less than the monthly equivalent. Annual billing reduces administrative overhead (one invoice per year instead of twelve) and locks in your rate for the full term. The trade-off is that refunds on annual plans are prorated and may not be available after the first 30 days.",
    },
    {
        icon: "fa-duotone fa-regular fa-divide",
        title: "Proration Explained",
        description:
            "Proration ensures you only pay for what you use. When you upgrade mid-cycle, you receive a credit for the unused portion of your current plan and are charged the remaining portion of the new plan. The math is straightforward: daily rate times days remaining. The billing page shows the exact proration calculation before you confirm any plan change so there are no surprises.",
    },
    {
        icon: "fa-duotone fa-regular fa-rotate-left",
        title: "Renewal And Auto-Pay",
        description:
            "Subscriptions renew automatically using your default payment method. Three days before renewal, you receive an email reminder showing the upcoming charge amount. If you need to change your plan or update payment details, you have a window to act before the charge processes. Failed renewals trigger a retry sequence -- first at 24 hours, then at 72 hours, then final attempt at 7 days.",
    },
];

const failureResolutionSteps = [
    {
        number: "01",
        title: "Payment Fails",
        description:
            "When a charge is declined, you receive an immediate email notification with the failure reason. Common reasons include insufficient funds, expired card, card reported stolen, or bank-side fraud detection triggers. The billing page updates to show a warning banner with the failed amount and a Retry Payment button.",
        detail:
            "The failure notification includes the specific decline code from the card network. 'Insufficient funds' means what it says. 'Do not honor' is a generic bank rejection that requires calling your bank. 'Card not supported' means the card type is not accepted. Each code tells you exactly what to do next.",
        tip: "Check your email spam folder if you did not receive the failure notification. Some email providers flag Stripe payment notifications as promotional.",
    },
    {
        number: "02",
        title: "Grace Period Begins",
        description:
            "After a failed payment, your account enters a 7-day grace period. During this time, all features remain fully accessible. The system automatically retries the charge at 24 hours, 72 hours, and 7 days using your default payment method. If you have backup payment methods on file, the system tries those as well.",
        detail:
            "The grace period exists because most payment failures are temporary -- the bank flagged an unusual charge, the card was temporarily frozen, or a new card was not yet activated. Seven days gives you time to resolve the issue without losing access to active placements, messages, or applications.",
        tip: "Do not wait for automatic retries. If you know why the payment failed, fix the issue and click Retry Payment immediately. Relying on automatic retries wastes days.",
    },
    {
        number: "03",
        title: "Update Payment Method Or Retry",
        description:
            "If the card on file is the problem, add a new payment method and set it as default before retrying. If the card is fine but the bank blocked the charge, call your bank to authorize the transaction, then click Retry Payment. The retry button charges the exact failed amount to your current default payment method.",
        detail:
            "When you retry and the charge succeeds, the warning banner clears immediately, all notifications stop, and your billing cycle continues as if nothing happened. The failed attempt is recorded in your invoice history for audit purposes but has no financial impact.",
        tip: "If you added a new card specifically to resolve a failure, set it as default before clicking Retry. The retry charges the default method, not necessarily the newest one.",
    },
    {
        number: "04",
        title: "Access Restriction (If Unresolved)",
        description:
            "If all retry attempts fail and the grace period expires, your account enters restricted mode. Read-only access is maintained -- you can view your data, download invoices, and export records -- but you cannot create new roles, submit candidates, or send messages. The restriction lifts immediately when a successful payment is processed.",
        detail:
            "Restricted mode is designed to protect your data while encouraging resolution. Nothing is deleted. Your placements, candidates, applications, and messages are all preserved. The moment you resolve the payment, everything unlocks and you are back to full operation. There is no penalty or reactivation fee.",
        tip: "If you are in restricted mode and cannot resolve the payment issue yourself, contact support. There are options for temporary extensions and alternative payment arrangements for accounts in good standing.",
    },
];

const taxComplianceItems = [
    {
        icon: "fa-duotone fa-regular fa-landmark",
        title: "Tax Calculation",
        description:
            "Taxes are calculated automatically based on your billing address. For US accounts, state and local sales tax applies where required. For international accounts, VAT or GST is applied based on your country and the applicable tax treaty. The tax amount is shown as a separate line item on every invoice. If your organization is tax-exempt, upload your exemption certificate in billing settings and taxes are removed from future charges.",
    },
    {
        icon: "fa-duotone fa-regular fa-id-card",
        title: "Tax IDs And Business Information",
        description:
            "Add your Tax ID (EIN, VAT number, GST number) in billing settings. This information appears on your invoices and is required for some tax exemptions. The platform validates tax IDs in real time through Stripe's tax verification system. Invalid tax IDs are flagged immediately so you can correct them before they affect your invoices.",
    },
    {
        icon: "fa-duotone fa-regular fa-globe",
        title: "International Billing",
        description:
            "The platform bills in USD by default. International customers see their local currency equivalent on invoices for reference, but charges process in USD. Your bank applies the exchange rate at the time of the transaction. For Enterprise accounts, billing in local currency (EUR, GBP, AUD, CAD) can be arranged through your account manager.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-certificate",
        title: "Compliance Documentation",
        description:
            "For organizations that need compliance documentation -- SOC 2 reports, data processing agreements, or security questionnaires -- these are available through billing settings or your account manager. Stripe provides PCI compliance documentation. The platform provides data handling and privacy documentation. Together, they satisfy most enterprise procurement requirements.",
    },
];

const usageLimitItems = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Seat Usage",
        description:
            "The billing page shows how many team seats are in use versus your plan limit. If you are on a 15-seat Professional plan and have 13 active members, you know you have room for two more. When you hit the limit, the system prevents new member invitations until you upgrade or remove inactive members. Seat counts are based on active accounts, not pending invitations.",
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Active Role Limits",
        description:
            "Starter plans have a cap on active roles. The usage meter shows your current count against the limit. When you approach the cap, you receive a notification suggesting you close completed roles or upgrade your plan. Closed and archived roles do not count against the active limit -- only roles in Open or Paused status are counted.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-simple-high",
        title: "Usage Alerts",
        description:
            "The platform sends usage alerts at 80% and 95% of each limit. These alerts give you time to decide whether to upgrade, clean up unused resources, or accept the limit. Alerts go to all users with billing access and Company Admins. They include a direct link to the billing page so you can take action immediately without navigating through menus.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-bar",
        title: "Historical Usage Trends",
        description:
            "The Usage section includes a trend chart showing your seat and role usage over the past 12 months. This data helps you forecast when you will need to upgrade. If your seat usage grew from 5 to 12 in the past six months, you can predict when you will hit 15 and plan the upgrade proactively instead of reactively.",
    },
];

const notificationItems = [
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Payment Confirmations",
        description: "Receive an email after every successful charge. The confirmation includes the amount, invoice number, and a link to view or download the full invoice. Useful for expense tracking and real-time awareness of charges hitting your account.",
    },
    {
        icon: "fa-duotone fa-regular fa-triangle-exclamation",
        title: "Payment Failure Alerts",
        description: "Immediate notification when a charge is declined. Includes the decline reason, the amount that failed, and a direct link to update your payment method or retry the charge. These alerts go to all billing contacts, not just the account owner.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Renewal Reminders",
        description: "Three days before your subscription renews, you receive a reminder showing the upcoming charge amount and the payment method that will be used. This is your window to update payment details, change plans, or cancel before the charge processes.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge",
        title: "Usage Threshold Alerts",
        description: "Notifications at 80% and 95% of plan limits for seats, active roles, and other metered features. These alerts give you time to upgrade or optimize before you hit the wall. Includes direct links to the billing page for immediate action.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Plan Change Confirmations",
        description: "When an upgrade or downgrade is applied, all billing contacts receive a confirmation detailing what changed, the financial impact, and the effective date. For downgrades, the confirmation lists features that will become unavailable at the end of the current cycle.",
    },
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Card Expiration Warnings",
        description: "Thirty days before a card on file expires, you receive a warning to update your payment method. If the expiring card is your default, the urgency is higher. These warnings prevent the most common cause of payment failures -- expired cards that nobody remembered to replace.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Keep A Backup Payment Method",
        description:
            "Always have at least two payment methods on file. If your primary card is declined -- due to fraud prevention, expired card, or bank issues -- the system can fall back to the backup. This one step prevents most billing disruptions. The five minutes it takes to add a backup card saves hours of restricted access and scrambling.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-clock",
        title: "Review Billing Monthly",
        description:
            "Set a monthly reminder to check the billing page. Review the latest invoice for accuracy, check usage metrics against plan limits, and verify that the payment method on file is current. Monthly reviews catch issues early -- an unexpected charge, a creeping usage trend, or an expiring card -- before they become problems.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Designate Multiple Billing Contacts",
        description:
            "If only one person manages billing, a vacation, sick day, or departure creates a single point of failure. Add at least two people with billing access. Both receive payment notifications and can manage payment methods. When one person is unavailable, the other can handle billing issues without waiting or escalating.",
    },
    {
        icon: "fa-duotone fa-regular fa-folder-open",
        title: "Download Invoices Promptly",
        description:
            "After each billing cycle, download the invoice and store it in your organization's financial records. While invoices remain available on the platform indefinitely, having local copies in your accounting system ensures you are never dependent on platform access for financial documentation. This is especially important for tax preparation and audits.",
    },
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Right-Size Your Plan",
        description:
            "Paying for Enterprise when Professional meets your needs wastes money. Running Professional when you consistently hit Starter limits wastes time. Review your plan against actual usage quarterly. The right plan is the one where you are using 60-80% of the included capacity -- enough headroom for growth without paying for unused features.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice",
        title: "Reconcile Against Bank Statements",
        description:
            "Once a quarter, compare your platform invoices against your bank or credit card statement. The amounts should match exactly. If they do not, investigate immediately. Discrepancies usually result from currency conversion fees on international transactions or from charges that processed on a different date than expected.",
    },
];

const troubleshootItems = [
    {
        symptom: "Payment method fails to save",
        cause: "The card was declined by the issuing bank during the tokenization step. Common reasons include incorrect billing address, expired card, or the bank blocking online transactions.",
        fix: "Verify the card number, expiry date, CVC, and billing address are all correct. If the details are right, contact your bank to authorize online transactions with Stripe. Try a different card if the issue persists.",
    },
    {
        symptom: "Invoice shows unexpected amount",
        cause: "The invoice likely includes prorated charges from a mid-cycle plan change, or tax calculations that differ from the base subscription price.",
        fix: "Open the invoice detail view and review each line item. Prorated charges show the calculation method. Tax line items show the rate and jurisdiction. If a line item is genuinely wrong, contact support with the invoice number.",
    },
    {
        symptom: "Cannot change subscription plan",
        cause: "You do not have Company Admin or billing access permissions, or there is an outstanding failed payment that must be resolved before plan changes are allowed.",
        fix: "Check your role under Company Settings. If you have the right permissions but still cannot change plans, resolve any outstanding payment failures first. The system blocks plan changes while payments are in a failed state.",
    },
    {
        symptom: "Billing page is blank or not loading",
        cause: "The billing data is fetched from Stripe in real time. A blank page usually indicates a network issue or a temporary Stripe outage.",
        fix: "Refresh the page. If the issue persists, check status.stripe.com for outages. Clear your browser cache and try again. If the page remains blank after 15 minutes, contact support.",
    },
    {
        symptom: "Tax-exempt status is not applied",
        cause: "Your tax exemption certificate was not uploaded, or the uploaded certificate failed validation.",
        fix: "Go to Billing Settings and check the Tax Exemption section. Upload a valid exemption certificate. The system validates the document and applies the exemption to future invoices within 24 hours. Existing invoices are not retroactively adjusted.",
    },
    {
        symptom: "Downgrade removed features I still need",
        cause: "Downgrades take effect at the end of the billing cycle. If features disappeared immediately, there may be a system error.",
        fix: "Downgrades should not remove features until the current cycle ends. If features were removed early, contact support with your account details and the timestamp of the plan change. In the meantime, you can re-upgrade to restore access immediately.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/feature-guides/profile",
        icon: "fa-duotone fa-regular fa-user-gear",
        title: "Profile Settings",
        description: "Manage your account details, notification preferences, and team membership alongside your billing configuration.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/feature-guides/roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Roles Feature Guide",
        description: "Understand fee structures and role limits that connect directly to your billing plan and usage meters.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/placements",
        icon: "fa-duotone fa-regular fa-trophy",
        title: "Placements Feature Guide",
        description: "See how placement fees, payouts, and financial tracking connect to your billing and payment infrastructure.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// --- Page ---------------------------------------------------------------

export default function BillingFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/billing")} id="docs-feature-guides-billing-jsonld" />
            <BillingAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-[5px] border-warning opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-warning opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-warning opacity-0" />
                        {/* Dollar sign silhouette */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="32" height="32" viewBox="0 0 32 32">
                            <text x="4" y="26" fontSize="28" fontWeight="900" className="fill-warning" fontFamily="monospace">$</text>
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-warning" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-warning">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/feature-guides" className="text-base-content/50 transition-colors hover:text-warning">
                                        Feature Guides
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-warning">Billing</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-warning text-warning-content">
                                    <i className="fa-duotone fa-regular fa-credit-card"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Own Your{" "}
                                <span className="relative inline-block">
                                    <span className="text-warning">Money</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-warning" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                YOUR BILLING PAGE IS NOT AN AFTERTHOUGHT. It is where you control
                                your subscription, manage payment methods, download invoices,
                                track usage against plan limits, and resolve payment issues before
                                they disrupt your workflow. This guide covers every aspect of
                                billing on Splits Network -- from choosing the right plan to
                                handling failed payments to keeping your financial records clean.
                                If money moves through the platform, it starts here.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-user-tie text-warning"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building text-warning"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-warning"></i>
                                    Company Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BILLING OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Billing{" "}
                                    <span className="text-warning">Gives You</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Billing is not just about paying invoices. It is your control
                                    panel for subscriptions, payments, usage, and financial
                                    compliance. Everything financial flows through this page.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overviewCards.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-warning/30 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-warning">
                                            <i className={`${item.icon} text-lg text-warning-content`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    SUBSCRIPTION PLANS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Plans
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Subscription{" "}
                                    <span className="text-success">Plans</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Three tiers. Each one built for a different stage of your
                                    recruiting operation. Pick the one that matches where you
                                    are, not where you hope to be someday.
                                </p>
                            </div>

                            <div className="plan-container grid grid-cols-1 md:grid-cols-3 gap-6">
                                {planTiers.map((plan, index) => (
                                    <div
                                        key={index}
                                        className={`plan-card border-4 border-${plan.color}/30 bg-base-100 p-6 opacity-0`}
                                    >
                                        <div className={`w-12 h-12 flex items-center justify-center mb-4 bg-${plan.color}`}>
                                            <i className={`${plan.icon} text-lg text-${plan.color}-content`}></i>
                                        </div>
                                        <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-base-content">
                                            {plan.name}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70 mb-4">
                                            {plan.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, fi) => (
                                                <li key={fi} className="flex items-start gap-2 text-sm text-base-content/60">
                                                    <i className={`fa-duotone fa-regular fa-check text-${plan.color} mt-0.5`}></i>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PAYMENT METHODS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Payments
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Payment{" "}
                                    <span className="text-error">Methods</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Adding, managing, and rotating payment methods. Get this right
                                    and you never deal with a billing disruption.
                                </p>
                            </div>

                            <div className="payment-container space-y-6">
                                {paymentMethodSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="payment-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-error">
                                            <span className="text-2xl font-black text-error-content">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-error text-error-content text-sm font-black">
                                                    {step.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {step.description}
                                            </p>
                                            <p className="text-sm leading-relaxed text-base-content/50 mb-4">
                                                {step.detail}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-error/10 border-l-4 border-error">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-error mt-0.5"></i>
                                                <p className="text-sm text-base-content/60">
                                                    {step.tip}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    INVOICES AND HISTORY
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Invoices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Invoice History{" "}
                                    <span className="text-warning">And Downloads</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every dollar charged to your account has a paper trail.
                                    Find it, download it, reconcile it.
                                </p>
                            </div>

                            <div className="invoice-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {invoiceItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="invoice-card border-4 border-warning/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-warning">
                                            <i className={`${item.icon} text-lg text-warning-content`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    UPGRADES AND DOWNGRADES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Plan Changes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Upgrades And{" "}
                                    <span className="text-success">Downgrades</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your plan should match your operation. Here is how to change
                                    it without surprises, lost features, or unexpected charges.
                                </p>
                            </div>

                            <div className="upgrade-container space-y-4">
                                {upgradeDowngradeSteps.map((item) => (
                                    <div
                                        key={item.number}
                                        className="upgrade-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className={`hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-${item.color}`}>
                                            <span className={`text-2xl font-black text-${item.color}-content`}>
                                                {item.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`md:hidden inline-flex items-center justify-center w-8 h-8 bg-${item.color} text-${item.color}-content text-sm font-black`}>
                                                    {item.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {item.name}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {item.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-2 bg-base-200 border-l-4 border-base-content/20">
                                                <i className="fa-duotone fa-regular fa-eye text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {item.who}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BILLING CYCLES AND PRORATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Cycles
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Billing Cycles{" "}
                                    <span className="text-secondary">And Proration</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    How charges are calculated, when they hit, and why your
                                    invoice might show a different amount than you expected.
                                </p>
                            </div>

                            <div className="cycle-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {billingCycleItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="cycle-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-secondary">
                                            <i className={`${item.icon} text-xl text-secondary`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PAYMENT FAILURES AND RESOLUTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Failures
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Payment Failures{" "}
                                    <span className="text-error">And Resolution</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Payments fail. Cards expire, banks flag charges, funds run
                                    short. Here is exactly what happens and how to fix it fast.
                                </p>
                            </div>

                            <div className="failure-container space-y-6">
                                {failureResolutionSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="failure-card flex gap-6 border-4 border-error/20 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-error">
                                            <span className="text-2xl font-black text-error-content">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-error text-error-content text-sm font-black">
                                                    {step.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {step.description}
                                            </p>
                                            <p className="text-sm leading-relaxed text-base-content/50 mb-4">
                                                {step.detail}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-error/10 border-l-4 border-error">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-error mt-0.5"></i>
                                                <p className="text-sm text-base-content/60">
                                                    {step.tip}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    TAX AND COMPLIANCE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Tax
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Tax And{" "}
                                    <span className="text-warning">Compliance</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Taxes, exemptions, international billing, and the compliance
                                    documentation your procurement team keeps asking for.
                                </p>
                            </div>

                            <div className="tax-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {taxComplianceItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="tax-card border-4 border-warning/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-warning">
                                            <i className={`${item.icon} text-lg text-warning-content`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    USAGE TRACKING AND LIMITS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Usage
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Usage Tracking{" "}
                                    <span className="text-success">And Limits</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Know where you stand against your plan limits. Usage data
                                    tells you when to upgrade, when to clean up, and when
                                    you are right where you need to be.
                                </p>
                            </div>

                            <div className="usage-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {usageLimitItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="usage-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-success">
                                            <i className={`${item.icon} text-lg text-success-content`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Usage callout */}
                            <div className="mt-8 p-6 border-4 border-success bg-success/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                        <i className="fa-duotone fa-regular fa-lightbulb text-success-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            The 80% Rule
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            When you consistently use more than 80% of any plan
                                            limit, start evaluating the next tier. Upgrading
                                            proactively gives you headroom for growth. Upgrading
                                            reactively -- when you hit the wall and cannot invite
                                            a new team member or create a new role -- creates
                                            pressure and delays. Plan ahead. The billing page
                                            shows you the trend data to make this decision easy.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BILLING NOTIFICATIONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Notifications
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Billing{" "}
                                    <span className="text-secondary">Notifications</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The platform keeps you informed about every financial event.
                                    Here is what gets sent, when, and to whom.
                                </p>
                            </div>

                            <div className="notification-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notificationItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="notification-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-secondary">
                                            <i className={`${item.icon} text-xl text-secondary`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Best Practices For{" "}
                                    <span className="text-warning">Financial Management</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Six habits that separate organizations with clean billing
                                    from those that scramble every renewal cycle.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-warning/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-warning">
                                            <i className={`${item.icon} text-xl text-warning`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Trouble&shy;shooting
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Billing issue? Check here first.
                                    These are the problems we see most often.
                                </p>
                            </div>

                            <div className="trouble-container space-y-4">
                                {troubleshootItems.map((item, idx) => (
                                    <div key={idx} className="trouble-card border-4 border-error/15 bg-base-100 p-6 opacity-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-error">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-sm text-error-content"></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content pt-1">
                                                {item.symptom}
                                            </h3>
                                        </div>
                                        <div className="ml-11 space-y-2">
                                            <p className="text-sm text-base-content/60">
                                                <span className="font-bold text-base-content/80 uppercase text-xs tracking-wider">Likely cause:</span>{" "}
                                                {item.cause}
                                            </p>
                                            <p className="text-sm text-base-content/70">
                                                <span className="font-bold text-warning uppercase text-xs tracking-wider">Fix:</span>{" "}
                                                {item.fix}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    NEXT STEPS / RELATED
                   ══════════════════════════════════════════════════════════════ */}
                <section className="billing-cta relative py-20 overflow-hidden bg-base-100">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-warning" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-success" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-error" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-warning" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-warning text-warning-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-warning">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Your billing is sorted. Here are the features and workflows
                                    that connect to your financial setup.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {nextSteps.map((item, index) => {
                                    const a = accentMap[item.accent];
                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`group relative border-4 ${a.border} bg-base-100 transition-transform hover:-translate-y-1`}
                                        >
                                            <div className={`h-2 ${a.bg}`} />
                                            <div className="p-6">
                                                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${a.bg}`}>
                                                    <i className={`${item.icon} text-lg text-white`}></i>
                                                </div>
                                                <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-base-content">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-base-content/70">
                                                    {item.description}
                                                </p>
                                                <div className="mt-6 pt-4 border-t-2 border-base-content/10 flex items-center justify-between">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${a.text}`}>
                                                        Read Guide
                                                    </span>
                                                    <i className={`fa-solid fa-arrow-right text-sm ${a.text} transition-transform group-hover:translate-x-1`}></i>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
                                <Link
                                    href="/public/documentation-memphis/feature-guides"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-warning bg-warning text-warning-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-book-open"></i>
                                    All Feature Guides
                                </Link>
                                <Link
                                    href="/public/documentation-memphis"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-base-content text-base-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-book"></i>
                                    All Documentation
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </BillingAnimator>
        </>
    );
}
