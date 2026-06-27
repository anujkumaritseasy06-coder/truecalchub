import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_PATH = path.join(process.cwd(), "content");

export interface BaseFrontmatter {
  title: string;
  description: string;
  date?: string;
  category?: string;
  tags?: string[];
  canonicalUrl?: string;
  published?: boolean;
  faqs?: { question: string; answer: string }[];
}

export interface MDXDocument<T = BaseFrontmatter> {
  slug: string;
  frontmatter: T;
  content: string;
}

export type ContentType = "legal" | "categories" | "calculators" | "blog";

function getMDXFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx" || path.extname(file) === ".md");
  } catch (e) {
    return [];
  }
}

export function getDocumentBySlug<T extends BaseFrontmatter = BaseFrontmatter>(type: ContentType, slug: string): MDXDocument<T> | null {
  try {
    const directory = path.join(CONTENT_PATH, type);
    const realSlug = slug.replace(/\.mdx?$/, "");
    
    let fullPath = path.join(directory, `${realSlug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(directory, `${realSlug}.md`);
    }

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug: realSlug,
      frontmatter: data as T,
      content,
    };
  } catch (e) {
    return null;
  }
}

export function getAllDocuments<T extends BaseFrontmatter = BaseFrontmatter>(type: ContentType): MDXDocument<T>[] {
  const directory = path.join(CONTENT_PATH, type);
  const mdxFiles = getMDXFiles(directory);

  const documents = mdxFiles
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      return getDocumentBySlug<T>(type, slug);
    })
    .filter((doc): doc is MDXDocument<T> => doc !== null);

  // Sort by date if present
  return documents.sort((a, b) => {
    if (a.frontmatter.date && b.frontmatter.date) {
      return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
    }
    return 0;
  });
}

// Optimization for large scale: only get slugs/frontmatter, avoid reading all content if not needed
export function getAllDocumentSlugs(type: ContentType): string[] {
  const directory = path.join(CONTENT_PATH, type);
  return getMDXFiles(directory).map((file) => file.replace(/\.mdx?$/, ""));
}

export function getPaginatedDocuments<T extends BaseFrontmatter = BaseFrontmatter>(type: ContentType, page: number, limit: number): { docs: MDXDocument<T>[], totalPages: number } {
  const allDocs = getAllDocuments<T>(type).filter(doc => doc.frontmatter.published !== false);
  const totalPages = Math.ceil(allDocs.length / limit);
  const offset = (page - 1) * limit;
  const docs = allDocs.slice(offset, offset + limit);

  return { docs, totalPages };
}

export function getDocumentModificationDate(type: ContentType, slug: string): string {
  try {
    const directory = path.join(CONTENT_PATH, type);
    const realSlug = slug.replace(/\.mdx?$/, "");
    
    let fullPath = path.join(directory, `${realSlug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(directory, `${realSlug}.md`);
    }

    if (!fs.existsSync(fullPath)) {
      return new Date().toISOString().split('T')[0];
    }

    const stats = fs.statSync(fullPath);
    return stats.mtime.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}
