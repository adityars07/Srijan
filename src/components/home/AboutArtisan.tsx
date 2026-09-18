import React from 'react';
import { ArrowUpRight, Sparkles, Feather, Leaf } from 'lucide-react';

interface AboutArtisanProps {
  onContactClick: () => void;
}

export const AboutArtisan: React.FC<AboutArtisanProps> = ({ onContactClick }) => {
  return (
    <section className="artisan-story-section">
      <div className="container">
        <div className="artisan-story-grid">
          {/* Left Arched Crafting Visual */}
          <div className="story-arch-wrap">
            <img
              src="/images/potter_hands.jpg"
              alt="Hands shaping artisanal clay pottery"
            />
            <div className="story-floating-tag">
              <Sparkles size={16} color="#C48B71" />
              <span>Studio Rakhi • Made with Soul</span>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="story-content-col">
            <div className="section-eyebrow">The Srijan Philosophy</div>
            <h2 className="story-philosophy-quote">
              "Clay and fiber are the skin of the earth, and through the hands of the artisan, they become the soul of the home."
            </h2>

            <p className="story-body-text">
              At Srijan, every piece is born from quiet passion and perfected through patient dedication. Rakhi brings years of artisanal expertise to create unique handcrafted creations that blend traditional heritage techniques—from Indian Lipan clay and mirror work to delicate Japanese-style crochet and botanical resin casting—with timeless contemporary aesthetics.
            </p>

            {/* 3 Value Pillars from Original Srijan Site */}
            <div className="story-features-grid">
              <div className="story-feature-item">
                <div className="feature-icon-pill">
                  <Sparkles size={18} />
                </div>
                <h5 className="feature-title">Authentic Craft</h5>
                <p className="feature-desc">100% handmade with meticulous attention to detail.</p>
              </div>

              <div className="story-feature-item">
                <div className="feature-icon-pill">
                  <Leaf size={18} />
                </div>
                <h5 className="feature-title">Pure Materials</h5>
                <p className="feature-desc">Eco-friendly clays, natural cotton yarns, and archival resin.</p>
              </div>

              <div className="story-feature-item">
                <div className="feature-icon-pill">
                  <Feather size={18} />
                </div>
                <h5 className="feature-title">Unique Design</h5>
                <p className="feature-desc">Every piece is one-of-a-kind or custom personalized.</p>
              </div>
            </div>

            {/* Founder Note */}
            <div className="story-founder-row">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Rakhi, Founder of Srijan"
                className="founder-avatar"
              />
              <div className="founder-info">
                <span className="founder-name">Rakhi Karn</span>
                <span className="founder-role">Founder & Master Artisan</span>
              </div>

              <button
                className="see-all-link"
                style={{ marginLeft: 'auto' }}
                onClick={onContactClick}
              >
                <span>Request Custom Piece</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
