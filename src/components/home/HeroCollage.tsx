import React, { useState, useRef } from 'react';
import { ArrowUpRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import type { Product } from '../../types';

interface HeroCollageProps {
  products?: Product[];
  onExploreClick?: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectProductById: (id: string) => void;
}

export const HeroCollage: React.FC<HeroCollageProps> = ({
  products = [],
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
      videoRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const tile1 = products[0];
  const tile2 = products[1];
  const tile3 = products[2];
  const tile4 = products[3];

  const handleTileClick = (p?: Product) => {
    if (p) {
      onSelectProductById(p.id);
    } else if (onExploreClick) {
      onExploreClick();
    }
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
              onClick={() => handleTileClick(tile1)}
              style={{ cursor: 'pointer' }}
              title="Artisan Studio Reel"
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
                  src={tile1?.images?.[0] || '/images/sculptural_vase.jpg'}
                  alt={tile1?.name || 'Sculptural handcrafted vase'}
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
            {/* Top Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile1)}
              title={tile1?.name || 'Tableware Creations'}
            >
              <img
                src={tile1?.images?.[0] || '/images/ceramic_plates.jpg'}
                alt={tile1?.name || 'Handcrafted ceramic dinner plate with dried pampas'}
              />
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>

            {/* Bottom Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile2)}
              title={tile2?.name || 'Resin Keepsakes'}
            >
              <img
                src={tile2?.images?.[0] || '/images/resin_frame.jpg'}
                alt={tile2?.name || 'Botanical resin art frame with gold flecks'}
              />
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>
          </div>

          {/* Right Column Collage */}
          <div className="hero-col">
            {/* Top Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile3)}
              title={tile3?.name || 'Crochet Blooms'}
            >
              <img
                src={tile3?.images?.[0] || '/images/crochet-artisan-floral-bouquet.jpg'}
                alt={tile3?.name || 'Handcrafted Crochet Floral Bouquet'}
              />
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>

            {/* Bottom Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile4)}
              title={tile4?.name || 'Artisan Cups'}
            >
              <img
                src={tile4?.images?.[0] || '/images/stoneware_mug.jpg'}
                alt={tile4?.name || 'Artisan stoneware cup'}
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
