import React, { useState } from 'react';
import { Star, Edit3, X } from 'lucide-react';
import type { CustomerReview } from '../../types';
import { useCart } from '../../context/CartContext';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const { showToast } = useCart();
  const [reviewList, setReviewList] = useState<CustomerReview[]>(reviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      author,
      location: location || 'India',
      rating,
      comment,
      date: 'Just now',
    };

    setReviewList([newReview, ...reviewList]);
    setIsModalOpen(false);
    setAuthor('');
    setLocation('');
    setComment('');
    showToast('Thank you for sharing your review!');
  };

  return (
    <section className="reviews-section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Customer Love</div>
            <h2 className="section-title">What Our Collectors Say</h2>
          </div>

          <button
            className="see-all-link"
            onClick={() => setIsModalOpen(true)}
          >
            <Edit3 size={15} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews Cards Grid */}
        <div className="reviews-grid">
          {reviewList.slice(0, 3).map((rev) => (
            <div key={rev.id} className="review-card">
              <div>
                <div className="review-stars-row">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#C48B71" stroke="#C48B71" />
                  ))}
                </div>
                <p className="review-text">"{rev.comment}"</p>
              </div>

              <div className="review-author-meta">
                <div>
                  <h5 className="review-author-name">{rev.author}</h5>
                  <span className="review-author-loc">{rev.location}</span>
                </div>

                {rev.productImage && (
                  <img
                    src={rev.productImage}
                    alt={rev.productName || 'Handcrafted piece'}
                    className="review-product-thumb"
                    title={rev.productName}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="search-modal-container"
            style={{ maxWidth: '520px', padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Share Your Experience</h3>
              <button className="icon-action-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-field">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      style={{ padding: '6px' }}
                    >
                      <Star
                        size={24}
                        fill={num <= rating ? '#C48B71' : 'none'}
                        stroke={num <= rating ? '#C48B71' : '#9E968E'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Radhika Roy"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Your City / Country</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Your Review *</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about the texture, craft details, or gifting story..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="checkout-action-btn"
                style={{ marginTop: '8px' }}
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
