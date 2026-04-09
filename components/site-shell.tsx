import Link from "next/link";
import { miniProfile, railItems, type NavSection, type RailKey, type TopAction } from "@/lib/site-data";

type SiteShellProps = {
  railKey: RailKey;
  crumb: string;
  topTitle: string;
  topDesc: string;
  navSections: NavSection[];
  currentPath: string;
  topActions?: TopAction[];
  aside?: React.ReactNode;
  children: React.ReactNode;
};

function iconToneClass(tone: string) {
  return `mi-${tone}`;
}

export function SiteShell({
  railKey,
  crumb,
  topTitle,
  topDesc,
  navSections,
  currentPath,
  topActions,
  aside,
  children
}: SiteShellProps) {
  return (
    <div className={`layout${aside ? " has-aside" : ""}`}>
      <aside className="rail">
        <Link className="brand" href="/">
          0x
        </Link>
        <nav className="rail-nav">
          {railItems.map((item) => (
            <Link
              key={item.key}
              className="rail-btn"
              href={item.href}
              aria-current={item.key === railKey ? "page" : undefined}
            >
              <span className="icon">{item.icon}</span>
              <span className="txt">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="rail-bottom">
          <Link className="rail-btn" href="/misc">
            <span className="icon">+</span>
            <span className="txt">more</span>
          </Link>
        </div>
      </aside>

      <aside className="nav-panel">
        <div className="nav-header">
          <div>
            <div className="nav-title">security archive</div>
            <div className="nav-sub">categories &amp; navigation</div>
          </div>
          <div className="status">online</div>
        </div>

        <div className="nav-scroll">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="section-label">{section.label}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  className="menu-item"
                  href={item.href}
                  aria-current={item.href === currentPath ? "page" : undefined}
                >
                  <div className={`menu-icon ${iconToneClass(item.iconTone)}`}>{item.icon}</div>
                  <div className="menu-meta">
                    <div className="menu-name">{item.name}</div>
                    <div className="menu-desc">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          ))}

          <div className="profile-mini">
            <div className="row">
              <div className="avatar-sm">0x</div>
              <div>
                <div className="name">{miniProfile.name}</div>
                <div className="tag">{miniProfile.tag}</div>
              </div>
            </div>
            <div className="mini-actions">
              <a className="mini-chip" href={miniProfile.githubHref} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <Link className="mini-chip" href={miniProfile.postsHref}>
                {miniProfile.postsLabel}
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="crumb">{crumb}</div>
          <div>
            <div className="top-title">{topTitle}</div>
            <div className="top-desc">{topDesc}</div>
          </div>
          {topActions?.length ? (
            <div className="top-actions">
              {topActions.map((action) =>
                action.href.startsWith("http") ? (
                  <a key={action.label} className="top-btn" href={action.href} target="_blank" rel="noreferrer">
                    {action.label}
                  </a>
                ) : (
                  <Link key={action.label} className="top-btn" href={action.href}>
                    {action.label}
                  </Link>
                )
              )}
            </div>
          ) : null}
        </header>
        <section className="feed">{children}</section>
      </main>

      {aside}
    </div>
  );
}
