import fs from "fs";
import path from "path";
import matter from "gray-matter";

// In dev mode cwd is apps/portal; in build mode cwd is monorepo root
function resolveContentDir(): string {
    const fromCwd = path.join(process.cwd(), "content", "press");
    if (fs.existsSync(fromCwd)) return fromCwd;
    const fromMonorepoRoot = path.resolve(process.cwd(), "..", "..", "content", "press");
    if (fs.existsSync(fromMonorepoRoot)) return fromMonorepoRoot;
    return fromCwd;
}

const CONTENT_DIR = resolveContentDir();

export interface PressArticleMeta {
    slug: string;
    title: string;
    date: string;
    summary: string;
    tags: string[];
    version?: string;
    author: string;
    heroImage?: string;
}

export interface PressArticle extends PressArticleMeta {
    content: string;
}

export function getAllArticleSlugs(): string[] {
    if (!fs.existsSync(CONTENT_DIR)) return [];
    return fs
        .readdirSync(CONTENT_DIR)
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.replace(/\.mdx$/, ""))
        .sort()
        .reverse();
}

export function getAllArticles(): PressArticleMeta[] {
    return getAllArticleSlugs().map((slug) => {
        const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(fileContent);
        return {
            slug,
            title: data.title ?? slug,
            date: data.date ?? "",
            summary: data.summary ?? "",
            tags: data.tags ?? [],
            version: data.version,
            author: data.author ?? "Splits Network",
            heroImage: data.heroImage,
        };
    });
}

export function getArticleBySlug(slug: string): PressArticle | null {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) return null;
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        summary: data.summary ?? "",
        tags: data.tags ?? [],
        version: data.version,
        author: data.author ?? "Splits Network",
        heroImage: data.heroImage,
        content,
    };
}
