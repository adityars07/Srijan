import React, { useState, useRef } from 'react';
import { ArrowUpRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface HeroCollageProps {
  onExploreClick?: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectProductById: (id: string) => void;
}

export const HeroCollage: React.FC<HeroCollageProps> = ({
  onExploreClick,
  onSelectCategory: _onSelectCategory,
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
            <div
              className="hero-feature-card-content"
              onClick={onExploreClick}
              style={{ cursor: onExploreClick ? 'pointer' : 'default' }}
              title="Explore all handcrafted creations"
            >
              <h1 className="hero-title">
                Handcrafted Elegance for Your Home
              </h1>
              <p className="hero-description">
                Discover bespoke artisan treasures: everlasting crochet blooms, preserved botanical resin frames, wheel-thrown stoneware, and personalized entrance plaques.
              </p>
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <img
                  src="/images/sculptural_vase.jpg"
                  alt="Sculptural handcrafted vase"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    {isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: '1px' }} />}
                  </button>
                  <button
                    type="button"
                    className="hero-video-btn"
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                </div>
              )}

              <div className="hero-tile-btn" style={{ zIndex: 2 }}>
                <ArrowUpRight size={17} />
              </div>
            </div>
          </div>

          {/* Middle Column Collage */}
          <div className="hero-col">
            {/* Top Tile: Ceramic Tableware / Plates */}
            <div
              className="hero-image-tile"
              onClick={() => onSelectProductById('dalmation-side-plate-24cm')}
              title="Tableware Creations"
            >
              <img
                src="/images/ceramic_plates.jpg"
                alt="Handcrafted ceramic dinner plate with dried pampas"
              />
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>

            {/* Bottom Tile: Custom Resin Art */}
            <div
              className="hero-image-tile"
              onClick={() => onSelectProductById('resin-customized-frame-large')}
              title="Resin Keepsakes"
            >
              <img
                src="/images/resin_frame.jpg"
                alt="Botanical resin art frame with gold flecks"
              />
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>
          </div>

          {/* Right Column Collage */}
          <div className="hero-col">
            {/* Top Tile: Crochet Floral Bouquets */}
            <div
              className="hero-image-tile"
              onClick={() => onSelectProductById('crochet-artisan-floral-bouquet')}
              title="Crochet Blooms"
            >
              <img
                src="/images/crochet-artisan-floral-bouquet.jpg"
                alt="Handcrafted Crochet Floral Bouquet"
              />
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>

            {/* Bottom Tile: Stoneware Cups & Planters */}
            <div
              className="hero-image-tile"
              onClick={() => onSelectProductById('aurora-brew-mug-speckled')}
              title="Artisan Cups"
            >
              <img
                src="/images/stoneware_mug.jpg"
                alt="Artisan stoneware cup"
              />
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
