'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { container, item } from '@/lib/animation';

type Post = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  tags?: string[];
};

export function BlogPostList({ posts }: { posts: Post[] }) {
  return (
    <motion.div
      className="container mx-auto px-4 pt-24 pb-12"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={item} className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Blog Posts</h2>
        <p className="text-gray-600">
          Welcome to my blog, where I share my thoughts, experiences, and insights on AI its impact
          on software development, businesses, and the environment.
        </p>
      </motion.div>
      <motion.div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post, index) => (
          <motion.a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block h-full"
            variants={item}
            custom={index}
          >
            <Card className="h-full overflow-hidden hover:border-foreground/50 transition-colors">
              {post.image && (
                <div className="relative h-48 w-full">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2 line-clamp-2 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags && post.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <time dateTime={post.date}>{post.date}</time>
                  </div>
                </div>
              </div>
            </Card>
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
}
