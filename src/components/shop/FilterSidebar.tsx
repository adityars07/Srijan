import React from 'react';
import type { FilterState } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const { currency } = useCurrency();

  const categories = [
    'Crochet',
    'Resin Art',
    'Name Plates',
    'Ceramics & Mugs',
    'Plates & Bowls',
    'Home Decor',
  ];

  const collections = [
    'Heritage Resin',
    'Earth & Clay',
    'Boho Blooms',
    'Minimalist Stoneware',
    'Signature Srijan',
  ];

  const priceRanges = [
    { label: currency === 'INR' ? 'Under ₹2,000' : 'Under $25', min: 0, max: currency === 'INR' ? 2000 : 25 },
    { label: currency === 'INR' ? '₹2,000 - ₹3,500' : '$25 - $45', min: currency === 'INR' ? 2000 : 25, max: currency === 'INR' ? 3500 : 45 },
    { label: currency === 'INR' ? '₹3,500 - ₹5,000' : '$45 - $65', min: currency === 'INR' ? 3500 : 45, max: currency === 'INR' ? 5000 : 65 },
    { label: currency === 'INR' ? 'Above ₹5,000' : 'Above $65', min: currency === 'INR' ? 5000 : 65, max: 999999 },
  ];

  const toggleCategory = (cat: string) => {
    const exists = filters.categories.includes(cat);
    const updated = exists
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFilterChange({ ...filters, categories: updated });
  };

  const toggleCollection = (col: string) => {
    const exists = filters.collections.includes(col);
    const updated = exists
      ? filters.collections.filter((c) => c !== col)
      : [...filters.collections, col];
    onFilterChange({ ...filters, collections: updated });
  };

  const setPrice = (min: number, max: number) => {
    onFilterChange({ ...filters, priceRange: [min, max] });
  };

  return (
    <aside style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Category Checkboxes */}
      <div>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', color: '#2B2523' }}>
          Categories
        </h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map((cat) => (
            <label
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.88rem',
                color: '#746D66',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                style={{ accentColor: '#2B2523', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', color: '#2B2523' }}>
          Price Range
        </h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {priceRanges.map((range, idx) => {
            const isSelected =
              filters.priceRange[0] === range.min && filters.priceRange[1] === range.max;
            return (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  color: isSelected ? '#2B2523' : '#746D66',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="priceFilter"
                  checked={isSelected}
                  onChange={() => setPrice(range.min, range.max)}
                  style={{ accentColor: '#2B2523', cursor: 'pointer' }}
                />
                <span>{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Collections */}
      <div>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', color: '#2B2523' }}>
          Collections
        </h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {collections.map((col) => (
            <label
              key={col}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.88rem',
                color: '#746D66',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={filters.collections.includes(col)}
                onChange={() => toggleCollection(col)}
                style={{ accentColor: '#2B2523', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>{col}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        style={{
          padding: '10px',
          borderRadius: '9999px',
          border: '1px solid #EBE4DA',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#746D66',
          backgroundColor: '#F4EFEA',
          textAlign: 'center',
        }}
      >
        Reset All Filters
      </button>
    </aside>
  );
};
