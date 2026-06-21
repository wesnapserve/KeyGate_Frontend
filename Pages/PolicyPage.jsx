import PublicLayout from './PublicLayout';
import { company } from './marketingContent';

const policies = {
  terms: {
    title: 'Terms and Conditions',
    path: '/terms-and-conditions',
    sections: [
      ['Acceptance of terms', `By accessing or using ${company.name}, you agree to these Terms and Conditions. If you do not agree, do not use the service.`],
      ['Service description', `${company.name} provides an API governance platform that helps users create and manage subkeys for controlled API access sharing, including revocation, token limits, rate limits, logs, and analytics.`],
      ['Accounts and security', 'You are responsible for maintaining the confidentiality of your login credentials, master API keys, generated subkeys, workspace access, and all activity under your account.'],
      ['Acceptable use', 'You must not use the service for unlawful activity, abuse of upstream API providers, credential theft, spam, security attacks, or attempts to bypass provider terms.'],
      ['Subscriptions and billing', 'Paid plans are billed according to the selected plan shown at checkout. Subscription status and access limits may be updated after successful payment confirmation.'],
      ['Limitation of liability', 'The service is provided on an as-is and as-available basis. To the maximum extent permitted by law, we are not liable for indirect, incidental, consequential, or business interruption damages.'],
      ['Contact', `Questions about these terms can be sent to ${company.supportEmail}.`],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    path: '/privacy-policy',
    sections: [
      ['Information we collect', 'We may collect account details, authentication identifiers, workspace and project metadata, billing identifiers, request logs, usage metrics, and support communications.'],
      ['API keys and subkeys', 'Master keys and subkey material are used only to provide the service. Sensitive key material should be encrypted or tokenized where stored by the application backend.'],
      ['How we use information', 'We use information to authenticate users, provide API gateway functionality, enforce limits, show analytics, process billing, prevent abuse, and respond to support requests.'],
      ['Payment data', 'Payments are processed by Razorpay. We do not intentionally store full card numbers or bank account credentials. Razorpay may process payment information under its own policies.'],
      ['Sharing', 'We do not sell personal information. We may share information with service providers required for hosting, authentication, analytics, payments, security, or legal compliance.'],
      ['Retention', 'We retain account, billing, and usage information as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce agreements.'],
      ['Your choices', `You may request access, correction, or deletion of eligible personal information by contacting ${company.supportEmail}.`],
    ],
  },
  refund: {
    title: 'Refund and Cancellation Policy',
    path: '/refund-and-cancellation-policy',
    sections: [
      ['Cancellation', 'You may cancel a paid subscription by contacting support or using available billing controls in the product. Cancellation prevents future renewals where supported by the payment provider.'],
      ['Refund eligibility', 'Refunds may be considered for duplicate payments, accidental charges, failed provisioning, or other genuine billing errors reported within 7 days of payment.'],
      ['Non-refundable usage', 'Fees for periods where the service was actively used, consumed, or provisioned may be non-refundable unless required by law or caused by a confirmed billing error.'],
      ['Processing time', 'Approved refunds are initiated to the original payment method through Razorpay or the applicable payment provider. Bank or card network timelines may vary.'],
      ['How to request', `Send refund or cancellation requests to ${company.supportEmail} with your account email, payment date, amount, and reason.`],
    ],
  },
  shipping: {
    title: 'Shipping / Delivery Policy',
    path: '/shipping-delivery-policy',
    sections: [
      ['Digital delivery', `${company.name} is a software-as-a-service product. No physical goods are shipped.`],
      ['Activation timeline', 'Free access is available after account sign-in. Paid plan limits are activated after successful payment confirmation and subscription verification.'],
      ['Delivery method', 'Service access is delivered online through the web console and API endpoints. Account and billing updates may be delivered by email or in-app notifications.'],
      ['Delivery issues', `If paid features are not enabled after successful payment, contact ${company.supportEmail} with your payment ID and account email.`],
      ['Geographic availability', 'The service is delivered over the internet. Availability may depend on hosting providers, payment support, sanctions restrictions, and upstream API provider availability.'],
    ],
  },
};

export default function PolicyPage({ type }) {
  const policy = policies[type] || policies.terms;
  return (
    <PublicLayout compact>
      <article className='policy-page card'>
        <span className='eyebrow'>Legal</span>
        <h1>{policy.title}</h1>
        <p className='public-muted'>Last updated: {company.lastUpdated}</p>
        {policy.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      </article>
    </PublicLayout>
  );
}
