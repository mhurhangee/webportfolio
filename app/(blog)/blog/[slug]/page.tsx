import { BlogLayout } from '@/app/(blog)/components/blog-post-layout';
import { calculateReadingTime } from '@/app/(blog)/lib/utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPost, getPosts } from '@/app/(blog)/blog/actions';
import { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `aiconsult.uk - ${post.title}`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: 'Michael Hurhangee' }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      authors: ['Michael Hurhangee'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPost(slug), getPosts()]);

  if (!post) {
    return <div>Post not found</div>;
  }

  // Find current post index and get prev/next posts
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;

  return (
    <BlogLayout
      post={{
        ...post,
        author: {
          name: 'Michael Hurhangee',
          avatar: '/bilbo.jpg',
          link: '/aboutme',
        },
        readTime: calculateReadingTime(post.content),
      }}
      prevPost={prevPost}
      nextPost={nextPost}
    >
      <MDXRemote source={post.content} />
    </BlogLayout>
  );
}
