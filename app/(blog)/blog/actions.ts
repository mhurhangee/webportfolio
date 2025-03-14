'use server';

import path from 'node:path';
import { getAllPosts, getPostBySlug } from '@/app/(blog)/lib/server';

export async function getPosts() {
  const contentDir = path.join(process.cwd(), './content');
  return getAllPosts(contentDir);
}

export async function getPost(slug: string) {
  const contentDir = path.join(process.cwd(), './content');
  return getPostBySlug(contentDir, slug);
}
