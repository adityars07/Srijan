import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CategoryShowcaseProps {
  onSelectCategory: (cat: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
  const showcaseItems = [
    {
      name: 'Stoneware & Cups',
      category: 'Ceramics & Mugs',
      image: '/images/stoneware_mug.jpg',
    },
    {
      name: 'Crochet & Blooms',
      category: 'Crochet',
      image: '/images/crochet-artisan-floral-bouquet.jpg',
    },
    {
      name: 'Resin Keepsakes',
      category: 'Resin Art',
      image: '/images/resin_frame.jpg',
    },
  ];

  return (
    <section className="category-showcase-section">
      <div className="container">
        <div className="category-banner-grid">
          {showcaseItems.map((item) => (
            <div
              key={item.name}
              className="category-banner-card"
              onClick={() => onSelectCategory(item.category)}
            >
              <img src={item.image} alt={item.name} loading="lazy" />
              <div className="category-banner-content">
                <h3 className="category-banner-name">{item.name}</h3>
                <span className="category-banner-btn">
                  <span>See all</span>
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
