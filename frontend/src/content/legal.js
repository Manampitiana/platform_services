import { site } from '../config/site'

const contact = `${site.legalName} (${site.email}, ${site.address})`

export const legal = {
  terms: {
    title: 'Terms of service',
    description: `The terms that apply when you use ${site.name}.`,
    updated: 'October 2026',
    intro: `These terms govern your use of ${site.name} and the services you order through it. By creating an account or placing an order, you accept them.`,
    sections: [
      {
        id: 'services',
        title: '1. Our services',
        body: [
          'We provide digital creation services such as CV design, logo design, website creation and custom projects. Each service page describes what is included, the starting price, the estimated delivery time and the number of revisions.',
          'Delivery times are estimates and start once payment is confirmed and we have received all the information we need from you.',
        ],
      },
      {
        id: 'account',
        title: '2. Your account',
        body: [
          'You must provide accurate information and verify your email address. You are responsible for keeping your password confidential and for all activity under your account.',
        ],
      },
      {
        id: 'orders',
        title: '3. Orders and quotes',
        body: [
          'Fixed-price packages are ordered at the price shown. For custom projects, we send a quote that is valid until the date shown on it. A quote that has expired or been replaced by a newer version can no longer be accepted.',
          'An order starts once your payment has been verified by our team.',
        ],
      },
      {
        id: 'payments',
        title: '4. Prices and payment',
        body: [
          'Prices are shown in Malagasy Ariary (MGA) unless stated otherwise. You pay using the methods listed on your order and provide a transaction reference or proof of payment. We confirm payments manually.',
        ],
      },
      {
        id: 'revisions',
        title: '5. Delivery and revisions',
        body: [
          'We deliver your work through your order page. Each package includes a limited number of revisions. Requests beyond that number may be quoted separately.',
          'Please review each delivery promptly. You can approve it or request a revision.',
        ],
      },
      {
        id: 'ip',
        title: '6. Intellectual property',
        body: [
          'Once your order is fully paid and approved, you receive the rights to use the final deliverables for the purpose agreed. We may reuse generic, non-confidential elements of our work and may show finished projects in our portfolio unless you ask us not to.',
          'You confirm that the content you send us (texts, images, logos) is yours to use or that you have permission to use it.',
        ],
      },
      {
        id: 'conduct',
        title: '7. Acceptable use',
        body: [
          'You agree not to use the platform for unlawful purposes, to upload harmful files, or to attempt to access other users’ data.',
        ],
      },
      {
        id: 'liability',
        title: '8. Liability',
        body: [
          'We do our best to deliver quality work on time. To the extent permitted by law, our liability is limited to the amount you paid for the order concerned.',
        ],
      },
      {
        id: 'changes',
        title: '9. Changes and contact',
        body: [
          'We may update these terms. The date of the latest update is shown at the top of this page. For any question, contact ' + contact + '.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy policy',
    description: `How ${site.name} collects, uses and protects your personal data.`,
    updated: 'October 2026',
    intro: `${site.name} respects your privacy. This policy explains what data we collect, why, and the choices you have.`,
    sections: [
      {
        id: 'data',
        title: '1. Data we collect',
        body: [
          'Account data: name, email address, phone number (optional) and password (stored in hashed form).',
          'Order data: the brief you fill in, files you upload, messages, quotes and payment details such as the transaction reference and any proof of payment.',
          'Technical data: IP address and browser information, used for security and to prevent abuse.',
        ],
      },
      {
        id: 'use',
        title: '2. How we use it',
        body: [
          'To create your account, process and deliver your orders, verify payments, communicate with you about your orders, and keep the platform secure.',
        ],
      },
      {
        id: 'sharing',
        title: '3. Who can see your data',
        body: [
          'Your files and order details are only accessible to you and our team. We do not sell your data. We only share it with service providers needed to run the platform (for example email and hosting providers), under appropriate safeguards, or when the law requires it.',
        ],
      },
      {
        id: 'storage',
        title: '4. Storage and security',
        body: [
          'Files are stored privately and are not publicly accessible. We apply technical measures such as encrypted connections, access controls and regular backups. No system is perfectly secure, so please use a strong, unique password.',
        ],
      },
      {
        id: 'retention',
        title: '5. How long we keep it',
        body: [
          'We keep your data for as long as your account is active and as needed to meet legal and accounting obligations. You can ask us to delete your account and data, subject to those obligations.',
        ],
      },
      {
        id: 'rights',
        title: '6. Your rights',
        body: [
          'You can access and update your information from your profile. You can also ask us to export, correct or delete your data by contacting us.',
        ],
      },
      {
        id: 'cookies',
        title: '7. Cookies',
        body: [
          'We use essential cookies to keep you signed in and to protect your session. We do not use advertising cookies.',
        ],
      },
      {
        id: 'contact',
        title: '8. Contact',
        body: ['For any privacy question, contact ' + contact + '.'],
      },
    ],
  },

  refunds: {
    title: 'Refund policy',
    description: 'When and how refunds are possible.',
    updated: 'October 2026',
    intro: 'We want you to be satisfied. This policy explains when a refund is possible. Please confirm these rules match your business before publishing.',
    sections: [
      {
        id: 'before',
        title: '1. Before production starts',
        body: [
          'If you cancel before production has started, you can ask for a full refund of the amount paid.',
        ],
      },
      {
        id: 'after',
        title: '2. After production has started',
        body: [
          'Once work has begun, the amount already paid covers the work carried out. A partial refund may be granted depending on how much work has been done.',
        ],
      },
      {
        id: 'revisions',
        title: '3. Revisions come first',
        body: [
          'If you are not satisfied with a delivery, please use the revisions included in your package. We will work with you to reach the expected result.',
        ],
      },
      {
        id: 'fault',
        title: '4. If we cannot deliver',
        body: [
          'If we are unable to deliver what was agreed, you will receive a refund of the amount paid for the undelivered work.',
        ],
      },
      {
        id: 'custom',
        title: '5. Custom projects',
        body: [
          'For custom projects, payment terms are described in the accepted quote and take precedence over this page.',
        ],
      },
      {
        id: 'how',
        title: '6. How to request a refund',
        body: [
          'Send us a message from your order page or contact ' + contact + '. Approved refunds are paid using the same method as your payment, within a reasonable delay.',
        ],
      },
    ],
  },
}