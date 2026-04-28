import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';

export default function Home() {
  return (
    <>
      <nav className="container navbar animate-fade-in">
        <Link to="/" className="nav-logo">
          <Utensils size={28} />
          LastCall
        </Link>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          Rescue Meals.<br/>
          <span style={{ color: 'var(--primary)' }}>Save Money.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          LastCall connects you with local restaurants and bakeries offering their delicious end-of-day surplus food at huge discounts.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Find Meals Near Me
          </Link>
          <Link to="/register?role=merchant" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            I'm a Merchant
          </Link>
        </div>
      </main>
    </>
  );
}
