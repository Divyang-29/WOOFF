import { useState } from 'react';
import { API_ENDPOINTS } from '../../api';
import Banner from '../../components/Banner/Banner';
import './ContactUs.css';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitted(false);
    setErrorMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit contact message. Please try again.');
      }

      setIsSubmitting(false);
      setSubmitted(true);
      setErrorMessage('');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setIsSubmitting(false);
      setSubmitted(false);
      setErrorMessage(error.message || 'Unable to connect to the server. Please check your connection and try again.');
    }
  };

  const handleReset = () => {
    setIsSubmitting(false);
    setSubmitted(false);
    setErrorMessage('');
  };

  return (
    <>
      <Banner
        title="Contact Us"
        breadcrumb="HOME / CONTACT US"
      />
      <section className="contact-page-section">
        <div className="container contact-container">
          <div className="row g-5 align-items-start">
          {/* Left Column: Contact Info */}
          <div className="col-12 col-lg-5 contact-info-col">
            <div className="contact-badge-wrapper mb-3">
              <span className="contact-mini-badge">
                <i className="fas fa-paw me-2"></i> WE'D LOVE TO HEAR FROM YOU
              </span>
            </div>

            <h1 className="contact-title mb-3">Let's Chat!</h1>

            <p className="contact-description mb-4">
              Have questions about our prebiotic oral care formulas, order updates, wholesale partnerships,
              or just want to say hi? The Wooff pack is always here with tail-wagging excitement to help your family smile brighter.
            </p>

            {/* Contact Details List */}
            <div className="contact-details-list d-flex flex-column gap-3 mb-4">
              {/* Support Email */}
              <a
                href="mailto:support@wooffkids.com"
                className="contact-detail-card d-flex align-items-center text-decoration-none"
              >
                <div className="contact-icon-box">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-detail-text">
                  <span className="contact-detail-label">Support Email</span>
                  <span className="contact-detail-value">support@wooffkids.com</span>
                </div>
              </a>

              {/* Press Inquiries */}
              <a
                href="mailto:press@wooffkids.com"
                className="contact-detail-card d-flex align-items-center text-decoration-none"
              >
                <div className="contact-icon-box">
                  <i className="fas fa-newspaper"></i>
                </div>
                <div className="contact-detail-text">
                  <span className="contact-detail-label">Press & Partnerships</span>
                  <span className="contact-detail-value">press@wooffkids.com</span>
                </div>
              </a>

              {/* Customer Care Hours */}
              <div className="contact-detail-card d-flex align-items-center">
                <div className="contact-icon-box">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="contact-detail-text">
                  <span className="contact-detail-label">Response Time</span>
                  <span className="contact-detail-value">Mon – Fri (Within 24 Hours)</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="contact-social-wrapper pt-2">
              <h5 className="contact-social-heading mb-3">Follow The Pack</h5>
              <div className="d-flex flex-wrap gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Wooff on Instagram"
                  className="contact-social-btn"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Wooff on TikTok"
                  className="contact-social-btn"
                >
                  <i className="fab fa-tiktok"></i>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Wooff on Facebook"
                  className="contact-social-btn"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Wooff on Twitter"
                  className="contact-social-btn"
                >
                  <i className="fab fa-x-twitter"></i>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Wooff on YouTube"
                  className="contact-social-btn"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="col-12 col-lg-7 contact-form-col">
            <div className="contact-form-card">
              {submitted ? (
                <div className="contact-success-state text-center py-4">
                  <div className="contact-success-icon mb-3">
                    <i className="fas fa-bone"></i>
                  </div>
                  <h3 className="contact-form-title mb-2">Message Sent!</h3>
                  <p className="contact-form-subtitle mb-4">
                    Thanks for barking our way! We’ve safely received your message and our team will get back to you with tail-wagging speed.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-wooff-primary"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h2 className="contact-form-title mb-2">Send Us a Message</h2>
                    <p className="contact-form-subtitle mb-0">
                      Fill in the form below and we'll sniff out a helpful response for you right away.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="contact-form-error mb-4" role="alert">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    {/* Full Name Field */}
                    <div className="mb-3">
                      <label htmlFor="contact-name" className="contact-form-label">
                        Full Name <span className="contact-required">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Sarah Jenkins"
                        className="contact-form-input"
                        required
                      />
                    </div>

                    {/* Email Address Field */}
                    <div className="mb-3">
                      <label htmlFor="contact-email" className="contact-form-label">
                        Email Address <span className="contact-required">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. sarah@example.com"
                        className="contact-form-input"
                        required
                      />
                    </div>

                    {/* Subject Field */}
                    <div className="mb-3">
                      <label htmlFor="contact-subject" className="contact-form-label">
                        Subject <span className="contact-required">*</span>
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g. Question about Starter Smile Bundle"
                        className="contact-form-input"
                        required
                      />
                    </div>

                    {/* Message Field */}
                    <div className="mb-4">
                      <label htmlFor="contact-message" className="contact-form-label">
                        Message <span className="contact-required">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us what's on your mind..."
                        className="contact-form-textarea"
                        required
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="d-flex justify-content-start">
                      <button
                        type="submit"
                        className="btn-wooff-primary contact-submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <i className="fas fa-paper-plane ms-2"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
