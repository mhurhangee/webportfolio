export interface Author {
  name: string;
  avatar: string;
  link: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  tags?: string[];
  image?: string;
  author: Author;
  readTime?: string; // Optional now since we'll calculate it
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
  image?: string;
  author: Author;
  readTime?: string;
}
