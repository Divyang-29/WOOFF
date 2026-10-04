import React from 'react';
import './ComparisonSection.css';

export default function ComparisonSection() {
  const comparisonRows = [
    { feature: 'Biologic Dentist Developed', wooff: true, traditional: false },
    { feature: 'Prebiotics + Natural Vitamins', wooff: true, traditional: false },
    { feature: 'Balances Oral Microbiome', wooff: true, traditional: false },
    { feature: '100% Safe if Swallowed', wooff: true, traditional: false },
    { feature: 'Fluoride & SLS Free', wooff: true, traditional: false },
    { feature: 'Xylitol', wooff: true, traditional: false },
    { feature: 'Dye & Artificial Additive Free', wooff: true, traditional: false },
    { feature: 'Natural Theobromine & nHAp', wooff: true, traditional: false },
    { feature: 'Delicious Kid-Approved Flavours', wooff: true, traditional: false },
    { feature: 'Long-Lasting Freshness of Breath', wooff: true, traditional: false },
    { feature: 'Remineralizes Enamel & Fights Cavities', wooff: true, traditional: false },
  ];

  return (
    <section className="comparison-section py-5">
      <div className="container">
        <div className="text-center max-w-700 mx-auto mb-4 mb-md-5">
          <h2 className="section-title">Why Wooff is Better</h2>
          <p className="section-subtitle mt-2">
            See how Wooff's advanced biological formula with Theobromine and nHAp compares to traditional toothpaste.
          </p>
        </div>

        {/* Exact Revitin-Style Table with Open Top-Left Corner */}
        <div className="comparison-table-card mx-auto">
          <div className="table-responsive-wrapper">
            <table className="compare-table">
              <thead>
                <tr className="header-tr">
                  <th className="th-blank"></th>
                  <th className="th-wooff">Wooff</th>
                  <th className="th-traditional">Traditional Toothpaste</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr key={index}>
                    <td className="td-feature">{row.feature}</td>
                    <td className="td-wooff">
                      <div className="badge-check">
                        <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.5 5L4.5 8L11.5 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </td>
                    <td className="td-traditional">
                      <div className="badge-empty"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
