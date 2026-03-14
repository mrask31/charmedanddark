"use client";

const faqs = [
  { question: 'Is it really free?', answer: 'Yes—joining is free. Purchases are separate.' },
  { question: 'How does Sanctuary pricing work?', answer: 'Two prices appear. Members unlock the Sanctuary Price automatically.' },
  { question: 'Do I have to buy anything?', answer: 'No. Membership simply unlocks access and pricing.' },
  { question: 'What is The Mirror?', answer: 'A private reflection and recommendation experience—quiet, personal, and on-brand.' },
  { question: 'When is checkout live?', answer: 'Soon. Sanctuary members will be first to know.' },
];

export default function FaqSection() {
  return (
    <section style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <p
        className="mb-8 text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
      >
        FAQ
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {faqs.map((faq) => (
          <article
            key={faq.question}
            className="flex flex-col gap-3 transition-shadow duration-300"
            style={{
              backgroundColor: '#0e0e1a',
              border: '1px solid rgba(201, 169, 110, 0.2)',
              borderRadius: '0px',
              padding: '28px 24px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(201, 169, 110, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '20px',
                color: '#e8e4dc',
                fontWeight: 400,
              }}
            >
              {faq.question}
            </h3>
            <p
              className="font-light"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                color: 'rgba(232, 228, 220, 0.55)',
                lineHeight: 1.8,
              }}
            >
              {faq.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
