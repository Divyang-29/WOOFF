import React, { useState, useEffect } from 'react';
import Banner from '../../components/Banner/Banner';
import './FAQ.css';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFaqs = async () => {
      try {
        const response = await fetch('/api/faqs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : data?.faqs || data?.data || [];
        if (isMounted) {
          setFaqs(list);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching FAQs from /api/faqs:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <Banner breadcrumb="HOME / FAQS" title="FAQs" />

      <div className="container faq-container">
        <div className="faq-list">
          {loading && faqs.length === 0 ? (
            <div className="text-center py-5">
              <p>Loading FAQs...</p>
            </div>
          ) : (
            faqs.map((faq, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={faq.id || index}
                  className={`faq-brutalist-card ${isActive ? 'active' : ''}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isActive}
                  >
                    <h3>{faq.question}</h3>
                    <span className="faq-icon">{isActive ? '−' : '+'}</span>
                  </button>

                  <div
                    className="faq-answer-wrapper"
                    style={{ maxHeight: isActive ? '500px' : '0px' }}
                  >
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
