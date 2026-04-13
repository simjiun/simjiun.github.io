export type RailKey = "home" | "security" | "dev" | "thesis" | "misc";
export type IconTone = "intro" | "dev" | "sec" | "doc" | "cert";
export type BadgeTone = "ctf" | "bug" | "dev" | "doc" | "sec" | "cert";

export type NavItem = {
  href: string;
  icon: string;
  iconTone: IconTone;
  name: string;
  desc: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export type TopAction = {
  href: string;
  label: string;
};

export type HeroData = {
  avatar: string;
  eyebrow: string;
  title: string;
  body: string;
  tags?: string[];
};

export type PostCardData = {
  badge: string;
  badgeTone: BadgeTone;
  title: string;
  summary: string;
  meta?: string[];
  statLabel?: string;
  statValue?: string;
  primaryAction?: TopAction;
  secondaryAction?: TopAction;
};

export const railItems = [
  { key: "home" as const, href: "/", icon: "\u2302", label: "home" },
  { key: "security" as const, href: "/security", icon: "\uD83D\uDD10", label: "security" },
  { key: "dev" as const, href: "/dev", icon: "\u2318", label: "dev" },
  { key: "thesis" as const, href: "/thesis", icon: "\uD83D\uDCD6", label: "Thesis" },
  { key: "misc" as const, href: "/misc", icon: "\uD83D\uDC7E", label: "misc" }
];

export const miniProfile = {
  name: "jiun",
  tag: "security researcher",
  githubHref: "https://github.com/simjiun",
  postsHref: "/posts/hello-github-io",
  postsLabel: "Posts 24"
};

export const homeNavSections: NavSection[] = [
  {
    label: "HOME",
    items: [{ href: "/", icon: "ME", iconTone: "intro", name: "about me", desc: "profile and recent activity" }]
  },
  {
    label: "development",
    items: [
      { href: "/dev", icon: "DEV", iconTone: "dev", name: "development", desc: "general development and projects" },
      { href: "/dev/projects", icon: "DOC", iconTone: "doc", name: "projects", desc: "notes and documentation" }
    ]
  },
  {
    label: "security",
    items: [
      { href: "/security/ctf", icon: "CTF", iconTone: "sec", name: "CTF", desc: "ctf challenge writeups" },
      { href: "/security/wargame", icon: "WRG", iconTone: "sec", name: "Wargame", desc: "wargame study notes" },
      { href: "/security/bug", icon: "BUG", iconTone: "sec", name: "Bug Bounty", desc: "reports and vulnerability analysis" },
      { href: "/thesis", icon: "PPR", iconTone: "doc", name: "papers / conference", desc: "research review" }
    ]
  },
  {
    label: "misc",
    items: [{ href: "/misc", icon: "CRT", iconTone: "cert", name: "certifications", desc: "contests and archived notes" }]
  }
];

export const pageNavSections = {
  home: homeNavSections,
  security: [
    {
      label: "security",
      items: [
        { href: "/security", icon: "SEC", iconTone: "sec", name: "security", desc: "overview and categories" },
        { href: "/security/ctf", icon: "CTF", iconTone: "sec", name: "CTF", desc: "ctf challenge writeups" },
        { href: "/security/wargame", icon: "WRG", iconTone: "sec", name: "Wargame", desc: "wargame study notes" },
        { href: "/security/bug", icon: "BUG", iconTone: "sec", name: "Bug Bounty", desc: "reports and vulnerability analysis" }
      ]
    },
    {
      label: "connected",
      items: [{ href: "/thesis", icon: "PPR", iconTone: "doc", name: "papers / conference", desc: "research review" }]
    }
  ] as NavSection[],
  dev: [
    {
      label: "development",
      items: [
        { href: "/dev", icon: "DEV", iconTone: "dev", name: "development", desc: "general development and projects" },
        { href: "/dev/projects", icon: "DOC", iconTone: "doc", name: "projects", desc: "notes and documentation" }
      ]
    }
  ] as NavSection[],
  misc: [
    {
      label: "misc",
      items: [
        { href: "/misc", icon: "ETC", iconTone: "cert", name: "records", desc: "ops notes and side logs" },
        { href: "/misc/archive", icon: "ARC", iconTone: "cert", name: "archive", desc: "saved references and notes" }
      ]
    }
  ] as NavSection[],
  thesis: [
    {
      label: "research",
      items: [
        { href: "/thesis", icon: "PPR", iconTone: "doc", name: "papers / conference", desc: "research review and session notes" },
        { href: "/security", icon: "SEC", iconTone: "sec", name: "security", desc: "linked practical notes" }
      ]
    }
  ] as NavSection[],
  post: [
    {
      label: "post",
      items: [
        { href: "/posts/hello-github-io", icon: "POST", iconTone: "doc", name: "hello-github-io", desc: "sample post page" },
        { href: "/security/ctf", icon: "CTF", iconTone: "sec", name: "CTF category", desc: "writeups and study notes" },
        { href: "/security/bug", icon: "BUG", iconTone: "sec", name: "Bug Bounty", desc: "reports and vulnerability analysis" }
      ]
    }
  ] as NavSection[]
};

export const pages = {
  home: {
    railKey: "home" as const,
    crumb: "~/home",
    topTitle: "home",
    topDesc: "home page",
    topActions: [
      { href: "/security", label: "search" },
      { href: "/posts/hello-github-io", label: "posts" },
      { href: "https://github.com/simjiun", label: "contact" }
    ],
    hero: {
      avatar: "0x",
      eyebrow: "$ whoami",
      title: "SIM JI UN ",
      body: "hello world!",
      tags: ["Web Hacking", "Bug Bounty"]
    },
    sectionTitle: "$ recent_posts",
    sectionDesc: "rebuilt as a post feed instead of a chat layout",
    posts: [
      {
        badge: "CTF / Wargame",
        badgeTone: "ctf" as const,
        title: "LACTF 2025 Web - admin-panel Writeup",
        summary: "A writeup focused on JWT confusion and SSRF chaining that led to admin panel access, with the request flow and privilege escalation path broken down step by step.",
        meta: ["jwt", "ssrf", "web", "2025.01.28"],
        statLabel: "difficulty",
        statValue: "medium",
        primaryAction: { href: "/posts/hello-github-io", label: "read post" },
        secondaryAction: { href: "/security/ctf", label: "view tags" }
      },
      {
        badge: "Bug Bounty",
        badgeTone: "bug" as const,
        title: "Stored XSS via SVG Upload Bypass",
        summary: "A report covering extension filter bypass, content-type spoofing, and the exact points where server-side validation failed during a stored XSS reproduction.",
        meta: ["xss", "upload", "svg", "P2"],
        statLabel: "platform",
        statValue: "H1",
        primaryAction: { href: "/security/bug", label: "read post" },
        secondaryAction: { href: "/security/bug", label: "report summary" }
      },
      {
        badge: "development",
        badgeTone: "dev" as const,
        title: "A lightweight port scanner in Rust",
        summary: "A project log for a Tokio-based scanner with async execution, banner grabbing, and JSON output design notes.",
        meta: ["rust", "tokio", "async", "network"],
        statLabel: "stars",
        statValue: "128",
        primaryAction: { href: "/dev/projects", label: "read post" },
        secondaryAction: { href: "/dev", label: "GitHub" }
      },
      {
        badge: "certification",
        badgeTone: "cert" as const,
        title: "OSCP review - 93 days of preparation",
        summary: "A practical writeup of study pacing, lab use, exam strategy, and the problems that mattered during preparation.",
        meta: ["oscp", "offsec", "pentest", "2024.12.05"],
        statLabel: "period",
        statValue: "93d",
        primaryAction: { href: "/misc/archive", label: "read post" }
      }
    ]
  },
  security: {
    railKey: "security" as const,
    crumb: "~/security",
    topTitle: "security",
    topDesc: "security research, CTF, and bug bounty",
    topActions: [
      { href: "/security/ctf", label: "ctf" },
      { href: "/security/wargame", label: "wargame" },
      { href: "/security/bug", label: "bug" },
      { href: "/posts/hello-github-io", label: "posts" }
    ],
    hero: {
      avatar: "SEC",
      eyebrow: "$ ls ./security",
      title: "A place for practical security notes",
      body: "This section collects CTF writeups, web vulnerability notes, and bug bounty analysis in category pages and linked posts.",
      tags: ["CTF", "Web", "Bug Bounty", "Research"]
    },
    posts: [
      {
        badge: "CTF / Wargame",
        badgeTone: "ctf" as const,
        title: "Writeups and study logs",
        summary: "Challenge solutions are rewritten into cleaner posts with the root cause, exploit chain, and final approach separated clearly.",
        meta: ["writeup", "web", "pwn"],
        statLabel: "posts",
        statValue: "7",
        primaryAction: { href: "/security/ctf", label: "open category" }
      },
      {
        badge: "Bug Bounty",
        badgeTone: "bug" as const,
        title: "Real reports and vulnerability analysis",
        summary: "This category keeps reproduction notes, root causes, bypasses, and remediation context in a report-oriented format.",
        meta: ["xss", "ssrf", "report"],
        statLabel: "posts",
        statValue: "4",
        primaryAction: { href: "/security/bug", label: "open category" }
      }
    ]
  },
  securityCtf: {
    railKey: "security" as const,
    crumb: "~/security/ctf",
    topTitle: "ctf archive",
    topDesc: "ctf challenge writeups",
    topActions: [
      { href: "/security/wargame", label: "wargame" },
      { href: "/security", label: "overview" }
    ],
    hero: {
      avatar: "CTF",
      eyebrow: "$ ls ./security/ctf",
      title: "A category page for CTF notes",
      body: "Contest CTF writeups are grouped here and linked to individual posts."
    },
    posts: [
      {
        badge: "WRITEUP",
        badgeTone: "ctf" as const,
        title: "hello-github-io",
        summary: "A connected sample post. When more real CTF posts are added, this list can be expanded without changing the layout.",
        meta: ["sample", "static", "routing"],
        statLabel: "level",
        statValue: "easy",
        primaryAction: { href: "/posts/hello-github-io", label: "read post" }
      }
    ]
  },
  securityWargame: {
    railKey: "security" as const,
    crumb: "~/security/wargame",
    topTitle: "wargame archive",
    topDesc: "wargame practice notes",
    topActions: [
      { href: "/security/ctf", label: "ctf" },
      { href: "/security", label: "overview" }
    ],
    hero: {
      avatar: "WRG",
      eyebrow: "$ ls ./security/wargame",
      title: "A category page for Wargame notes",
      body: "Practice logs and structured notes from wargame-style challenges are grouped here."
    },
    posts: [
      {
        badge: "WARGAME",
        badgeTone: "ctf" as const,
        title: "wargame starter note",
        summary: "Add posts with category=ctf and ctfGroup=wargame to publish them in this route.",
        meta: ["wargame", "practice"],
        statLabel: "group",
        statValue: "wargame",
        primaryAction: { href: "/security/wargame", label: "open route" }
      }
    ]
  },
  securityBug: {
    railKey: "security" as const,
    crumb: "~/security/bug",
    topTitle: "bug bounty",
    topDesc: "reports, vulnerability analysis, and reproduction notes",
    topActions: [
      { href: "/security", label: "overview" },
      { href: "/posts/hello-github-io", label: "posts" }
    ],
    hero: {
      avatar: "BUG",
      eyebrow: "$ ls ./security/bug",
      title: "A category page for bug bounty work",
      body: "This page is for report flow, reproduction details, and vulnerability analysis notes."
    },
    posts: [
      {
        badge: "REPORT",
        badgeTone: "bug" as const,
        title: "Stored XSS via SVG Upload Bypass",
        summary: "A concise report on stored XSS triggered through extension filter bypass and content-type spoofing.",
        meta: ["xss", "upload", "svg"],
        statLabel: "platform",
        statValue: "H1"
      }
    ]
  },
  dev: {
    railKey: "dev" as const,
    crumb: "~/dev",
    topTitle: "development",
    topDesc: "development logs, projects, and documentation",
    topActions: [
      { href: "/dev/projects", label: "projects" },
      { href: "/posts/hello-github-io", label: "posts" },
      { href: "/security", label: "security" }
    ],
    hero: {
      avatar: "DEV",
      eyebrow: "$ ls ./dev",
      title: "A place for implementation notes",
      body: "This section contains development logs for the blog, automation scripts, personal tools, and technical documentation.",
      tags: ["Rust", "Python", "Automation", "Docs"]
    },
    posts: [
      {
        badge: "PROJECT",
        badgeTone: "dev" as const,
        title: "A lightweight port scanner in Rust",
        summary: "A dev log covering async scanning, banner grabbing, and JSON output design in a small network tool.",
        meta: ["rust", "tokio", "network"],
        statLabel: "stars",
        statValue: "128",
        primaryAction: { href: "/dev/projects", label: "open project" }
      },
      {
        badge: "DOC",
        badgeTone: "doc" as const,
        title: "Documentation and deployment notes",
        summary: "Setup steps, deployment flow, and troubleshooting are kept as reusable documentation instead of one-off notes.",
        meta: ["deploy", "log", "docs"],
        statLabel: "mode",
        statValue: "log"
      }
    ]
  },
  devProjects: {
    railKey: "dev" as const,
    crumb: "~/dev/projects",
    topTitle: "projects",
    topDesc: "active and completed projects",
    topActions: [
      { href: "/dev", label: "dev" },
      { href: "/posts/hello-github-io", label: "posts" },
      { href: "/security", label: "security" }
    ],
    hero: {
      avatar: "PRJ",
      eyebrow: "$ ls ./dev/projects",
      title: "Project-focused records",
      body: "This page groups work by project goals, implementation choices, and follow-up tasks.",
      tags: ["project", "tooling", "network"]
    },
    posts: [
      {
        badge: "PROJECT",
        badgeTone: "dev" as const,
        title: "Rust port scanner",
        summary: "A compact network tool built around async scanning, banner grabbing, and structured output.",
        meta: ["rust", "tokio", "scanner"],
        statLabel: "lang",
        statValue: "rust"
      },
      {
        badge: "DOCUMENT",
        badgeTone: "doc" as const,
        title: "GitHub Pages blog rebuild",
        summary: "A rebuild focused on route structure, section navigation, and a cleaner cyber-style interface.",
        meta: ["html", "css", "github pages"],
        statLabel: "status",
        statValue: "live"
      }
    ]
  },
  misc: {
    railKey: "misc" as const,
    crumb: "~/misc",
    topTitle: "misc",
    topDesc: "side notes, logs, and operating notes",
    topActions: [
      { href: "/misc/archive", label: "archive" },
      { href: "/thesis", label: "thesis" }
    ],
    hero: {
      avatar: "ETC",
      eyebrow: "$ ls ./misc",
      title: "A supporting section for broad topics",
      body: "This route is for operational logs, short notes, and anything that does not fit a main category."
    },
    posts: [
      {
        badge: "ARCHIVE",
        badgeTone: "cert" as const,
        title: "Ops notes and side records",
        summary: "Short memos, supporting notes, and items that are useful later but not large enough for a dedicated section.",
        meta: ["memo", "ops", "archive"],
        statLabel: "type",
        statValue: "misc"
      }
    ]
  },
  miscArchive: {
    railKey: "misc" as const,
    crumb: "~/misc/archive",
    topTitle: "archive",
    topDesc: "saved references and link collections",
    topActions: [
      { href: "/misc", label: "misc" },
      { href: "/posts/hello-github-io", label: "posts" }
    ],
    hero: {
      avatar: "ARC",
      eyebrow: "$ ls ./misc/archive",
      title: "Archive for reusable references",
      body: "This page keeps short references, saved links, and notes that may be useful again later."
    },
    posts: [
      {
        badge: "ARCHIVE",
        badgeTone: "cert" as const,
        title: "Reference links and notes",
        summary: "A place for practical references, saved material, and quick lookup notes.",
        meta: ["links", "reference", "memo"],
        statLabel: "store",
        statValue: "keep"
      }
    ]
  },
  thesis: {
    railKey: "thesis" as const,
    crumb: "~/thesis",
    topTitle: "thesis",
    topDesc: "papers, conferences, and research notes",
    topActions: [
      { href: "/security", label: "security" },
      { href: "/posts/hello-github-io", label: "posts" }
    ],
    hero: {
      avatar: "PPR",
      eyebrow: "$ ls ./thesis",
      title: "Archive for papers and conference notes",
      body: "This section summarizes papers, talks, and current research trends around offensive security and defense.",
      tags: ["paper", "conference", "research", "review"]
    },
    posts: [
      {
        badge: "PAPER",
        badgeTone: "doc" as const,
        title: "Notes on automated web vulnerability discovery",
        summary: "A summary of static analysis, fuzzing, and LLM-assisted analysis approaches that could feed into future posts.",
        meta: ["websec", "automation", "survey"],
        statLabel: "year",
        statValue: "2025"
      },
      {
        badge: "CONF",
        badgeTone: "sec" as const,
        title: "Offensive security conference session review",
        summary: "A review page for interesting talks, research methods, and practical case studies from security events.",
        meta: ["talk", "conference", "notes"],
        statLabel: "type",
        statValue: "live"
      }
    ]
  },
  postHello: {
    railKey: "home" as const,
    crumb: "~/posts/hello-github-io",
    topTitle: "hello github io",
    topDesc: "sample post and static routing example",
    topActions: [
      { href: "/security/ctf", label: "ctf" },
      { href: "/security", label: "security" }
    ],
    hero: {
      avatar: "POST",
      eyebrow: "$ cat posts/hello-github-io.md",
      title: "Getting started with blog routing",
      body: "This route represents a sample post page. In the old static version, posts were mapped to folders with index.html files. In the Next.js version, the same route is handled by a dynamic app router page.",
      tags: ["github pages", "routing", "static site"]
    },
    posts: [
      {
        badge: "POST",
        badgeTone: "doc" as const,
        title: "How to add a new post",
        summary: "Create a new data entry and route for the slug, then connect it from category pages and the home feed.",
        meta: ["slug", "next.js", "static export"],
        statLabel: "route",
        statValue: "ok"
      }
    ]
  }
};

export const rightAside = {
  skills: ["Web Hacking", "Bug Bounty"],
  categories: [
    { href: "/security/ctf", icon: "CTF", tone: "red", name: "CTF", sub: "0 posts" },
    { href: "/security/wargame", icon: "WRG", tone: "red", name: "Wargame", sub: "0 posts" },
    { href: "/security/bug", icon: "BUG", tone: "yellow", name: "Bug Bounty", sub: "4 posts" },
    { href: "/dev", icon: "DEV", tone: "green", name: "development", sub: "8 posts" },
    { href: "/thesis", icon: "DOC", tone: "pink", name: "papers / docs", sub: "2 posts" }
  ],
  links: [
    { href: "https://github.com/simjiun", icon: "GH", tone: "blue", name: "GitHub", sub: "github.com/simjiun" },
    { href: "/thesis", icon: "TH", tone: "blue", name: "Thesis", sub: "research archive" }
  ]
};
