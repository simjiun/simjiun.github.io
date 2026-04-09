import Link from "next/link";
import type { HeroData, PostCardData } from "@/lib/site-data";

export function HeroBlock({ hero }: { hero: HeroData }) {
  return (
    <div className="hero">
      <div className="hero-top">
        <div className="hero-avatar">{hero.avatar}</div>
        <div>
          <div className="hero-eyebrow">{hero.eyebrow}</div>
          <h1>{hero.title}</h1>
          <p>{hero.body}</p>
          {hero.tags?.length ? (
            <div className="hero-tags">
              {hero.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SectionHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
    </div>
  );
}

export function PostList({ cards }: { cards: PostCardData[] }) {
  return (
    <div className="post-list">
      {cards.map((card) => (
        <article key={`${card.title}-${card.badge}`} className="post-card">
          <div className="post-inner">
            <div className="post-top">
              <div>
                <div className={`badge b-${card.badgeTone}`}>{card.badge}</div>
                <h3 className="post-title">{card.title}</h3>
                <p className="post-summary">{card.summary}</p>
                {card.meta?.length ? (
                  <div className="post-meta">
                    {card.meta.map((meta) => (
                      <span key={meta} className="meta-pill">
                        {meta}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {card.statLabel && card.statValue ? (
                <div className="post-stat">
                  <div className="label">{card.statLabel}</div>
                  <div className="value">{card.statValue}</div>
                </div>
              ) : null}
            </div>
            {(card.primaryAction || card.secondaryAction) && (
              <div className="post-actions">
                {card.primaryAction ? (
                  <Link className="action-btn primary" href={card.primaryAction.href}>
                    {card.primaryAction.label}
                  </Link>
                ) : null}
                {card.secondaryAction ? (
                  <Link className="action-btn" href={card.secondaryAction.href}>
                    {card.secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function MarkdownContent({ html }: { html: string }) {
  return (
    <article className="post-card">
      <div className="post-inner markdown" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
