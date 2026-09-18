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
        <div style={{ maxWidth: '780px', margin: '0 auto 60px', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            The Story of Srijan
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.2rem', lineHeight: 1.15, marginBottom: '20px' }}>
            Where Every Creation Tells a Story
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#746D66', lineHeight: 1.7 }}>
            In Sanskrit, <em>Srijan</em> means genesis—the soulful act of bringing beauty into existence. Founded by master artisan Rakhi Karn, our studio celebrates the patient rhythms of slow craftsmanship.
          </p>
        </div>

        {/* Big Visual Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '80px' }}>
          <div style={{ height: '440px', borderRadius: '24px', overflow: 'hidden' }}>
            <img
              src="/images/potter_hands.jpg"
              alt="Artisan shaping clay"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '24px' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <img
                src="/images/crochet_bouquet.jpg"
                alt="Crochet craftsmanship"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <img
                src="/images/resin_frame.jpg"
                alt="Resin floral casting"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div style={{ maxWidth: '860px', margin: '0 auto 80px', display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '1.05rem', color: '#2B2523', lineHeight: 1.8 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem' }}>
            The Art of Handcrafted Excellence
          </h2>
          <p>
            In a world dominated by mass production and fleeting trends, Srijan stands for permanence, warmth, and individuality. Each piece begins with raw, unhurried materials: natural stoneware clay dug from local riverbeds, handpicked Indian botanical flora preserved at peak bloom, soft milk cotton yarn, and precision-poured crystal resin.
          </p>
          <p>
            Rakhi brings together diverse artistic disciplines under one roof: ancient Gujarat Lipan mud and mirror heritage, Japanese botanical crochet sculpting, and contemporary fluid resin casting. No two pieces are ever completely identical, preserving the subtle fingerprint and soulful signature of the human hand.
          </p>
        </div>

        {/* 4 Pillars Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          <div style={{ background: '#F4EFEA', padding: '36px 28px', borderRadius: '20px' }}>
            <Sparkles size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Authentic Craftsmanship</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              Every creation is meticulously molded, stitched, or poured by hand with no factory shortcuts.
            </p>
          </div>

          <div style={{ background: '#F4EFEA', padding: '36px 28px', borderRadius: '20px' }}>
            <Leaf size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Sustainable Materials</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              We prioritize organic clays, pure cotton yarns, non-toxic food-safe glazes, and 100% plastic-free packaging.
            </p>
          </div>

          <div style={{ background: '#F4EFEA', padding: '36px 28px', borderRadius: '20px' }}>
            <Feather size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Unique Designs</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              Each piece is one-of-a-kind or custom crafted with personalized names, dates, and color harmonies.
            </p>
          </div>

          <div style={{ background: '#F4EFEA', padding: '36px 28px', borderRadius: '20px' }}>
            <HeartHandshake size={28} color="#C48B71" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>Direct Artisan Connection</h4>
            <p style={{ fontSize: '0.9rem', color: '#746D66', lineHeight: 1.6 }}>
              You communicate directly with the maker, ensuring your bespoke vision is brought to life with love.
            </p>
          </div>
        </div>

        {/* CTA banner */}
        <div style={{ backgroundColor: '#2B2523', color: '#FBF9F5', borderRadius: '24px', padding: '54px 40px', textAlign: 'center', maxWidth: '980px', margin: '0 auto' }}>
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
