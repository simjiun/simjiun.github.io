import { HeroBlock, PostList } from "@/components/content-blocks";
import { SiteShell } from "@/components/site-shell";
import { pageNavSections, pages } from "@/lib/site-data";
import { getPostsBySection, toPostCard } from "@/lib/posts";

export default async function SecurityPage() {
  const page = pages.security;
  const posts = await getPostsBySection("security");

  return (
    <SiteShell
      railKey={page.railKey}
      crumb={page.crumb}
      topTitle={page.topTitle}
      topDesc={page.topDesc}
      navSections={pageNavSections.security}
      currentPath="/security"
      topActions={page.topActions}
    >
      <HeroBlock hero={page.hero} />
      <PostList cards={posts.map((post) => toPostCard(post, "open post"))} />
    </SiteShell>
  );
}
