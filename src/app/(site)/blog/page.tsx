import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/prisma";

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const BlogPage = async () => {
  const blogs = await db.blog.findMany({
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const featured = blogs.find((blog) => blog.featured);
  const rest = blogs.filter((blog) => !blog.featured);

  return (
    <section className="bg-background relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-border bg-card/80 rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-secondary-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Blog
          </p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Interview insights, playbooks, and growth guides
          </h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">
            Explore practical strategies for interview preparation, resume
            improvement, and career progression.
          </p>
        </header>

        {featured && (
          <Card className="border-border bg-card/80 overflow-hidden border shadow-sm backdrop-blur">
            <CardHeader>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge>Featured</Badge>
                <Badge variant="secondary">{featured.category}</Badge>
              </div>
              <CardTitle className="text-card-foreground text-2xl sm:text-3xl">
                {featured.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {formatDate(featured.createdAt)} • {featured.readTime} • {featured.authorId || "Interview AI Team"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                {featured.excerpt}
              </p>
              <p className="text-muted-foreground text-xs">
                {featured._count.likes} likes • {featured._count.comments} comments
              </p>
              <div className="flex flex-wrap gap-2">
                {featured.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link
                href={`/blog/${featured.slug}`}
                className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((blog) => (
            <Card key={blog.id} className="border-border bg-card/80 h-full border shadow-sm backdrop-blur">
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{blog.category}</Badge>
                </div>
                <CardTitle className="text-card-foreground text-xl leading-tight">
                  {blog.title}
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  {formatDate(blog.createdAt)} • {blog.readTime}
                </p>
              </CardHeader>
              <CardContent className="flex h-full flex-col justify-between gap-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {blog.excerpt}
                </p>
                <p className="text-muted-foreground text-xs">
                  {blog._count.likes} likes • {blog._count.comments} comments
                </p>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  >
                    Read article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPage;