import React, { useState } from 'react';
import { X, Send, CheckCircle2, HeartHandshake } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';

interface CustomCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomCommissionModal: React.FC<CustomCommissionModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Resin Art');
  const [occasion, setOccasion] = useState('Anniversary');
  const [budgetRange, setBudgetRange] = useState('₹3,500 - ₹5,000');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.customRequests.create({
        name,
        email,
        phone,
        category,
        occasion,
        budgetRange,
        description,
      });

      setSubmitted(true);
      showToast('Your custom commission inquiry has been submitted directly to Rakhi!');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setName('');
        setEmail('');
        setPhone('');
        setDescription('');
      }, 2500);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit inquiry. Please try again.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-modal-container"
        style={{ maxWidth: '640px', padding: '36px 32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '10px' }}>
              Inquiry Received!
            </h3>
            <p style={{ color: '#746D66', fontSize: '0.94rem', lineHeight: 1.6 }}>
              Thank you for trusting Srijan with your vision. Rakhi will personally review your specifications and contact you via WhatsApp / Email with a design layout and estimate within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#F4EFEA',
                  color: '#C48B71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <HeartHandshake size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', marginBottom: '6px' }}>
                Commission a Bespoke Creation
              </h3>
              <p style={{ color: '#746D66', fontSize: '0.88rem' }}>
                Have a special anniversary, milestone wedding, or unique home entrance idea? Tell Rakhi your dream.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#2B2523', marginBottom: '4px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #EBE4DA',
                      fontSize: '0.88rem',
                      background: '#FBF9F5',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#2B2523', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="pooja@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #EBE4DA',
                      fontSize: '0.88rem',
                      background: '#FBF9F5',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#2B2523', marginBottom: '4px' }}>
                    WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98112 34567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #EBE4DA',
                      fontSize: '0.88rem',
                      background: '#FBF9F5',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#2B2523', marginBottom: '4px' }}>
                    Art Craft Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #EBE4DA',
                      fontSize: '0.88rem',
                      background: '#FBF9F5',
                    }}
                  >
                    <option value="Resin Art">Resin Art & Keepsakes</option>
                    <option value="Name Plates">Clay Entrance Nameplates</option>
                    <option value="Crochet">Crochet Bouquets & Accents</option>
                    <option value="Home Decor">Sculptural Decor / Lipan</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#2B2523', marginBottom: '4px' }}>
                    Occasion / Goal
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #EBE4DA',
                      fontSize: '0.88rem',
                      background: '#FBF9F5',
                    }}
                  >
                    <option value="Anniversary">Wedding Anniversary</option>
                    <option value="Wedding">Wedding Varmala Preservation</option>
                    <option value="Housewarming">New Home Griha Pravesh</option>
                    <option value="Birthday">Birthday / Gift</option>
                    <option value="Corporate">Bespoke Studio Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#2B2523', marginBottom: '4px' }}>
                  Target Budget
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Under ₹3,500', '₹3,500 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000+'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudgetRange(b)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: budgetRange === b ? '#2B2523' : '#EBE4DA',
                        backgroundColor: budgetRange === b ? '#2B2523' : '#FBF9F5',
                        color: budgetRange === b ? '#FBF9F5' : '#746D66',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#2B2523', marginBottom: '4px' }}>
                  Describe Your Vision & Customization Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. We want to preserve our wedding garlands in a 32 cm scalloped resin frame with 24K gold foil, names 'Pooja & Aman', and date 24th Nov 2025."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #EBE4DA',
                    fontSize: '0.88rem',
                    background: '#FBF9F5',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '6px',
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  backgroundColor: '#2B2523',
                  color: '#FBF9F5',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Sending to Rakhi...' : 'Submit Bespoke Inquiry'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
