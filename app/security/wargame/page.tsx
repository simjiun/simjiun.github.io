import { HeroBlock, PostList } from "@/components/content-blocks";
import { SiteShell } from "@/components/site-shell";
import { pageNavSections, pages } from "@/lib/site-data";
import { getPostsByCtfGroup, toPostCard } from "@/lib/posts";

export default async function SecurityWargamePage() {
  const page = pages.securityWargame;
  const posts = await getPostsByCtfGroup("wargame");

  return (
    <SiteShell
      railKey={page.railKey}
      crumb={page.crumb}
      topTitle={page.topTitle}
      topDesc={page.topDesc}
      navSections={pageNavSections.security}
      currentPath="/security/wargame"
      topActions={page.topActions}
    >
      <HeroBlock hero={page.hero} />
      <PostList cards={posts.map((post) => toPostCard(post))} />
    </SiteShell>
  );
}
