import React from 'react';
import { Link } from 'react-router-dom';
import './SinglePackEditorial.css';

export default function SinglePackEditorial() {
  return (
    <div className="single-pack-editorial-wrapper">

      {/* 1. Product Details at a Glance */}
      <section className="spe-section spe-glance-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Quick Specifications</span>
          <h2 className="spe-section-title">Product Details at a Glance</h2>
        </div>
        <div className="spe-table-responsive">
          <table className="spe-table">
            <thead>
              <tr>
                <th>Detail</th>
                <th>Wooff Kids Choco Toothpaste (Single Pack)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="spe-cell-label">Name on the pack</td>
                <td>Wooff Kids Choco Flavour Toothpaste</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Net quantity</td>
                <td>
                  50 g tube (also available as a{' '}
                  <Link to="/product/choco-toothpaste-pack-of-2" className="spe-link">
                    pack of two 50 g tubes
                  </Link>)
                </td>
              </tr>
              <tr>
                <td className="spe-cell-label">In the box</td>
                <td>One 50 g tube in its protective carton</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Age range</td>
                <td><strong>Above 2 years</strong> (supervised brushing)</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Flavour</td>
                <td>Natural chocolate, derived from cocoa extract (no sugar)</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Main active ingredients</td>
                <td><strong>2% Nano-hydroxyapatite + 2% Theobromine</strong> (printed on carton)</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Supporting ingredients</td>
                <td>Calcium gluconate, inulin prebiotics, vitamin C, lactoferrin, coenzyme Q10</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Free from</td>
                <td>Sugar, fluoride, SLS (sodium lauryl sulphate), parabens, artificial colours</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Directions</td>
                <td>Pea-sized amount, 2 minutes, morning and bedtime, with adult supervision</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. What Is Choco Toothpaste? */}
      <section className="spe-section spe-card-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Oral Care Science</span>
          <h2 className="spe-section-title">What Is Choco Toothpaste?</h2>
        </div>
        <div className="spe-prose-block">
          <p>
            Choco toothpaste, chocolate toothpaste and chocolate-flavoured toothpaste are three names for the same thing:
            toothpaste that tastes of chocolate instead of mint. The flavour changes how brushing tastes, not what brushing
            does. The toothbrush and the paste&apos;s cleaning ingredients remove plaque, and the paste is meant to be spat out,
            not eaten.
          </p>
          <p>
            Taste matters because many children find mint sharp or &ldquo;spicy&rdquo;. They fuss, spit within seconds or refuse
            to brush. A flavour they like makes it easier to build the oral hygiene habit that counts: two minutes of brushing,
            morning and night.
          </p>

          <div className="spe-callout-grid">
            <div className="spe-callout-card">
              <div className="spe-callout-icon">
                <i className="fa-solid fa-cookie-bite"></i>
              </div>
              <div className="spe-callout-text">
                <strong>Chocolate flavour isn&apos;t chocolate.</strong>
                <p>
                  Wooff Kids gets its taste from real cocoa extract and contains no sugar, so brushing doesn&apos;t leave sugar
                  on your child&apos;s teeth.
                </p>
              </div>
            </div>

            <div className="spe-callout-card">
              <div className="spe-callout-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="spe-callout-text">
                <strong>Flavour isn&apos;t protection.</strong>
                <p>
                  A chocolate taste doesn&apos;t prevent cavities, and no toothpaste cancels out frequent sweets, biscuits or
                  sugary drinks. Regular brushing and good habits matter most.
                </p>
              </div>
            </div>
          </div>

          <div className="spe-note-box mt-3">
            <span>Looking for what to look out for when buying? Read our </span>
            <Link to="/blog/chocolate-flavoured-toothpaste" className="spe-link fw-bold">
              guide to choosing a chocolate flavoured toothpaste &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Why Parents Choose Wooff Kids */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Parent Favorite</span>
          <h2 className="spe-section-title">Why Parents Choose Wooff Kids</h2>
        </div>
        <div className="spe-reasons-grid">
          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-face-smile"></i>
            </div>
            <h3>A taste children accept</h3>
            <p>Chocolate instead of mint, designed for children who find standard mint formulas sharp or resist brushing.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-eye"></i>
            </div>
            <h3>Ingredient amounts you can see</h3>
            <p>The front of the carton states exact percentages: 2% nano-hydroxyapatite and 2% theobromine.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <h3>Sugar-free &amp; fluoride-free</h3>
            <p>Also 100% free from SLS (foaming agents), parabens, and artificial colours or dyes.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-child"></i>
            </div>
            <h3>Made for young children</h3>
            <p>Labelled for children above 2 years with clear, practical directions for safe, supervised brushing.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-user-doctor"></i>
            </div>
            <h3>Founded by a dentist</h3>
            <p>Wooff Kids was founded by Dr. Shrushti Bhankhariya, a dentist who saw daily brushing battles firsthand.</p>
          </div>
        </div>
      </section>

      {/* 4. Ingredients and What the Research Shows */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Evidence &amp; Transparency</span>
          <h2 className="spe-section-title">Ingredients and What the Research Shows</h2>
        </div>
        <div className="spe-prose-block">
          <p className="spe-disclaimer-lead">
            Wooff Kids Choco Toothpaste is a cosmetic toothpaste, not a medicine. The research summarised below was done on
            individual ingredients, mostly in laboratories or in other toothpastes, not on Wooff Kids itself. Read it as the
            reason each ingredient is included, not as proof of what this tube will do.
          </p>
        </div>
        <div className="spe-table-responsive">
          <table className="spe-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Why it&apos;s included</th>
                <th>What the research shows</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="spe-cell-label">Nano-hydroxyapatite (2%)</td>
                <td>A synthetic form of the calcium-phosphate mineral that makes up most of tooth enamel, in very small (&ldquo;nano&rdquo;) particles.</td>
                <td>
                  One of the most-studied fluoride-free ingredients for preventing decay. In trials lasting up to 18 months,
                  hydroxyapatite toothpastes did no worse than fluoride toothpastes at limiting new decay in children and
                  adults. Most of those trials used about 10% hydroxyapatite in a larger-particle form, so their results
                  can&apos;t be assumed for a 2% formula.
                </td>
              </tr>
              <tr>
                <td className="spe-cell-label">Theobromine (2%)</td>
                <td>A natural compound found in cocoa.</td>
                <td>
                  Laboratory studies of whether it helps enamel take up minerals (remineralisation) have mixed results. Human
                  studies are few, small and short. It has not been shown to prevent cavities.
                </td>
              </tr>
              <tr>
                <td className="spe-cell-label">Calcium gluconate</td>
                <td>A water-soluble source of calcium.</td>
                <td>We found no published studies of calcium gluconate in toothpaste.</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Inulin</td>
                <td>A plant fibre known as a prebiotic.</td>
                <td>Prebiotic benefits are established for the gut. A benefit in the mouth hasn&apos;t been shown.</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Vitamin C (ascorbic acid)</td>
                <td>An antioxidant; the body needs vitamin C for healthy gums.</td>
                <td>Low vitamin C intake is linked with bleeding gums. Whether vitamin C in toothpaste adds a benefit hasn&apos;t been established.</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Lactoferrin</td>
                <td>A protein found naturally in saliva and milk.</td>
                <td>Slows the growth of some mouth bacteria in laboratory studies. In toothpaste, it has only been tested together with other enzymes and proteins.</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Coenzyme Q10</td>
                <td>An antioxidant.</td>
                <td>Tested as a gel alongside professional gum treatment in adults; a 2023 review could not establish its effect. Not studied in toothpaste.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="spe-claim-box mt-3">
          <strong>What we don&apos;t claim: </strong>
          <span>
            The research above is about ingredients, not about this toothpaste, so we don&apos;t claim that Wooff Kids prevents
            cavities, repairs enamel or treats gum problems. Its job is to clean your child&apos;s teeth with a taste that makes
            brushing easier. You can read more about each ingredient on our{' '}
            <Link to="/ingredients" className="spe-link fw-bold">
              ingredients page &rarr;
            </Link>
          </span>
        </div>
      </section>

      {/* 5. How to Use Wooff Kids Choco Toothpaste */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Directions</span>
          <h2 className="spe-section-title">How to Use Wooff Kids Choco Toothpaste</h2>
        </div>
        <div className="spe-routine-steps-grid">
          <div className="spe-step-card">
            <div className="spe-step-num">1</div>
            <h4>Pea-Sized Amount</h4>
            <p>Put a pea-sized amount on a soft-bristled toothbrush.</p>
          </div>

          <div className="spe-step-card">
            <div className="spe-step-num">2</div>
            <h4>Gentle Coverage</h4>
            <p>Gently brush every tooth surface: front, back and chewing surfaces.</p>
          </div>

          <div className="spe-step-card">
            <div className="spe-step-num">3</div>
            <h4>2 Full Minutes</h4>
            <p>Brush gently for two minutes by the clock or a song.</p>
          </div>

          <div className="spe-step-card">
            <div className="spe-step-num">4</div>
            <h4>Spit &amp; Rinse</h4>
            <p>Spit out excess paste into the sink, then rinse gently.</p>
          </div>

          <div className="spe-step-card">
            <div className="spe-step-num">5</div>
            <h4>Morning &amp; Bedtime</h4>
            <p>Brush once in the morning and once before bedtime.</p>
          </div>
        </div>
        <div className="spe-note-box mt-3 text-center">
          <span>Always brush with adult supervision. If your child still resists, check our </span>
          <Link to="/blog/choco-toothpaste" className="spe-link fw-bold">
            tips to make brushing fun &rarr;
          </Link>
        </div>
      </section>

      {/* 6. Age, Amount and Supervision */}
      <section className="spe-section spe-card-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Safety First</span>
          <h2 className="spe-section-title">Age, Amount and Supervision Guidelines</h2>
        </div>
        <div className="spe-prose-block">
          <p>
            Wooff Kids Choco Toothpaste is labelled for children above 2 years. A pleasant taste can tempt young children to
            swallow toothpaste or eat it from the tube, so these habits matter more than flavour:
          </p>
          <div className="spe-checklist-grid">
            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Control the amount: </strong>
                <span>Squeeze the pea-sized amount onto the brush yourself until your child can do it reliably.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Supervise by age: </strong>
                <span>Brush your child&apos;s teeth for them while they are under 3. From 3 to 6, watch them brush and help. From about 7, most can brush on their own.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Teach &ldquo;spit, don&apos;t swallow&rdquo;: </strong>
                <span>Teach spitting out from the very first brush to build proper lifelong hygiene habits.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Store it safely: </strong>
                <span>Close the cap after use, follow storage directions on the pack, and keep the tube out of reach between brushes.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Check for allergies: </strong>
                <span>Wooff Kids contains cocoa extract and lactoferrin (a milk protein). If your child has a milk or cocoa allergy, ask your doctor before using it.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Don&apos;t worry about small swallows: </strong>
                <span>Swallowing a little while learning is common and not a cause for worry: Wooff Kids is sugar-free and fluoride-free, and a pea-sized amount is very small. If a child eats a large amount (e.g. much of the tube), speak to your doctor.</span>
              </div>
            </div>

            <div className="spe-check-item spe-warning-item">
              <i className="fa-solid fa-triangle-exclamation text-danger"></i>
              <div>
                <strong>Keep away from pets: </strong>
                <span>Theobromine is toxic to dogs. Despite the name, Wooff Kids is a children&apos;s toothpaste: never use it on a pet.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Keep up dental check-ups: </strong>
                <span>Your pediatric dentist can spot early signs of decay and confirm which toothpaste suits your child.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Fluoride-Free Toothpaste: Is It Right for Your Child? */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Pediatric Guidance</span>
          <h2 className="spe-section-title">Fluoride-Free Toothpaste: Is It Right for Your Child?</h2>
        </div>
        <div className="spe-prose-block">
          <p>Wooff Kids contains no fluoride. Here is the balanced, evidence-based picture:</p>
          <ul className="spe-bullet-list">
            <li>
              <strong>Fluoride has the strongest evidence.</strong> A Cochrane review of 96 studies supports fluoride
              toothpaste over non-fluoride toothpaste for preventing tooth decay. The NHS and the American Academy of
              Pediatric Dentistry both recommend fluoride toothpaste for children.
            </li>
            <li>
              <strong>Swallowing worries are usually handled by using less, not by avoiding fluoride.</strong> Too much
              fluoride while teeth are forming can leave faint white marks (dental fluorosis). That&apos;s why the guidance
              for fluoride toothpaste is a smear for under-3s and a pea-sized amount from 3 to 6, with supervision.
            </li>
            <li>
              <strong>Hydroxyapatite is one of the best-studied fluoride-free alternatives,</strong> but its body of evidence
              is smaller than fluoride&apos;s decades of research.
            </li>
          </ul>

          <div className="spe-dentist-prompt-box">
            <h4>Speak to your dentist before choosing a fluoride-free toothpaste if your child:</h4>
            <ul>
              <li>Has had a cavity, or has chalky white or brown spots on their teeth</li>
              <li>Often has sweets, biscuits or sugary drinks between meals</li>
              <li>Has been told by a dentist that they are at higher risk of tooth decay</li>
            </ul>
            <p className="mb-0 mt-2">
              If your dentist agrees that a fluoride-free paste suits your child, Wooff Kids offers one with a taste kids love.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Wooff Kids vs a Regular Kids' Fluoride Toothpaste */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Comparison</span>
          <h2 className="spe-section-title">Wooff Kids vs. Typical Kids&apos; Fluoride Toothpaste</h2>
        </div>
        <div className="spe-table-responsive">
          <table className="spe-table spe-comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="spe-highlight-col">Wooff Kids Choco Toothpaste</th>
                <th>Typical Kids&apos; Fluoride Toothpaste</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="spe-cell-label">Flavour</td>
                <td className="spe-highlight-col"><strong>Chocolate</strong> (cocoa extract)</td>
                <td>Often fruit or mild mint</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Fluoride</td>
                <td className="spe-highlight-col"><strong>None</strong> (100% Fluoride-Free)</td>
                <td>Yes; in India up to 1,000 ppm, printed on pack</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Main tooth-care ingredient</td>
                <td className="spe-highlight-col"><strong>Nano-hydroxyapatite 2%, with theobromine 2%</strong></td>
                <td>Fluoride (Sodium fluoride or MFP)</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Evidence on preventing decay</td>
                <td className="spe-highlight-col">
                  Hydroxyapatite toothpastes have been tested in trials of up to 18 months, using other formulas; there is no published trial of this finished product.
                </td>
                <td>Decades of trials, summarised in systematic Cochrane reviews</td>
              </tr>
              <tr>
                <td className="spe-cell-label">May suit</td>
                <td className="spe-highlight-col">
                  <strong>Children above 2 who resist mint</strong>, when a fluoride-free paste is right for them
                </td>
                <td>Most children; the standard dental recommendation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. How to Choose a Chocolate Toothpaste: 7-Point Checklist */}
      <section className="spe-section spe-card-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Smart Shopping</span>
          <h2 className="spe-section-title">How to Choose a Chocolate Toothpaste: What to Check</h2>
        </div>
        <div className="spe-prose-block">
          <p>Taste is the easy part. Whichever brand you are considering, check these seven things on the pack:</p>
          <div className="spe-checklist-grid">
            <div className="spe-check-item">
              <span className="spe-check-number">1</span>
              <div>
                <strong>Age range: </strong>
                <span>Is it clearly labelled for your child&apos;s age group?</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">2</span>
              <div>
                <strong>Fluoride status: </strong>
                <span>In India, a fluoride toothpaste must state its ppm on both the tube and carton (up to 1,000 ppm). No ppm figure means fluoride-free.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">3</span>
              <div>
                <strong>Amounts of main ingredients: </strong>
                <span>A clear percentage (like 2% nHAp, 2% theobromine) tells you far more than a vague list of &ldquo;hero&rdquo; ingredients.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">4</span>
              <div>
                <strong>Sugar: </strong>
                <span>A chocolate toothpaste must be completely sugar-free.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">5</span>
              <div>
                <strong>Full label details: </strong>
                <span>India&apos;s Cosmetics Rules, 2020 require the ingredient list, manufacturer name/address, licence number, batch number, and expiry date.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">6</span>
              <div>
                <strong>Claims you can check: </strong>
                <span>&ldquo;Clinically proven&rdquo; should point to a study of that product. Ingredient research is not a test of the finished toothpaste.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">7</span>
              <div>
                <strong>Your child&apos;s dental needs: </strong>
                <span>Cavities, white spots, braces or sensitivity are reasons to speak with your dentist first.</span>
              </div>
            </div>
          </div>
          <p className="mt-3 mb-0 text-muted fst-italic">
            On Wooff Kids, the age range and the percentages of both main ingredients are printed on the front of the carton.
          </p>
        </div>
      </section>

      {/* 10. Medical Disclaimer Footer */}
      <div className="spe-footer-disclaimer">
        <p>
          <i className="fa-solid fa-circle-info me-2 text-primary"></i>
          <em>
            This page gives general information and does not replace personal clinical advice from your child&apos;s pediatric dentist.
            Last updated: 14 October 2026.
          </em>
        </p>
      </div>

    </div>
  );
}
