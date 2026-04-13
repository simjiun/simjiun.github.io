import { HeroBlock, PostList } from "@/components/content-blocks";
import { SiteShell } from "@/components/site-shell";
import { pageNavSections, pages } from "@/lib/site-data";
import { getPostsByMiscGroup, toPostCard } from "@/lib/posts";

export default async function MiscPage() {
  const page = pages.misc;
  const posts = await getPostsByMiscGroup("records");

  return (
    <SiteShell
      railKey={page.railKey}
      crumb={page.crumb}
      topTitle={page.topTitle}
      topDesc={page.topDesc}
      navSections={pageNavSections.misc}
      currentPath="/misc"
      topActions={page.topActions}
    >
      <HeroBlock hero={page.hero} />
      <PostList cards={posts.map((post) => toPostCard(post, "open post"))} />
    </SiteShell>
  );
}
