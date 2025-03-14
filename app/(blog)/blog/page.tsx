import * as React from 'react';
import { getPosts } from '@/app/(blog)/blog/actions';
import { BlogPostList } from '@/app/(blog)/components/blog-post-list';

export const dynamic = 'force-static';

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogPostList posts={posts} />;
}
