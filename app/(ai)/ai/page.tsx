'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { container, item } from '@/lib/animation';
import { aiCategories } from '@/app/(ai)/lib/playground-config';
import { ArrowRight } from 'lucide-react';

export default function AIPlayground() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-8 w-full"
    >
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Playground</h1>
        <p className="text-muted-foreground">
          Explore a collection of AI applications built with Vercel&apos;s AI SDK.
        </p>
      </motion.div>

      {aiCategories.map((category) => (
        <motion.div key={category.name} variants={item} className="space-y-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
            <span className="text-sm ml-2 text-muted-foreground">{category.description}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {category.apps.map((app) => (
              <Link key={app.href} href={app.href} className="group">
                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl group-hover:translate-y-[-5px]">
                  <div className={`h-2 w-full bg-gradient-to-r ${app.color}`} />
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <CardTitle className="group-hover:text-primary transition-colors duration-300">
                        {app.name}
                      </CardTitle>
                      {app.isNew && (
                        <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <div
                      className={`p-2 rounded-full bg-gradient-to-br opacity-80 ${app.color} text-primary-foreground transition-all duration-300 group-hover:opacity-100 group-hover:shadow-md`}
                    >
                      {app.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{app.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Click to explore</span>
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
