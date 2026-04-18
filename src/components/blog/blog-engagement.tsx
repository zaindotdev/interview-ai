"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Heart, Loader2, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export type BlogCommentView = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  };
};

type BlogEngagementProps = {
  slug: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
  initialComments: BlogCommentView[];
};

const formatCommentDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const BlogEngagement = ({
  slug,
  initialComments,
  initialLikesCount,
  initialIsLiked,
}: BlogEngagementProps) => {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<BlogCommentView[]>(initialComments);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [commentInput, setCommentInput] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  const handleToggleLike = async () => {
    if (status !== "authenticated") {
      toast.error("Please sign in to like this post");
      return;
    }

    if (isTogglingLike) {
      return;
    }

    const previousLiked = isLiked;
    const previousLikesCount = likesCount;
    const nextLiked = !previousLiked;

    setIsTogglingLike(true);
    setIsLiked(nextLiked);
    setLikesCount((prev) => Math.max(prev + (nextLiked ? 1 : -1), 0));

    try {
      const response = await fetch(`/api/blog/${slug}/likes`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      const payload: {
        data?: {
          liked: boolean;
          likesCount: number;
        };
      } = await response.json();

      if (payload.data) {
        setIsLiked(payload.data.liked);
        setLikesCount(payload.data.likesCount);
      }
    } catch (error) {
      console.error(error);
      setIsLiked(previousLiked);
      setLikesCount(previousLikesCount);
      toast.error("Could not update like right now");
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleSubmitComment = async () => {
    const content = commentInput.trim();

    if (!content) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (status !== "authenticated") {
      toast.error("Please sign in to comment");
      return;
    }

    if (isPostingComment) {
      return;
    }

    const optimisticCommentId = `temp-${Date.now()}`;

    const optimisticComment: BlogCommentView = {
      id: optimisticCommentId,
      content,
      createdAt: new Date().toISOString(),
      author: {
        name: session?.user?.name || "You",
        image: session?.user?.image || null,
      },
    };

    setIsPostingComment(true);
    setCommentInput("");
    setComments((prev) => [optimisticComment, ...prev]);

    try {
      const response = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const payload: {
        data?: BlogCommentView;
      } = await response.json();

      if (payload.data) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === optimisticCommentId ? payload.data! : comment,
          ),
        );
      }
    } catch (error) {
      console.error(error);
      setComments((prev) => prev.filter((comment) => comment.id !== optimisticCommentId));
      setCommentInput(content);
      toast.error("Could not post comment right now");
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <section className="border-border mt-10 rounded-xl border p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={isLiked ? "default" : "outline"}
          size="sm"
          type="button"
          onClick={handleToggleLike}
          disabled={isTogglingLike}
          className={cn("gap-2", isLiked && "bg-primary text-primary-foreground")}
        >
          {isTogglingLike ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          )}
          {isLiked ? "Liked" : "Like"}
        </Button>

        <Badge variant="secondary">{likesCount} likes</Badge>
        <Badge variant="outline" className="gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {comments.length} comments
        </Badge>
      </div>

      <div className="mt-5 space-y-3">
        <Textarea
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
          placeholder={
            status === "authenticated"
              ? "Add your perspective..."
              : "Sign in to join the discussion"
          }
          disabled={status !== "authenticated" || isPostingComment}
          maxLength={1200}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            {status === "authenticated"
              ? "Keep comments constructive and concise."
              : "You need an account to like or comment."}
          </p>
          <Button
            size="sm"
            type="button"
            onClick={handleSubmitComment}
            disabled={status !== "authenticated" || isPostingComment}
          >
            {isPostingComment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Posting...
              </>
            ) : (
              "Post comment"
            )}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No comments yet. Start the conversation.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="border-border rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={comment.author.image || undefined} alt={comment.author.name || "User"} />
                  <AvatarFallback>
                    {(comment.author.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <p className="text-sm font-medium">{comment.author.name || "Anonymous"}</p>
                <span className="text-muted-foreground text-xs">{formatCommentDate(comment.createdAt)}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{comment.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default BlogEngagement;
