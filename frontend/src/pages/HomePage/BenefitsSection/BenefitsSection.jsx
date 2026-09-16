import React, { useState, useEffect } from 'react';
import './BenefitsSection.css';

import nhapImg from '../../../assets/nHAp.png';
import prebioticImg from '../../../assets/prebiotic.png';
import swallowedImg from '../../../assets/Swallowed.png';
import chocoImg from '../../../assets/choco.png';

const fallbackImageMap = {
  'Stronger Enamel': nhapImg,
  'Microbiome Friendly': prebioticImg,
  'Safe if Swallowed': swallowedImg,
  'Kid-Approved': chocoImg,
};

export default function BenefitsSection() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBenefits = async () => {
      try {
        const response = await fetch('/api/benefits');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : data?.benefits || data?.data || [];

        if (isMounted) {
          setBenefits(list);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching benefits from /api/benefits:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBenefits();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && benefits.length === 0) {
    return null;
  }

  return (
    <section className="benefits-section py-5">
      <div className="container">
        <div className="row text-center g-4">
          {benefits.map((benefit) => {
            const imageSrc = benefit.image || benefit.image_url || fallbackImageMap[benefit.title];
            return (
              <div key={benefit.id} className="col-6 col-md-3 benefit-card">
                <img
                  src={imageSrc}
                  alt={benefit.title}
                  className="benefit-icon-img"
                  onError={(e) => {
                    if (fallbackImageMap[benefit.title] && e.target.src !== fallbackImageMap[benefit.title]) {
                      e.target.src = fallbackImageMap[benefit.title];
                    }
                  }}
                />
                <h5>{benefit.title}</h5>
                <p>{benefit.desc || benefit.desc_text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
