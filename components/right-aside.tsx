import Link from "next/link";
import { rightAside } from "@/lib/site-data";
import { getAllPosts } from "@/lib/posts";

function toneClass(tone: string) {
  return `li-${tone}`;
}

export async function RightAside() {
  const posts = await getAllPosts();
  const ctfCount = posts.filter((post) => post.category === "ctf").length;
  const bugCount = posts.filter((post) => post.category === "bug").length;
  const devCount = posts.filter((post) => post.category === "dev").length;
  const thesisCount = posts.filter((post) => post.category === "thesis").length;
  const totalCount = posts.length;

  function getCategoryCount(href: string) {
    switch (href) {
      case "/security/ctf":
        return ctfCount;
      case "/security/bug":
        return bugCount;
      case "/dev":
        return devCount;
      case "/thesis":
        return thesisCount;
      default:
        return 0;
    }
  }

  return (
    <aside className="aside">
      <section className="card profile-card">
        <div className="profile-banner" />
        <div className="profile-head">
          <div className="avatar-lg">0x</div>
          <div>
            <div className="name-lg">jiun</div>
            <div className="handle">@jiun / blog</div>
          </div>
        </div>
        <p className="bio">
          Interested in web security, CTF, bug bounty. The goal is to leave structured
          records rather than scattered notes.
        </p>
        <div className="stats">
          <div className="stat-box">
            <div className="v">{ctfCount}</div>
            <div className="k">ctf</div>
          </div>
          <div className="stat-box">
            <div className="v">{bugCount}</div>
            <div className="k">bugs</div>
          </div>
          <div className="stat-box">
            <div className="v">{totalCount}</div>
            <div className="k">posts</div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-title">skills</div>
        <div className="skill-wrap">
          {rightAside.skills.map((skill) => (
            <span key={skill} className="skill">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-title">categories</div>
        {rightAside.categories.map((item) => (
          <Link key={item.href} className="list-row" href={item.href}>
            <div className={`list-icon ${toneClass(item.tone)}`}>{item.icon}</div>
            <div>
              <div className="list-name">{item.name}</div>
              <div className="list-sub">{getCategoryCount(item.href)} posts</div>
            </div>
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="card-title">links</div>
        {rightAside.links.map((item) =>
          item.href.startsWith("http") ? (
            <a key={item.name} className="list-row" href={item.href} target="_blank" rel="noreferrer">
              <div className={`list-icon ${toneClass(item.tone)}`}>{item.icon}</div>
              <div>
                <div className="list-name">{item.name}</div>
                <div className="list-sub">{item.sub}</div>
              </div>
            </a>
          ) : (
            <Link key={item.name} className="list-row" href={item.href}>
              <div className={`list-icon ${toneClass(item.tone)}`}>{item.icon}</div>
              <div>
                <div className="list-name">{item.name}</div>
                <div className="list-sub">{item.sub}</div>
              </div>
            </Link>
          )
        )}
      </section>
    </aside>
  );
}
