import { useState, useEffect } from 'react';
import './CertificatesSection.css';

const FALLBACK_CERTIFICATES = [
  {
    _id: '1',
    title: 'FDA Registered Facility',
    imageUrl: '/assets/ce_certified.svg',
  },
  {
    _id: '2',
    title: 'GMP Certified',
    imageUrl: '/assets/gmp_certified.webp',
  },
  {
    _id: '3',
    title: 'Dentist Approved',
    imageUrl: '/assets/dr_approved.webp',
  },
  {
    _id: '4',
    title: '100% Toxin Free',
    imageUrl: '/assets/peta_approved.webp',
  },
];

export default function CertificatesSection() {
  const [certificates, setCertificates] = useState(FALLBACK_CERTIFICATES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCertificates = async () => {
      try {
        const response = await fetch('/api/certificates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : data?.certificates || data?.data || [];

        if (isMounted && list.length > 0) {
          const formatted = list.map((cert) => {
            let rawUrl = cert.imageUrl || cert.image_url || cert.image;
            if (rawUrl && typeof rawUrl === 'string') {
              if (rawUrl.startsWith('/') || rawUrl.includes('/assets/') || rawUrl.includes('/images/')) {
                rawUrl = rawUrl.replace(/\.(png|jpg|jpeg)$/i, '.webp');
              }
            }
            return {
              _id: cert._id || cert.id || String(cert.slug || Math.random()),
              title: cert.title || 'Wooff Certificate',
              imageUrl: rawUrl || '/assets/dr_approved.webp',
            };
          });
          setCertificates(formatted);
        }
      } catch (error) {
        console.error('Error fetching certificates from /api/certificates:', error);
      }
    };

    fetchCertificates();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="certificates-section">
      <div className="container-fluid px-0 px-md-5">
        <div className="certificates-wrapper">
          {/* First set (Original) */}
          {certificates.map((cert) => (
            <img
              key={cert._id}
              src={cert.imageUrl}
              alt={cert.title}
              className="certificate-logo"
              onError={(e) => {
                if (e.currentTarget.src.endsWith('.png')) {
                  e.currentTarget.src = e.currentTarget.src.replace(/\.png$/i, '.webp');
                }
              }}
            />
          ))}
          {/* Second set (Duplicates for the infinite loop) */}
          {certificates.map((cert) => (
            <img
              key={`${cert._id}-duplicate`}
              src={cert.imageUrl}
              alt={cert.title}
              className="certificate-logo duplicate-logo"
              onError={(e) => {
                if (e.currentTarget.src.endsWith('.png')) {
                  e.currentTarget.src = e.currentTarget.src.replace(/\.png$/i, '.webp');
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
