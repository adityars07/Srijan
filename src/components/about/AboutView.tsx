import React from 'react';
import { ArrowUpRight, Sparkles, Feather, Leaf, HeartHandshake } from 'lucide-react';

interface AboutViewProps {
  onContactClick: () => void;
  onExploreClick: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onContactClick, onExploreClick }) => {
  return (
    <div className="about-page-wrap">
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

        {/* Curated Studio Gallery */}
        <div className="about-visual-grid">
          <div className="about-gallery-card">
            <img
              src="/images/crochet-potted-sunflowers.jpg"
              alt="Handcrafted crochet potted sunflowers"
            />
            <div className="about-img-tag">Crochet Botanicals</div>
          </div>
          <div className="about-gallery-card">
            <img
              src="/images/crochet_bouquet.jpg"
              alt="Artisanal crochet floral bouquet"
            />
            <div className="about-img-tag">Heirloom Bouquets</div>
          </div>
          <div className="about-gallery-card">
            <img
              src="/images/resin_frame.jpg"
              alt="Botanical resin floral casting"
            />
            <div className="about-img-tag">Botanical Resin Art</div>
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
            <div className="about-pillar-icon-wrap">
              <Sparkles size={24} color="#C48B71" />
            </div>
            <h4 className="about-pillar-title">Authentic Craftsmanship</h4>
            <p className="about-pillar-desc">
              Every creation is meticulously looped, stitched, or poured by hand with no factory shortcuts.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-icon-wrap">
              <Leaf size={24} color="#C48B71" />
            </div>
            <h4 className="about-pillar-title">Pure Materials</h4>
            <p className="about-pillar-desc">
              We prioritize combed milk cotton yarns, natural wood accents, non-toxic archival resin, and 100% plastic-free packaging.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-icon-wrap">
              <Feather size={24} color="#C48B71" />
            </div>
            <h4 className="about-pillar-title">Unique Designs</h4>
            <p className="about-pillar-desc">
              Each piece is one-of-a-kind or custom crafted with personalized names, dates, and color harmonies.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-icon-wrap">
              <HeartHandshake size={24} color="#C48B71" />
            </div>
            <h4 className="about-pillar-title">Direct Artisan Connection</h4>
            <p className="about-pillar-desc">
              You communicate directly with the maker, ensuring your bespoke vision is brought to life with love.
            </p>
          </div>
        </div>

        {/* CTA banner */}
        <div className="about-cta-banner">
          <h3 className="about-cta-title">
            Looking for a Bespoke Custom Piece?
          </h3>
          <p className="about-cta-text">
            Whether it's an anniversary keepsake platter, wedding bouquet preserve, or custom home entrance plaque, we'd love to craft it for you.
          </p>
          <div className="about-cta-buttons">
            <button
              className="about-cta-primary-btn"
              onClick={onContactClick}
            >
              <span>Contact Rakhi</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              className="about-cta-secondary-btn"
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
