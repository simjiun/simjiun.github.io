import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import type { BadgeTone, NavSection, PostCardData } from "@/lib/site-data";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export type PostCategory = "ctf" | "bug" | "dev" | "thesis" | "misc";
export type PostSection = "security" | "dev" | "thesis" | "misc";

export type PostMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: PostCategory;
  section: PostSection;
  badge: string;
  badgeTone: BadgeTone;
  tags: string[];
  statLabel?: string;
  statValue?: string;
  heroEyebrow?: string;
  heroAvatar?: string;
};

export type Post = PostMeta & {
  content: string;
  html: string;
};

type RawFrontmatter = {
  title?: string;
  summary?: string;
  date?: string;
  category?: PostCategory;
  section?: PostSection;
  badge?: string;
  badgeTone?: BadgeTone;
  tags?: string[];
  statLabel?: string;
  statValue?: string;
  heroEyebrow?: string;
  heroAvatar?: string;
};

function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

function normalizePost(slug: string, frontmatter: RawFrontmatter, content: string): PostMeta & { content: string } {
  return {
    slug,
    title: frontmatter.title ?? slug,
    summary: frontmatter.summary ?? "",
    date: frontmatter.date ?? "1970-01-01",
    category: frontmatter.category ?? "misc",
    section: frontmatter.section ?? "misc",
    badge: frontmatter.badge ?? frontmatter.category?.toUpperCase() ?? "POST",
    badgeTone: frontmatter.badgeTone ?? "doc",
    tags: frontmatter.tags ?? [],
    statLabel: frontmatter.statLabel,
    statValue: frontmatter.statValue,
    heroEyebrow: frontmatter.heroEyebrow,
    heroAvatar: frontmatter.heroAvatar,
    content
  };
}

async function renderMarkdown(markdown: string) {
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(markdown);
  return processed.toString();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const post = normalizePost(slug, data as RawFrontmatter, content);

  return {
    ...post,
    html: await renderMarkdown(content)
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const slugs = getPostSlugs();
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));

  return posts
    .filter((post): post is Post => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostsByCategory(category: PostCategory) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}

export async function getPostsBySection(section: PostSection) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.section === section);
}

export function toPostCard(post: Post, primaryLabel = "read post"): PostCardData {
  return {
    badge: post.badge,
    badgeTone: post.badgeTone,
    title: post.title,
    summary: post.summary,
    meta: [...post.tags, post.date],
    statLabel: post.statLabel,
    statValue: post.statValue,
    primaryAction: { href: `/posts/${post.slug}`, label: primaryLabel }
  };
}

export function getPostNavItem(post: Post) {
  return {
    href: `/posts/${post.slug}`,
    icon: "POST",
    iconTone: "doc" as const,
    name: post.slug,
    desc: post.summary
  };
}

function getCategoryRoute(category: PostCategory) {
  switch (category) {
    case "ctf":
      return "/security/ctf";
    case "bug":
      return "/security/bug";
    case "dev":
      return "/dev/projects";
    case "thesis":
      return "/thesis";
    case "misc":
      return "/misc/archive";
  }
}

function getCategoryLabel(category: PostCategory) {
  switch (category) {
    case "ctf":
      return "CTF";
    case "bug":
      return "Bug Bounty";
    case "dev":
      return "Development";
    case "thesis":
      return "Thesis";
    case "misc":
      return "Misc";
  }
}

function getCategoryIcon(category: PostCategory) {
  switch (category) {
    case "ctf":
      return "CTF";
    case "bug":
      return "BUG";
    case "dev":
      return "DEV";
    case "thesis":
      return "PPR";
    case "misc":
      return "ETC";
  }
}

function getCategoryTone(category: PostCategory) {
  switch (category) {
    case "ctf":
    case "bug":
      return "sec" as const;
    case "dev":
      return "dev" as const;
    case "thesis":
      return "doc" as const;
    case "misc":
      return "cert" as const;
  }
}

export function getPostNavSections(currentPost: Post, relatedPosts: Post[]): NavSection[] {
  return [
    {
      label: getCategoryLabel(currentPost.category).toUpperCase(),
      items: [
        {
          href: getCategoryRoute(currentPost.category),
          icon: getCategoryIcon(currentPost.category),
          iconTone: getCategoryTone(currentPost.category),
          name: `${getCategoryLabel(currentPost.category)} category`,
          desc: "same-category archive"
        },
        ...relatedPosts.map((post) => ({
          href: `/posts/${post.slug}`,
          icon: getCategoryIcon(currentPost.category),
          iconTone: getCategoryTone(currentPost.category),
          name: post.title,
          desc: post.summary
        }))
      ]
    }
  ];
}
