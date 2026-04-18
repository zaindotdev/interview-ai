import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BlogEngagement from "@/components/blog/blog-engagement";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  const { slug } = await params;

  const session = await getServerSession(authOptions);

  const currentUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const blog = await db.blog.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { createdAt: "asc" },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!blog) {
    notFound();
  }

  const userLike = currentUser
    ? await db.like.findUnique({
        where: {
          blogId_userId: {
            blogId: blog.id,
            userId: currentUser.id,
          },
        },
        select: { id: true },
      })
    : null;

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
          {formatDate(blog.createdAt)} • {blog.readTime} • {blog.authorId || "Interview AI Team"}
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
                {section.body.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <BlogEngagement
          slug={blog.slug}
          initialLikesCount={blog._count.likes}
          initialIsLiked={Boolean(userLike)}
          initialComments={blog.comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            author: {
              name: comment.author.name,
              image: comment.author.image,
            },
          }))}
        />
      </article>
    </section>
  );
};

export default BlogPostPage;
