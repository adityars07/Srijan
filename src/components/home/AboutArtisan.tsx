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
              src="/images/crochet-potted-sunflowers.jpg"
              alt="Rakhi crafting artisanal crochet flowers and home decor"
            />
            <div className="story-floating-tag">
              <Sparkles size={16} color="#C48B71" />
              <span>Studio Rakhi • 100% Hand-Crocheted</span>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="story-content-col">
            <div className="section-eyebrow">The Srijan Philosophy</div>
            <h2 className="story-philosophy-quote">
              "Flowers that never wither, treasures made to be cherished. Every loop of yarn is crafted by hand with patience, bringing timeless warmth into your everyday moments."
            </h2>

            <p className="story-body-text">
              At Srijan, every creation is born from slow, intentional craft. Rakhi hand-stitches each piece stitch-by-stitch—from everlasting botanical crochet bouquets and cheerful potted sunflowers that bring perpetual sunshine to your space, to hand-joined granny square bags, whimsical amigurumi companions, and intricately knotted mandala wall art. Made with ultra-soft milk cotton yarns, natural wooden accents, and heartfelt attention to detail, our creations are heirloom pieces designed to celebrate life's special moments without ever fading.
            </p>

            {/* 3 Value Pillars */}
            <div className="story-features-grid">
              <div className="story-feature-item">
                <div className="feature-icon-pill">
                  <Sparkles size={18} />
                </div>
                <h5 className="feature-title">100% Hand-Stitched</h5>
                <p className="feature-desc">Every single petal, potli, and companion charm is individually looped by hand with zero factory shortcuts.</p>
              </div>

              <div className="story-feature-item">
                <div className="feature-icon-pill">
                  <Leaf size={18} />
                </div>
                <h5 className="feature-title">Pure Milk Cotton</h5>
                <p className="feature-desc">Crafted with soft combed cotton yarns, colorfast dyes, flexible floral armatures, and hypoallergenic fills.</p>
              </div>

              <div className="story-feature-item">
                <div className="feature-icon-pill">
                  <Feather size={18} />
                </div>
                <h5 className="feature-title">Everlasting Warmth</h5>
                <p className="feature-desc">Forever blooms that never wilt or need water, and bespoke accessories tailored to your chosen colors and style.</p>
              </div>
            </div>

            {/* Founder Note */}
            <div className="story-founder-row">
              <img
                src="/images/crochet_bouquet.jpg"
                alt="Rakhi Karn, Founder of Srijan"
                className="founder-avatar"
              />
              <div className="founder-info">
                <span className="founder-name">Rakhi Karn</span>
                <span className="founder-role">Founder & Fiber Artisan</span>
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
