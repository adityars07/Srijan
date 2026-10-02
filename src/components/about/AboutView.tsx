import React from 'react';
import { ArrowUpRight, Sparkles, Feather, Leaf, HeartHandshake } from 'lucide-react';

interface AboutViewProps {
  onContactClick: () => void;
  onExploreClick: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onContactClick, onExploreClick }) => {
  return (
    <div style={{ padding: '40px 0 90px' }}>
      <div className="container">
        {/* Editorial Heading */}
        <div className="about-editorial-header">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            The Story of Srijan
          </div>
          <h1 className="about-hero-title">
            Where Every Creation Tells a Story
          </h1>
          <p className="about-hero-subtitle">
            In Sanskrit, <em>Srijan</em> means genesis—the soulful act of bringing beauty into existence. Founded by master artisan Rakhi Karn, our studio celebrates the patient rhythms of slow craftsmanship.
          </p>
        </div>

        {/* Big Visual Grid */}
        <div className="about-visual-grid">
          <div className="about-main-img-wrap">
            <img
              src="/images/crochet-potted-sunflowers.jpg"
              alt="Handcrafted crochet potted sunflowers"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="about-sub-imgs-col">
            <div className="about-sub-img-wrap">
              <img
                src="/images/crochet_bouquet.jpg"
                alt="Artisanal crochet floral bouquet"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="about-sub-img-wrap">
              <img
                src="/images/resin_frame.jpg"
                alt="Botanical resin floral casting"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="about-narrative-section">
          <h2 className="about-section-heading">
            The Art of Handcrafted Excellence
          </h2>
          <p>
            In a world dominated by mass production and fleeting trends, Srijan stands for permanence, warmth, and individuality. Each piece begins with raw, unhurried materials: soft combed milk cotton yarn, handpicked botanical flora preserved at peak bloom, natural wooden beads, and crystal-clear archival resin.
          </p>
          <p>
            Rakhi brings together diverse textile and preservation disciplines under one roof: botanical crochet sculpting, intricate mandala fiber knotting, and contemporary floral resin casting. No two pieces are ever completely identical, preserving the subtle fingerprint and soulful signature of the human hand.
          </p>
        </div>

        {/* 4 Pillars Card Grid */}
        <div className="about-pillars-grid">
          <div className="about-pillar-card">
            <Sparkles size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Authentic Craftsmanship</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              Every creation is meticulously looped, stitched, or poured by hand with no factory shortcuts.
            </p>
          </div>

          <div className="about-pillar-card">
            <Leaf size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Pure Materials</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              We prioritize combed milk cotton yarns, natural wood accents, non-toxic archival resin, and 100% plastic-free packaging.
            </p>
          </div>

          <div className="about-pillar-card">
            <Feather size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Unique Designs</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              Each piece is one-of-a-kind or custom crafted with personalized names, dates, and color harmonies.
            </p>
          </div>

          <div className="about-pillar-card">
            <HeartHandshake size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Direct Artisan Connection</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              You communicate directly with the maker, ensuring your bespoke vision is brought to life with love.
            </p>
          </div>
        </div>

        {/* CTA banner */}
        <div className="about-cta-banner">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginBottom: '14px' }}>
            Looking for a Bespoke Custom Piece?
          </h3>
          <p style={{ color: '#EDE7DF', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 28px' }}>
            Whether it's an anniversary keepsake platter, wedding bouquet preserve, or custom home entrance plaque, we'd love to craft it for you.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="see-all-link"
              style={{ background: 'white', color: '#2B2523' }}
              onClick={onContactClick}
            >
              <span>Contact Rakhi</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              className="see-all-link"
              style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              onClick={onExploreClick}
            >
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
