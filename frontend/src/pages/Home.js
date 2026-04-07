import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const faqs = [
  {
    id: 1,
    question: 'What is EscrowChain?',
    answer: 'EscrowChain is a blockchain-powered escrow system that securely locks payments in smart contracts and releases them only when both parties agree the work is completed.'
  },
  {
    id: 2,
    question: 'How does the payment work?',
    answer: 'Client posts a project and locks the payment in a smart contract. The freelancer completes the work and submits it. Once the client approves, payment is automatically released to the freelancer.'
  },
  {
    id: 3,
    question: 'What happens if there is a dispute?',
    answer: 'Either party can raise a dispute. Our ML-based system reviews the submitted work against the requirements and helps resolve the dispute fairly.'
  },
  {
    id: 4,
    question: 'Which blockchain does EscrowChain use?',
    answer: 'EscrowChain is built on Ethereum and Polygon Testnet, which provides fast and low-cost transactions while maintaining full security.'
  },
  {
    id: 5,
    question: 'Is EscrowChain safe to use?',
    answer: 'Yes! All payments are locked in audited smart contracts. No one — not even EscrowChain — can access your funds without proper authorization.'
  },
  {
    id: 6,
    question: 'Do I need a crypto wallet?',
    answer: 'Yes, you need a MetaMask wallet to use EscrowChain. It is free and easy to set up. MetaMask is used to sign transactions securely.'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'Ahmed Raza',
    role: 'Client',
    avatar: 'A',
    rating: 5,
    review: 'EscrowChain gave me complete peace of mind. I posted my project, locked the payment, and only released it when I was 100% satisfied. No more trust issues!'
  },
  {
    id: 2,
    name: 'Sara Khan',
    role: 'Freelancer',
    avatar: 'S',
    rating: 5,
    review: 'As a freelancer I always worried about getting paid. With EscrowChain my payment was locked from day one. I just focused on my work and got paid instantly!'
  },
  {
    id: 3,
    name: 'Rahul Dev',
    role: 'Freelancer',
    avatar: 'R',
    rating: 4,
    review: 'The smart contract system is brilliant. Transparent, fast and no hidden fees. This is the future of freelancing payments!'
  }
];

function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="home">

      {/* ── HERO SECTION ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🔗 Powered by Blockchain</div>
          <h1>Secure Payments for
            <span> Freelancers & Clients</span>
          </h1>
          <p>
            A blockchain-powered escrow system that locks your
            payment in a smart contract and releases it only when
            work is approved. No middleman. No fraud. Full transparency.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          </div>
          <div className="hero-trust">
            <span>✅ No middleman</span>
            <span>✅ 100% Secure</span>
            <span>✅ Instant Payment</span>
          </div>
        </div>
        <div className="hero-image">🔐</div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <h2>500+</h2>
            <p>Projects Completed</p>
          </div>
          <div className="stat-item">
            <h2>200+</h2>
            <p>Active Freelancers</p>
          </div>
          <div className="stat-item">
            <h2>150+</h2>
            <p>Happy Clients</p>
          </div>
          <div className="stat-item">
            <h2>50 ETH+</h2>
            <p>Funds Secured</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple, secure and transparent in just 3 steps</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-icon">📋</div>
            <h3>1. Post a Project</h3>
            <p>
              Client posts the project with requirements,
              budget and deadline.
            </p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-icon">🔒</div>
            <h3>2. Lock Payment</h3>
            <p>
              Payment is locked in a smart contract
              on the blockchain safely.
            </p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-icon">✅</div>
            <h3>3. Get Paid</h3>
            <p>
              Freelancer submits work. Client approves.
              Payment released instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose EscrowChain?</h2>
          <p>Everything you need for secure freelancing</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <span>🛡️</span>
            <h3>Secure & Safe</h3>
            <p>
              Funds locked in smart contracts.
              No one can touch them without approval.
            </p>
          </div>
          <div className="feature-card">
            <span>🌐</span>
            <h3>Decentralized</h3>
            <p>
              No central authority.
              Powered by Ethereum blockchain.
            </p>
          </div>
          <div className="feature-card">
            <span>👁️</span>
            <h3>Transparent</h3>
            <p>
              Every transaction is visible
              and verifiable on the blockchain.
            </p>
          </div>
          <div className="feature-card">
            <span>⚡</span>
            <h3>Fast & Low Cost</h3>
            <p>
              Built on Polygon testnet for fast
              and low fee transactions.
            </p>
          </div>
          <div className="feature-card">
            <span>🤝</span>
            <h3>Fair Disputes</h3>
            <p>
              ML-based relevance check ensures
              fair evaluation of work.
            </p>
          </div>
          <div className="feature-card">
            <span>💼</span>
            <h3>For Everyone</h3>
            <p>
              Whether you are a client or freelancer,
              we protect both sides.
            </p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Trusted by freelancers and clients worldwide</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.id}>
              <div className="testimonial-top">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <h4>{t.name}</h4>
                  <span className="testimonial-role">{t.role}</span>
                </div>
              </div>
              <div className="testimonial-stars">
                {'⭐'.repeat(t.rating)}
              </div>
              <p>"{t.review}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about EscrowChain</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <div
              className={`faq-item ${openFaq === faq.id ? 'open' : ''}`}
              key={faq.id}
            >
              <button
                className="faq-question"
                onClick={() => toggleFaq(faq.id)}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">
                  {openFaq === faq.id ? '−' : '+'}
                </span>
              </button>
              {openFaq === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to get started?</h2>
          <p>
            Join EscrowChain today and experience
            secure freelancing powered by blockchain.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-secondary-light">
              Login to Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;