import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface HeroCollageProps {
  onExploreClick: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProductById: (id: string) => void;
}

export const HeroCollage: React.FC<HeroCollageProps> = ({
  onExploreClick,
  onSelectCategory,
  onSelectProductById,
}) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Main Left Editorial Card */}
          <div className="hero-feature-card">
            <div>
              <div className="hero-eyebrow">
                <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Handcrafted in India by Rakhi
              </div>
              <h1 className="hero-title">
                Handcrafted Elegance for Your Home
              </h1>
              <p className="hero-description">
                Discover bespoke artisan treasures: everlasting crochet blooms, preserved botanical resin frames, wheel-thrown stoneware, and personalized entrance plaques.
              </p>

              <button
                className="see-all-link"
                style={{ backgroundColor: '#2B2523', color: '#FBF9F5', marginBottom: '24px' }}
                onClick={onExploreClick}
              >
                <span>Explore Creations</span>
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Bottom Arched Visual Art */}
            <div
              className="hero-bottom-art"
              onClick={() => onSelectProductById('harmony-sculptural-vase')}
              style={{ cursor: 'pointer' }}
              title="View Harmony Organic Sculptural Vase"
            >
              <img
                src="/images/sculptural_vase.jpg"
                alt="Sculptural handcrafted vase"
              />
              <div
                className="hero-tile-pill"
                style={{ bottom: '16px', top: 'auto', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('Home Decor');
                }}
              >
                Sculptural Vessels
              </div>
              <div className="hero-tile-btn">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>

          {/* Middle Column Collage */}
          <div className="hero-col">
            {/* Top Tile: Ceramic Tableware / Plates */}
            <div
              className="hero-image-tile"
              style={{ height: '300px' }}
              onClick={() => onSelectProductById('dalmation-side-plate-24cm')}
            >
              <img
                src="/images/ceramic_plates.jpg"
                alt="Handcrafted ceramic dinner plate with dried pampas"
              />
              <span
                className="hero-tile-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('Plates & Bowls');
                }}
              >
                Tableware
              </span>
              <div className="hero-tile-btn">
                <ArrowUpRight size={18} />
              </div>
            </div>

            {/* Bottom Tile: Custom Resin Art */}
            <div
              className="hero-image-tile"
              style={{ height: '320px' }}
              onClick={() => onSelectProductById('resin-customized-frame-large')}
            >
              <img
                src="/images/resin_frame.jpg"
                alt="Botanical resin art frame with gold flecks"
              />
              <span
                className="hero-tile-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('Resin Art');
                }}
              >
                Resin Keepsakes
              </span>
              <div className="hero-tile-btn">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>

          {/* Right Column Collage */}
          <div className="hero-col">
            {/* Top Tile: Crochet Floral Bouquets */}
            <div
              className="hero-image-tile"
              style={{ height: '320px' }}
              onClick={() => onSelectProductById('crochet-rose-bouquet')}
            >
              <img
                src="/images/crochet_bouquet.jpg"
                alt="Crochet Rose Bouquet Handcrafted"
              />
              <span
                className="hero-tile-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('Crochet');
                }}
              >
                Crochet Blooms
              </span>
              <div className="hero-tile-btn">
                <ArrowUpRight size={18} />
              </div>
            </div>

            {/* Bottom Tile: Stoneware Cups & Planters */}
            <div
              className="hero-image-tile"
              style={{ height: '300px' }}
              onClick={() => onSelectProductById('aurora-brew-mug-speckled')}
            >
              <img
                src="/images/stoneware_mug.jpg"
                alt="Artisan stoneware cup"
              />
              <span
                className="hero-tile-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('Ceramics & Mugs');
                }}
              >
                Artisan Cups
              </span>
              <div className="hero-tile-btn">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
