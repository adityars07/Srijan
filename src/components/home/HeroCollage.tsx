import React, { useState, useRef } from 'react';
import { ArrowUpRight, Sparkles, Volume2, VolumeX, Play, Pause } from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

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

            {/* Bottom Arched Visual Art & Product Reel */}
            <div
              className="hero-bottom-art"
              onClick={() => onSelectProductById('harmony-sculptural-vase')}
              style={{ cursor: 'pointer' }}
              title="View Harmony Organic Sculptural Vase"
            >
              {!videoError ? (
                <video
                  ref={videoRef}
                  src="/videos/product-video.mp4"
                  poster="/images/sculptural_vase.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoError(true)}
                  style={{ display: 'block' }}
                />
              ) : (
                <img
                  src="/images/sculptural_vase.jpg"
                  alt="Sculptural handcrafted vase"
                />
              )}

              {/* Cinematic Vignette Overlay */}
              <div className="hero-video-gradient" />

              {/* Studio Reel Status Badge */}
              <div className="hero-video-badge">
                <span className="hero-video-dot" />
                Artisan Reel
              </div>

              {/* Video Play/Pause & Audio Controls */}
              {!videoError && (
                <div className="hero-video-controls">
                  <button
                    type="button"
                    className="hero-video-btn"
                    onClick={togglePlay}
                    title={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: '1px' }} />}
                  </button>
                  <button
                    type="button"
                    className="hero-video-btn"
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                </div>
              )}

              <div
                className="hero-tile-pill"
                style={{ bottom: '16px', top: 'auto', cursor: 'pointer', zIndex: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('Home Decor');
                }}
              >
                Sculptural Vessels
              </div>
              <div className="hero-tile-btn" style={{ zIndex: 2 }}>
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
              onClick={() => onSelectProductById('crochet-artisan-floral-bouquet')}
            >
              <img
                src="/images/crochet-artisan-floral-bouquet.jpg"
                alt="Handcrafted Crochet Floral Bouquet"
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
