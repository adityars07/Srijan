import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { ARTICLES } from '../../data/articles';
import type { ArticleItem } from '../../types';

interface ArticlesSectionProps {
  onSelectArticle?: (article: ArticleItem) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = () => {
  return (
    <section className="articles-section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Studio Journal</div>
            <h2 className="section-title">Artisan Stories & Care Guides</h2>
          </div>
        </div>

        <div className="articles-grid">
          {ARTICLES.map((article) => (
            <article key={article.id} className="article-card">
              <div className="article-img-wrap">
                <img src={article.image} alt={article.title} loading="lazy" />
              </div>

              <div className="article-content">
                <div className="article-meta">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>

                <div className="article-read-btn">
                  <span>Read story</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
