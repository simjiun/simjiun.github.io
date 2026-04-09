import { HeroBlock, PostList } from "@/components/content-blocks";
import { SiteShell } from "@/components/site-shell";
import { pageNavSections, pages } from "@/lib/site-data";
import { getPostsByCategory, toPostCard } from "@/lib/posts";

export default async function SecurityCtfPage() {
  const page = pages.securityCtf;
  const posts = await getPostsByCategory("ctf");

  return (
    <SiteShell
      railKey={page.railKey}
      crumb={page.crumb}
      topTitle={page.topTitle}
      topDesc={page.topDesc}
      navSections={pageNavSections.security}
      currentPath="/security/ctf"
      topActions={page.topActions}
    >
      <HeroBlock hero={page.hero} />
      <PostList cards={posts.map((post) => toPostCard(post))} />
    </SiteShell>
  );
}
