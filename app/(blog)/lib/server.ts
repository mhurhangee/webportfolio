'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Post, PostMeta } from '@/app/(blog)/lib/types';

const defaultAuthor = {
  name: 'Michael Hurhangee',
  avatar: '/avatar.jpg',
  link: '/aboutme',
};

export async function getAllPosts(contentDir: string): Promise<PostMeta[]> {
  const files = await fs.readdir(contentDir);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const content = await fs.readFile(path.join(contentDir, file), 'utf8');
        const { data } = matter(content);
        return {
          slug: file.replace(/\.mdx$/, ''),
          title: data.title,
          date: data.date,
          description: data.description,
          tags: data.tags,
          image: data.image,
          author: data.author || defaultAuthor,
        };
      })
  );
  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

export async function getPostBySlug(contentDir: string, slug: string): Promise<Post | null> {
  try {
    const content = await fs.readFile(path.join(contentDir, `${slug}.mdx`), 'utf8');
    const { data, content: mdxContent } = matter(content);
    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description,
      tags: data.tags,
      image: data.image,
      content: mdxContent,
      author: data.author || defaultAuthor,
    };
  } catch (error) {
    return null;
  }
}
