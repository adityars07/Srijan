import React, { useState } from 'react';
import { Plus, ArrowUpRight } from 'lucide-react';
import { FAQS } from '../../data/faqs';

interface FAQSectionProps {
  onContactClick: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onContactClick }) => {
  const [openId, setOpenId] = useState<string>('faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-layout-grid">
          {/* Left Intro Column */}
          <div className="faq-intro-col">
            <div className="section-eyebrow">Studio Knowledge</div>
            <h2 className="section-title" style={{ marginBottom: '18px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#746D66', lineHeight: 1.6, marginBottom: '28px' }}>
              Have questions about how we handle delicate ceramics, custom botanical resin casting, or bespoke anniversary orders? We’ve outlined the key details here.
            </p>

            <div>
              <button className="see-all-link" onClick={onContactClick}>
                <span>Ask Rakhi a Question</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="faq-list">
            {FAQS.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleAccordion(item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-number-label">{item.number}</span>
                    <span className="faq-question-title">{item.question}</span>
                    <span className="faq-toggle-icon">
                      <Plus size={16} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
