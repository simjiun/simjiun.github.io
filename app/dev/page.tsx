import { HeroBlock, PostList } from "@/components/content-blocks";
import { SiteShell } from "@/components/site-shell";
import { pageNavSections, pages } from "@/lib/site-data";
import { getPostsBySection, toPostCard } from "@/lib/posts";

export default async function DevPage() {
  const page = pages.dev;
  const posts = await getPostsBySection("dev");

  return (
    <SiteShell
      railKey={page.railKey}
      crumb={page.crumb}
      topTitle={page.topTitle}
      topDesc={page.topDesc}
      navSections={pageNavSections.dev}
      currentPath="/dev"
      topActions={page.topActions}
    >
      <HeroBlock hero={page.hero} />
      <PostList cards={posts.map((post) => toPostCard(post, "open post"))} />
    </SiteShell>
  );
}
