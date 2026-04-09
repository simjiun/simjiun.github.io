import { HeroBlock, MarkdownContent } from "@/components/content-blocks";
import { SiteShell } from "@/components/site-shell";
import { getAllPosts, getPostBySlug, getPostNavSections, getPostsByCategory } from "@/lib/posts";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await getPostsByCategory(post.category)).filter((item) => item.slug !== post.slug);
  const navSections = getPostNavSections(post, [post, ...relatedPosts]);

  return (
    <SiteShell
      railKey={post.section === "security" ? "security" : post.section}
      crumb={`~/posts/${post.slug}`}
      topTitle={post.slug}
      topDesc={post.summary}
      navSections={navSections}
      currentPath={`/posts/${post.slug}`}
      topActions={[
        { href: `/${post.section}`, label: post.section },
        { href: "/", label: "home" }
      ]}
    >
      <HeroBlock
        hero={{
          avatar: post.heroAvatar ?? "POST",
          eyebrow: post.heroEyebrow ?? `$ cat content/posts/${post.slug}.md`,
          title: post.title,
          body: post.summary,
          tags: post.tags
        }}
      />
      <MarkdownContent html={post.html} />
    </SiteShell>
  );
}
