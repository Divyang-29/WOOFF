import { useState, useEffect } from 'react';
import './CertificatesSection.css';

export default function CertificatesSection() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

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

        if (isMounted) {
          const formatted = list.map((cert) => ({
            _id: cert._id || cert.id || String(cert.slug || Math.random()),
            title: cert.title || 'Wooff Certificate',
            imageUrl: cert.imageUrl || cert.image_url || cert.image,
          }));
          setCertificates(formatted);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching certificates from /api/certificates:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCertificates();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && certificates.length === 0) {
    return null;
  }

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
            />
          ))}
          {/* Second set (Duplicates for the infinite loop) */}
          {certificates.map((cert) => (
            <img
              key={`${cert._id}-duplicate`}
              src={cert.imageUrl}
              alt={cert.title}
              className="certificate-logo duplicate-logo"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
