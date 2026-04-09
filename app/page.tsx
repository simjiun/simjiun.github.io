import { HeroBlock, PostList, SectionHead } from "@/components/content-blocks";
import { RightAside } from "@/components/right-aside";
import { SiteShell } from "@/components/site-shell";
import { homeNavSections, pages } from "@/lib/site-data";
import { getAllPosts, toPostCard } from "@/lib/posts";

export default async function HomePage() {
  const page = pages.home;
  const posts = await getAllPosts();
  const cards = posts.slice(0, 4).map((post) => toPostCard(post));

  return (
    <SiteShell
      railKey={page.railKey}
      crumb={page.crumb}
      topTitle={page.topTitle}
      topDesc={page.topDesc}
      navSections={homeNavSections}
      currentPath="/"
      topActions={page.topActions}
      aside={<RightAside />}
    >
      <HeroBlock hero={page.hero} />
      <SectionHead title={page.sectionTitle} desc={page.sectionDesc} />
      <PostList cards={cards} />
    </SiteShell>
  );
}
