import { HeroBlock, PostList } from "@/components/content-blocks";
import { SiteShell } from "@/components/site-shell";
import { pageNavSections, pages } from "@/lib/site-data";
import { getPostsByCategory, toPostCard } from "@/lib/posts";

export default async function SecurityBugPage() {
  const page = pages.securityBug;
  const posts = await getPostsByCategory("bug");

  return (
    <SiteShell
      railKey={page.railKey}
      crumb={page.crumb}
      topTitle={page.topTitle}
      topDesc={page.topDesc}
      navSections={pageNavSections.security}
      currentPath="/security/bug"
      topActions={page.topActions}
    >
      <HeroBlock hero={page.hero} />
      <PostList cards={posts.map((post) => toPostCard(post))} />
    </SiteShell>
  );
}
