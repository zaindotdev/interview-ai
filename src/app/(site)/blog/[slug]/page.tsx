import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBlogBySlug, seededBlogs } from "../../../../../blogs.seed";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function generateStaticParams() {
  return seededBlogs.map((blog) => ({ slug: blog.slug }));
}

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <section className="bg-background relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <article className="border-border bg-card/80 mx-auto max-w-3xl rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{blog.category}</Badge>
          {blog.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          {blog.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {formatDate(blog.publishedAt)} • {blog.readTime} • {blog.author}
        </p>

        <p className="text-muted-foreground mt-6 text-base leading-relaxed">
          {blog.excerpt}
        </p>

        <div className="mt-8 space-y-6">
          {blog.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-card-foreground text-xl font-semibold">
                {section.heading}
              </h2>
              <div className="text-muted-foreground space-y-3 leading-relaxed">
                {section.body.map((paragraph, idx) => (
                  <p key={`${section.heading}-${idx}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
};

export default BlogPostPage;
