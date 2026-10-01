import React from 'react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    'All Creations',
    'Floral & Bouquets',
    'Bags & Totes',
    'Wall Art & Decor',
    'Amigurumi & Keychains',
    'Everyday Accessories',
  ];

  return (
    <div className="category-pills-bar">
      <div className="container">
        <div className="pills-scroll-container">
          {categories.map((cat) => {
            const isActive =
              (cat === 'All Creations' && selectedCategory === 'all') ||
              selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat === 'All Creations' ? 'all' : cat)}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
