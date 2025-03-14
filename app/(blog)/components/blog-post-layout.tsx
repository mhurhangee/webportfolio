'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { BlogNav } from '@/app/(blog)/components/blog-nav';
import type { Post, PostMeta } from '@/app/(blog)/lib/types';
import { motion } from 'framer-motion';
import { container, item } from '@/lib/animation';
import { TableOfContents } from './table-of-contents';

interface BlogLayoutProps {
  post: Post;
  prevPost?: PostMeta;
  nextPost?: PostMeta;
  children: React.ReactNode;
}

export function BlogLayout({ post, prevPost, nextPost, children }: BlogLayoutProps) {
  return (
    <motion.div
      className="container max-w-4xl mx-auto px-4"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={item}>
        <BlogNav prevPost={prevPost} nextPost={nextPost} position="top" />
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden">
          {post.image && (
            <motion.div className="relative h-[400px] w-full" variants={item}>
              <Image src={post.image} alt={post.title} fill className="object-cover" priority />
            </motion.div>
          )}
          <div className="p-6 md:p-8">
            <motion.header
              className="mb-8 space-y-6"
              variants={item}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 className="text-3xl md:text-4xl font-bold text-foreground" variants={item}>
                {post.title}
              </motion.h1>

              <motion.div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                variants={item}
              >
                <div className="flex items-center gap-3">
                  <Link href={post.author.link}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex flex-col">
                    <Link
                      href={post.author.link}
                      className="font-medium text-foreground hover:underline"
                    >
                      {post.author.name}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime={post.date} className="whitespace-nowrap">
                        {post.date}
                      </time>
                      {post.readTime && (
                        <>
                          <span>•</span>
                          <ClockIcon className="h-4 w-4" />
                          <span className="whitespace-nowrap">{post.readTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {post.tags && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.header>

            <motion.article
              className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none
              prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary
              prose-strong:text-foreground prose-li:text-foreground/90 prose-code:text-foreground
              prose-headings:scroll-mt-20"
              variants={item}
            >
              {children}
            </motion.article>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <BlogNav prevPost={prevPost} nextPost={nextPost} position="bottom" />
      </motion.div>

      <TableOfContents />
    </motion.div>
  );
}
