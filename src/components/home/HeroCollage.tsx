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

  const getProductObjectPosition = (p?: Product) => {
    if (!p) return 'center center';
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();

    // Dream catchers, hangings, wall bells: keep the top ring / circle fully visible
    if (name.includes('dream') || name.includes('catcher') || name.includes('hanging') || name.includes('wall') || name.includes('bell')) {
      return 'center 10%';
    }

    // Bags, totes, clutches, pouches: keep the bag body at the bottom fully visible
    if (name.includes('bag') || name.includes('tote') || name.includes('pouch') || name.includes('purse') || name.includes('sling')) {
      return 'center 76%';
    }

    // Bouquets & flowers: nice balanced center
    if (name.includes('flower') || name.includes('bouquet') || name.includes('rose') || name.includes('lily')) {
      return 'center 45%';
    }

    // Plates, ceramics, lipan art, frames: center
    if (cat.includes('plate') || cat.includes('resin') || cat.includes('lipan') || name.includes('plate') || name.includes('frame') || name.includes('art')) {
      return 'center center';
    }

    return 'center center';
  };

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
                Discover bespoke artisan treasures: everlasting crochet blooms, preserved botanical resin frames, artisan crochet accessories, and personalized entrance plaques.
              </p>
            </div>

            {/* Bottom Arched Visual Art & Product Reel */}
            <div
              className="hero-bottom-art"
            >
              {!videoError ? (
                <video
                  ref={videoRef}
                  src="/videos/igexport-Dd0l4jISXI7.mp4"
                  poster="/images/crochet-artisan-floral-bouquet.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <img
                  src={tile1?.images?.[0] || '/images/crochet-artisan-floral-bouquet.jpg'}
                  alt={tile1?.name || 'Handcrafted Crochet Bouquet'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* Cinematic Vignette Overlay */}
              <div className="hero-video-gradient" />

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
            </div>
          </div>

          {/* Middle Column Collage */}
          <div className="hero-col hero-col-middle">
            {/* Top Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile1)}
              title={tile1?.name?.trim() || 'Artisan Totes'}
            >
              <img
                src={tile1?.images?.[0] || '/images/crochet-sunflower-tote-crossbody.jpg'}
                alt={tile1?.name?.trim() || 'Handcrafted sunflower tote bag'}
                style={{ objectPosition: getProductObjectPosition(tile1) }}
              />
              <div className="hero-tile-gradient" />
              <span className="hero-tile-pill">{tile1?.category || 'Handcrafted'}</span>
              <div className="hero-tile-caption">
                <h3 className="hero-tile-name">{tile1?.name?.trim() || 'Sunflower Tote'}</h3>
                {tile1?.priceINR && (
                  <div className="hero-tile-price">₹{tile1.priceINR.toLocaleString('en-IN')}</div>
                )}
              </div>
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>

            {/* Bottom Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile2)}
              title={tile2?.name?.trim() || 'Mandala Dreamcatcher'}
            >
              <img
                src={tile2?.images?.[0] || '/images/crochet-mandala-dreamcatcher-lavender.jpg'}
                alt={tile2?.name?.trim() || 'Serenity Lavender Mandala Crochet Dreamcatcher'}
                style={{ objectPosition: getProductObjectPosition(tile2) }}
              />
              <div className="hero-tile-gradient" />
              <span className="hero-tile-pill">{tile2?.category || 'Handcrafted'}</span>
              <div className="hero-tile-caption">
                <h3 className="hero-tile-name">{tile2?.name?.trim() || 'Mandala Dreamcatcher'}</h3>
                {tile2?.priceINR && (
                  <div className="hero-tile-price">₹{tile2.priceINR.toLocaleString('en-IN')}</div>
                )}
              </div>
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>
          </div>

          {/* Right Column Collage */}
          <div className="hero-col hero-col-right">
            {/* Top Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile3)}
              title={tile3?.name?.trim() || 'Crochet Blooms'}
            >
              <img
                src={tile3?.images?.[0] || '/images/crochet-artisan-floral-bouquet.jpg'}
                alt={tile3?.name?.trim() || 'Handcrafted Crochet Floral Bouquet'}
                style={{ objectPosition: getProductObjectPosition(tile3) }}
              />
              <div className="hero-tile-gradient" />
              <span className="hero-tile-pill">{tile3?.category || 'Handcrafted'}</span>
              <div className="hero-tile-caption">
                <h3 className="hero-tile-name">{tile3?.name?.trim() || 'Crochet Blooms'}</h3>
                {tile3?.priceINR && (
                  <div className="hero-tile-price">₹{tile3.priceINR.toLocaleString('en-IN')}</div>
                )}
              </div>
              <div className="hero-tile-btn">
                <ArrowUpRight size={17} />
              </div>
            </div>

            {/* Bottom Tile */}
            <div
              className="hero-image-tile"
              onClick={() => handleTileClick(tile4)}
              title={tile4?.name?.trim() || 'Potted Sunflowers'}
            >
              <img
                src={tile4?.images?.[0] || '/images/crochet-potted-sunflowers.jpg'}
                alt={tile4?.name?.trim() || 'Twin Blooming Crochet Sunflowers'}
                style={{ objectPosition: getProductObjectPosition(tile4) }}
              />
              <div className="hero-tile-gradient" />
              <span className="hero-tile-pill">{tile4?.category || 'Handcrafted'}</span>
              <div className="hero-tile-caption">
                <h3 className="hero-tile-name">{tile4?.name?.trim() || 'Potted Sunflowers'}</h3>
                {tile4?.priceINR && (
                  <div className="hero-tile-price">₹{tile4.priceINR.toLocaleString('en-IN')}</div>
                )}
              </div>
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
