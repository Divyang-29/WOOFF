import React from 'react';
import { Link } from 'react-router-dom';
import './SinglePackEditorial.css';

export default function SinglePackEditorial() {
  return (
    <div className="single-pack-editorial-wrapper">

      {/* 1. Product Details at a Glance */}
      <section className="spe-section spe-glance-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Overview</span>
          <h2 className="spe-section-title">Product Details at a Glance</h2>
        </div>
        <div className="spe-table-responsive">
          <table className="spe-table">
            <thead>
              <tr>
                <th>Detail</th>
                <th>Wooff Kids Choco Toothpaste</th>
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
                  50 g tube (also sold as a{' '}
                  <Link to="/product/choco-toothpaste-pack-of-2" className="spe-link fw-bold">
                    pack of two 50 g tubes
                  </Link>)
                </td>
              </tr>
              <tr>
                <td className="spe-cell-label">In the box</td>
                <td>One 50 g tube in its carton</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Age</td>
                <td>Above 2 years</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Flavour</td>
                <td>Chocolate, from cocoa extract</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Main ingredients</td>
                <td>Nano-hydroxyapatite 2%, theobromine 2%</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Supporting ingredients</td>
                <td>Calcium gluconate, inulin, vitamin C, lactoferrin, coenzyme Q10</td>
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
          <span className="spe-pill-badge">Science &amp; Habit</span>
          <h2 className="spe-section-title">What Is Choco Toothpaste?</h2>
        </div>
        <div className="spe-prose-block">
          <p>
            Choco toothpaste, chocolate toothpaste and chocolate-flavoured toothpaste are three names for the same thing: toothpaste that tastes of chocolate instead of mint. The flavour changes how brushing tastes, not what brushing does. The toothbrush and the paste&apos;s cleaning ingredients remove plaque, and the paste is meant to be spat out, not eaten.
          </p>
          <p>
            Taste matters because many children find mint sharp or &ldquo;spicy&rdquo;. They fuss, spit within seconds or refuse to brush. A flavour they like makes it easier to build the oral hygiene habit that counts: two minutes of brushing, morning and night.
          </p>
          <p>Two points are worth remembering:</p>

          <div className="spe-callout-grid">
            <div className="spe-callout-card">
              <div className="spe-callout-icon">
                <i className="fa-solid fa-cookie-bite"></i>
              </div>
              <div className="spe-callout-text">
                <strong>Chocolate flavour isn&apos;t chocolate.</strong>
                <p>
                  Wooff Kids gets its taste from cocoa extract and contains no sugar, so brushing doesn&apos;t leave sugar on your child&apos;s teeth.
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
                  A chocolate taste doesn&apos;t prevent cavities, and no toothpaste cancels out frequent sweets, biscuits or sugary drinks.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 mb-0">
            Our{' '}
            <Link to="/blog/chocolate-flavoured-toothpaste" className="spe-link fw-bold">
              guide to choosing a chocolate flavoured toothpaste
            </Link>{' '}
            shows what to check on the label.
          </p>
        </div>
      </section>

      {/* 3. Why Parents Choose Wooff Kids */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Parent Benefits</span>
          <h2 className="spe-section-title">Why Parents Choose Wooff Kids</h2>
        </div>
        <div className="spe-reasons-grid">
          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-face-smile"></i>
            </div>
            <h3>A taste children accept</h3>
            <p>Chocolate instead of mint, for children who resist brushing.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-eye"></i>
            </div>
            <h3>Ingredient amounts you can see</h3>
            <p>The front of the carton states how much of the two main ingredients is in the tube: 2% nano-hydroxyapatite and 2% theobromine.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <h3>Sugar-free and fluoride-free</h3>
            <p>Also free from SLS (a foaming agent used in many toothpastes), parabens and artificial colours.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-child"></i>
            </div>
            <h3>Made for young children</h3>
            <p>Labelled for children above 2 years, with simple directions for supervised brushing.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-user-doctor"></i>
            </div>
            <h3>Founded by a dentist</h3>
            <p>Wooff Kids was started by Dr. Shrushti Bhankhariya, a dentist who saw how often brushing turns into a daily struggle for families.</p>
          </div>
        </div>

        <div className="spe-prose-block mt-3">
          <p>
            To hear from families who already use it, read the{' '}
            <a href="#customer-reviews-section" className="spe-link fw-bold">
              reviews on this page
            </a>.
          </p>
        </div>
      </section>

      {/* 4. Taste, Texture and How Long a Tube Lasts */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Experience &amp; Value</span>
          <h2 className="spe-section-title">Taste, Texture and How Long a Tube Lasts</h2>
        </div>
        <div className="spe-reasons-grid">
          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-mug-hot"></i>
            </div>
            <h3>Taste</h3>
            <p>A cocoa-style chocolate flavour, made to be mild for young children. There is no sharp, cooling mint feel.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h3>Texture</h3>
            <p>A smooth brown paste that spreads easily on a small brush.</p>
          </div>

          <div className="spe-reason-card">
            <div className="spe-reason-icon-circle">
              <i className="fa-solid fa-calendar-days"></i>
            </div>
            <h3>How long it lasts</h3>
            <p>
              At a pea-sized amount (about 0.25 g) twice a day, one 50 g tube holds around 100 days of brushing for one child. The{' '}
              <Link to="/product/choco-toothpaste-pack-of-2" className="spe-link fw-bold">
                pack of two 50 g tubes
              </Link>{' '}
              covers about six months.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Ingredients and What the Research Shows */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Evidence &amp; Transparency</span>
          <h2 className="spe-section-title">Ingredients and What the Research Shows</h2>
        </div>
        <div className="spe-prose-block">
          <p className="spe-disclaimer-lead">
            Wooff Kids Choco Toothpaste is a cosmetic toothpaste, not a medicine. The research summarised below was done on individual ingredients, mostly in laboratories or in other toothpastes, not on Wooff Kids itself. Read it as the reason each ingredient is included, not as proof of what this tube will do.
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
                <td className="spe-cell-label"><strong>Nano-hydroxyapatite (2%)</strong></td>
                <td>A synthetic form of the calcium-phosphate mineral that makes up most of tooth enamel, in very small (&ldquo;nano&rdquo;) particles</td>
                <td>One of the most-studied fluoride-free ingredients for preventing decay. In trials lasting up to 18 months, hydroxyapatite toothpastes did no worse than fluoride toothpastes at limiting new decay in children and adults. Most of those trials used about 10% hydroxyapatite, usually in a larger-particle form, so their results can&apos;t be assumed for a 2% formula</td>
              </tr>
              <tr>
                <td className="spe-cell-label"><strong>Theobromine (2%)</strong></td>
                <td>A natural compound found in cocoa</td>
                <td>Laboratory studies of whether it helps enamel take up minerals (remineralisation) have mixed results. Human studies are few, small and short. It has not been shown to prevent cavities</td>
              </tr>
              <tr>
                <td className="spe-cell-label"><strong>Calcium gluconate</strong></td>
                <td>A water-soluble source of calcium</td>
                <td>We found no published studies of calcium gluconate in toothpaste</td>
              </tr>
              <tr>
                <td className="spe-cell-label"><strong>Inulin</strong></td>
                <td>A plant fibre known as a prebiotic</td>
                <td>Prebiotic benefits are established for the gut. A benefit in the mouth hasn&apos;t been shown</td>
              </tr>
              <tr>
                <td className="spe-cell-label"><strong>Vitamin C (ascorbic acid)</strong></td>
                <td>An antioxidant; the body needs vitamin C for healthy gums</td>
                <td>Low vitamin C intake is linked with bleeding gums. Whether vitamin C in toothpaste adds a benefit hasn&apos;t been established</td>
              </tr>
              <tr>
                <td className="spe-cell-label"><strong>Lactoferrin</strong></td>
                <td>A protein found naturally in saliva and milk</td>
                <td>Slows the growth of some mouth bacteria in laboratory studies. In toothpaste, it has only been tested together with other enzymes and proteins</td>
              </tr>
              <tr>
                <td className="spe-cell-label"><strong>Coenzyme Q10</strong></td>
                <td>An antioxidant</td>
                <td>Tested as a gel alongside professional gum treatment in adults; a 2023 review could not establish its effect. Not studied in toothpaste</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="spe-prose-block mt-3">
          <p>
            <strong>What we don&apos;t claim.</strong> The research above is about ingredients, not about this toothpaste, so we don&apos;t claim that Wooff Kids prevents cavities, repairs enamel or treats gum problems. Its job is to clean your child&apos;s teeth with a taste that makes brushing easier.
          </p>
          <p className="mb-0">
            You can read more about each ingredient on our{' '}
            <Link to="/ingredients" className="spe-link fw-bold">
              ingredients page
            </Link>.
          </p>
        </div>
      </section>

      {/* 6. How to Use Wooff Kids Choco Toothpaste */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Directions</span>
          <h2 className="spe-section-title">How to Use Wooff Kids Choco Toothpaste</h2>
        </div>
        <div className="spe-prose-block">
          <p>Follow the directions on the pack:</p>
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
            <p>Brush for 2 minutes.</p>
          </div>

          <div className="spe-step-card">
            <div className="spe-step-num">4</div>
            <h4>Spit &amp; Rinse</h4>
            <p>Spit out, then rinse.</p>
          </div>

          <div className="spe-step-card">
            <div className="spe-step-num">5</div>
            <h4>Morning &amp; Bedtime</h4>
            <p>Brush once in the morning and once before bedtime.</p>
          </div>
        </div>
        <div className="spe-prose-block mt-3">
          <p className="mb-0">
            Always brush with adult supervision. If your child still resists, these{' '}
            <Link to="/blog/choco-flavoured-toothpaste" className="spe-link fw-bold">
              tips to make brushing fun
            </Link>{' '}
            can help.
          </p>
        </div>
      </section>

      {/* 7. Age, Amount and Supervision */}
      <section className="spe-section spe-card-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Supervision Guide</span>
          <h2 className="spe-section-title">Chocolate Toothpaste for Kids: Age, Amount and Supervision</h2>
        </div>
        <div className="spe-prose-block">
          <p>
            Wooff Kids Choco Toothpaste is labelled for children above 2 years. A pleasant taste can tempt young children to swallow toothpaste or eat it from the tube, so these habits matter more than flavour:
          </p>
          <div className="spe-checklist-grid">
            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Control the amount. </strong>
                <span>Squeeze the pea-sized amount onto the brush yourself until your child can do it reliably.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Supervise by age. </strong>
                <span>Brush your child&apos;s teeth for them while they are under 3. From 3 to 6, watch them brush and help where needed. From about 7, most children can brush on their own, but it&apos;s still worth checking.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Teach &ldquo;spit, don&apos;t swallow&rdquo; </strong>
                <span>from the very first brush.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Store it safely. </strong>
                <span>Close the cap after use, follow the storage directions on the pack, and keep the tube out of reach between brushes.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Check for allergies. </strong>
                <span>Wooff Kids contains cocoa extract and lactoferrin, a milk protein. If your child has a milk or cocoa allergy, ask your doctor before using it.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Don&apos;t worry about small swallows. </strong>
                <span>Swallowing a little while learning to brush is common and is not a cause for worry: Wooff Kids is sugar-free and fluoride-free, and a pea-sized amount is very small. Toothpaste is still meant to be spat out, so keep the tube out of reach, and if your child eats a large amount, such as much of the tube, speak to your doctor.</span>
              </div>
            </div>

            <div className="spe-check-item spe-warning-item">
              <i className="fa-solid fa-triangle-exclamation text-danger"></i>
              <div>
                <strong>Keep it away from pets. </strong>
                <span>Theobromine is toxic to dogs. Despite the name, Wooff Kids is a children&apos;s toothpaste: never use it on a pet.</span>
              </div>
            </div>

            <div className="spe-check-item">
              <i className="fa-solid fa-circle-check text-success"></i>
              <div>
                <strong>Keep up dental check-ups. </strong>
                <span>Your dentist can spot early decay and tell you which toothpaste suits your child.</span>
              </div>
            </div>
          </div>
          <p className="mt-3 mb-0">
            For answers to other common questions, read{' '}
            <Link to="/blog/chocolate-toothpaste" className="spe-link fw-bold">
              does chocolate toothpaste work, and is it safe?
            </Link>
          </p>
        </div>
      </section>

      {/* 8. Fluoride-Free Toothpaste: Is It Right for Your Child? */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Pediatric Guidance</span>
          <h2 className="spe-section-title">Fluoride-Free Toothpaste: Is It Right for Your Child?</h2>
        </div>
        <div className="spe-prose-block">
          <p>Wooff Kids contains no fluoride. Here is the balanced picture:</p>
          <ul className="spe-bullet-list">
            <li>
              <strong>Fluoride has the strongest evidence.</strong> A Cochrane review of 96 studies supports fluoride toothpaste over non-fluoride toothpaste for preventing tooth decay. The NHS and the American Academy of Pediatric Dentistry both recommend fluoride toothpaste for children.
            </li>
            <li>
              <strong>Swallowing worries are usually handled by using less, not by avoiding fluoride.</strong> Too much fluoride while teeth are forming can leave faint white marks (dental fluorosis). That&apos;s why the guidance for fluoride toothpaste is a smear for children under 3 and a pea-sized amount from 3 to 6, with supervision.
            </li>
            <li>
              <strong>Hydroxyapatite is one of the best-studied fluoride-free alternatives,</strong> but its evidence is far smaller than fluoride&apos;s.
            </li>
          </ul>

          <div className="spe-dentist-prompt-box">
            <h4>Speak to your dentist before choosing a fluoride-free toothpaste if your child:</h4>
            <ul>
              <li>has had a cavity, or has chalky white or brown spots on their teeth</li>
              <li>often has sweets, biscuits or sugary drinks between meals</li>
              <li>has been told by a dentist that they are at higher risk of tooth decay</li>
            </ul>
            <p className="mb-0 mt-2">
              If your dentist agrees that a fluoride-free paste suits your child, Wooff Kids offers one with a chocolate taste.
            </p>
          </div>
        </div>
      </section>

      {/* 9. How Wooff Kids Differs From Other Chocolate Toothpastes */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Market Comparison</span>
          <h2 className="spe-section-title">How Wooff Kids Differs From Other Chocolate Toothpastes</h2>
        </div>
        <div className="spe-prose-block">
          <p>Chocolate toothpastes fall into four broad types. Here is where Wooff Kids fits:</p>
        </div>
        <div className="spe-table-responsive">
          <table className="spe-table spe-comparison-table">
            <thead>
              <tr>
                <th>Type of chocolate toothpaste</th>
                <th>What it relies on</th>
                <th className="spe-highlight-col">Where Wooff Kids fits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="spe-cell-label">Flavour-only gel or paste</td>
                <td>Cleaning agents, sweeteners and chocolate flavour, with no ingredient meant to help prevent decay</td>
                <td className="spe-highlight-col">Wooff Kids adds nano-hydroxyapatite and theobromine</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Theobromine (cocoa extract) paste</td>
                <td>Theobromine, often without a stated amount</td>
                <td className="spe-highlight-col">Wooff Kids states 2% theobromine on the carton</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Hydroxyapatite paste</td>
                <td>Hydroxyapatite, one of the best-studied fluoride-free ingredients</td>
                <td className="spe-highlight-col">Wooff Kids contains 2% nano-hydroxyapatite alongside theobromine</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Chocolate toothpaste with fluoride (mostly sold abroad)</td>
                <td>Fluoride; some are labelled for adults and children over 6 only</td>
                <td className="spe-highlight-col">Wooff Kids is fluoride-free and labelled for children above 2</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="spe-prose-block mt-3">
          <p className="mb-0">
            Most chocolate toothpastes sold in India are fluoride-free, and many don&apos;t say how much of their main ingredient they contain. Wooff Kids prints both amounts on the front of the carton.
          </p>
        </div>
      </section>

      {/* 10. Wooff Kids vs a Regular Kids' Fluoride Toothpaste */}
      <section className="spe-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Comparison</span>
          <h2 className="spe-section-title">Wooff Kids vs a Regular Kids&apos; Fluoride Toothpaste</h2>
        </div>
        <div className="spe-table-responsive">
          <table className="spe-table spe-comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="spe-highlight-col">Wooff Kids Choco Toothpaste</th>
                <th>Typical kids&apos; fluoride toothpaste</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="spe-cell-label">Flavour</td>
                <td className="spe-highlight-col"><strong>Chocolate</strong></td>
                <td>Often fruit or mild mint</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Fluoride</td>
                <td className="spe-highlight-col"><strong>None</strong></td>
                <td>Yes; in India up to 1,000 ppm, stated on the pack</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Main tooth-care ingredient</td>
                <td className="spe-highlight-col"><strong>Nano-hydroxyapatite 2%, with theobromine 2%</strong></td>
                <td>Fluoride</td>
              </tr>
              <tr>
                <td className="spe-cell-label">Evidence on preventing decay</td>
                <td className="spe-highlight-col">
                  Hydroxyapatite toothpastes have been tested in trials of up to 18 months, using other formulas; there is no published trial of this product
                </td>
                <td>Decades of trials, summarised in systematic reviews</td>
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

      {/* 11. How to Choose a Chocolate Toothpaste: What to Check on the Pack */}
      <section className="spe-section spe-card-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">Buying Guide</span>
          <h2 className="spe-section-title">How to Choose a Chocolate Toothpaste: What to Check on the Pack</h2>
        </div>
        <div className="spe-prose-block">
          <p>Taste is the easy part. Whichever brand you are considering, check:</p>
          <div className="spe-checklist-grid">
            <div className="spe-check-item">
              <span className="spe-check-number">1</span>
              <div>
                <strong>Age range. </strong>
                <span>Is it labelled for your child&apos;s age?</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">2</span>
              <div>
                <strong>Fluoride status. </strong>
                <span>In India, a fluoride toothpaste must state its fluoride content in ppm on both the tube and the carton, up to a maximum of 1,000 ppm. No ppm figure usually means the paste is fluoride-free; decide whether that suits your child.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">3</span>
              <div>
                <strong>Amounts of the main ingredients. </strong>
                <span>A percentage tells you more than a list of &ldquo;hero&rdquo; ingredients.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">4</span>
              <div>
                <strong>Sugar. </strong>
                <span>A chocolate toothpaste should be sugar-free.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">5</span>
              <div>
                <strong>Full label details. </strong>
                <span>India&apos;s Cosmetics Rules, 2020 require the ingredient list, the manufacturer&apos;s name and address, a licence number, a batch number and an expiry or use-before date.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">6</span>
              <div>
                <strong>Claims you can check. </strong>
                <span>&ldquo;Clinically proven&rdquo; should point to a study of that product. Research on an ingredient is not a test of the finished toothpaste.</span>
              </div>
            </div>
            <div className="spe-check-item">
              <span className="spe-check-number">7</span>
              <div>
                <strong>Your child&apos;s dental needs. </strong>
                <span>Cavities, white spots, braces or sensitivity are good reasons to ask your dentist first.</span>
              </div>
            </div>
          </div>
          <p className="mt-3 mb-0 text-muted fst-italic">
            On Wooff Kids, the age range and the percentages of both main ingredients are printed on the front of the carton.
          </p>
        </div>
      </section>

      {/* 12. About Wooff Kids */}
      <section className="spe-section spe-card-section">
        <div className="spe-section-header">
          <span className="spe-pill-badge">About Us</span>
          <h2 className="spe-section-title">About Wooff Kids</h2>
        </div>
        <div className="spe-prose-block">
          <p>
            Wooff Kids is the children&apos;s oral-care range from Wooff Care. It was founded by Dr. Shrushti Bhankhariya, a dentist.
          </p>
          <blockquote className="spe-blockquote">
            <p>
              &ldquo;As a dentist, I saw how something as essential as brushing became a daily struggle for parents and kids. I created Wooff Kids to turn brushing battles into joyful moments with flavours kids love and thoughtfully formulated oral care that parents can trust.&rdquo;
            </p>
            <p>&mdash; Dr. Shrushti Bhankhariya, Dentist and Founder</p>
          </blockquote>
          <p>
            Read{' '}
            <Link to="/about" className="spe-link fw-bold">
              our story
            </Link>{' '}
            or{' '}
            <Link to="/contact" className="spe-link fw-bold">
              contact us
            </Link>{' '}
            with any questions about the formula.
          </p>
        </div>
      </section>

      {/* Medical Disclaimer Footer */}
      <div className="spe-footer-disclaimer">
        <p>
          <i className="fa-solid fa-circle-info me-2 text-primary"></i>
          <em>
            This page gives general information and does not replace advice from your child&apos;s dentist. Last updated: 14 October 2026.
          </em>
        </p>
      </div>

    </div>
  );
}
