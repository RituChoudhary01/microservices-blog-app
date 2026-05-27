"use client";
import Loading from "@/components/loading";
import {
  author_service,
  Blog,
  blog_service,
  useAppData,
  User,
} from "../../../components/context/AppContext";
import axios from "axios";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Edit3,
  MessageCircle,
  Send,
  Trash2,
  User2,
  ChevronLeft,
  Heart,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface Comment {
  id: string;
  userid: string;
  comment: string;
  create_at: string;
  username: string;
}

const BlogPage = () => {
  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs } = useAppData();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch blog ──────────────────────────────────────────────────────────────
  const fetchSingleBlog = useCallback(async () => {
    if (!id) return;
    try {
      setPageLoading(true);
      const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`);
      setBlog(data.blog);
      setAuthor(data.author);
    } catch {
      toast.error("Could not load blog post.");
      router.push("/blogs");
    } finally {
      setPageLoading(false);
    }
  }, [id, router]);

  // ── Fetch comments ───────────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await axios.get(`${blog_service}/api/v1/comment/${id}`);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      // silent – comments are non-critical
    }
  }, [id]);

  useEffect(() => {
    fetchSingleBlog();
    fetchComments();
  }, [fetchSingleBlog, fetchComments]);

  // ── Sync saved state ─────────────────────────────────────────────────────────
  useEffect(() => {
    setSaved(!!savedBlogs?.some((b) => b.blogid === id));
  }, [savedBlogs, id]);

  // ── Add comment ──────────────────────────────────────────────────────────────
  async function addComment() {
    const trimmed = comment.trim();
    if (!trimmed) return;
    try {
      setSubmitting(true);
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${blog_service}/api/v1/comment/${id}`,
        { comment: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message ?? "Comment posted!");
      setComment("");
      fetchComments();
    } catch {
      toast.error("Could not post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete comment ───────────────────────────────────────────────────────────
  async function deleteComment(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      const token = Cookies.get("token");
      const { data } = await axios.delete(
        `${blog_service}/api/v1/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message ?? "Comment deleted.");
      fetchComments();
    } catch {
      toast.error("Could not delete comment.");
    }
  }

  // ── Delete blog ──────────────────────────────────────────────────────────────
  async function deleteBlog() {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      setActionLoading(true);
      const token = Cookies.get("token");
      const { data } = await axios.delete(
        `${author_service}/api/v1/blog/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message ?? "Blog deleted.");
      router.push("/blogs");
      setTimeout(() => fetchBlogs(), 4000);
    } catch {
      toast.error("Could not delete blog.");
      setActionLoading(false);
    }
  }

  // ── Save / unsave ────────────────────────────────────────────────────────────
  async function toggleSave() {
    if (!isAuth) {
      toast.error("Please log in to save posts.");
      return;
    }
    const prevSaved = saved;
    setSaved(!saved); // optimistic
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${blog_service}/api/v1/save/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message ?? (prevSaved ? "Removed from saved." : "Saved!"));
      getSavedBlogs();
    } catch {
      setSaved(prevSaved); // rollback
      toast.error("Could not update saved status.");
    }
  }

  // ── Like (local toggle – wire to API when ready) ─────────────────────────────
  function toggleLike() {
    if (!isAuth) {
      toast.error("Please log in to like posts.");
      return;
    }
    setLiked((prev) => !prev);
  }

  // ── Share ────────────────────────────────────────────────────────────────────
  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: blog?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (pageLoading) return <Loading />;
  if (!blog) return null;

  const readTime = Math.max(1, Math.ceil((blog.blogcontent?.length || 0) / 1200));
  const isOwner = blog.author === user?._id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">

      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={toggleLike}
              aria-label={liked ? "Unlike" : "Like"}
              className={`p-2 rounded-full transition-all duration-200 ${
                liked
                  ? "bg-rose-50 text-rose-500 dark:bg-rose-900/30"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            </button>

            {/* Save */}
            {isAuth && (
              <button
                onClick={toggleSave}
                aria-label={saved ? "Unsave" : "Save for later"}
                className={`p-2 rounded-full transition-all duration-200 ${
                  saved
                    ? "bg-amber-50 text-amber-500 dark:bg-amber-900/30"
                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            )}

            {/* Share */}
            <button
              onClick={handleShare}
              aria-label="Share"
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Owner actions */}
            {isOwner && (
              <>
                <button
                  onClick={() => router.push(`/blog/edit/${id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={deleteBlog}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {actionLoading ? "Deleting…" : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Article ── */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Category */}
        {blog.category && (
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 mb-6">
            {blog.category}
          </span>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white mb-6">
          {blog.title}
        </h1>

        {/* Author + Meta */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <Link
            href={`/profile/${author?._id}`}
            className="flex items-center gap-3 group flex-1 min-w-0"
          >
            {author?.image ? (
              <img
                src={author.image}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm flex-shrink-0"
                alt={author.name}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {author?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                {author?.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readTime} min read
                </span>
                {blog.createdAt && (
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-sm text-slate-500 flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
          </div>
        </div>

        {/* Hero Image */}
        {blog.image && (
          <div className="rounded-2xl overflow-hidden mb-10 shadow-md">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Description / Lead */}
        {blog.description && (
          <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 italic border-l-4 border-violet-400 pl-5">
            {blog.description}
          </p>
        )}

        {/* Body */}
        <div
          className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-violet-600 prose-img:rounded-xl max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            {blog.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* ── Comments ── */}
      <section
        aria-label="Comments"
        className="max-w-3xl mx-auto px-6 pb-20"
      >
        <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-violet-500" />
            {comments.length > 0 ? `${comments.length} Comments` : "Comments"}
          </h2>

          {/* Comment Input */}
          {isAuth ? (
            <div className="mb-10 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-0.5">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    ref={commentInputRef}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts…"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addComment();
                    }}
                    className="w-full resize-none bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm focus:outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">
                      {comment.length > 0 && "Ctrl + Enter to post"}
                    </span>
                    <button
                      onClick={addComment}
                      disabled={submitting || !comment.trim()}
                      className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Posting…
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/login" className="text-violet-600 hover:underline">
                Log in
              </Link>{" "}
              to join the conversation.
            </p>
          )}

          {/* Comment List */}
          {comments.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No comments yet</p>
              <p className="text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {comments.map((c, i) => (
                <li
                  key={c.id || i}
                  className="group flex gap-3 py-5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {c.username?.[0]?.toUpperCase() ?? <User2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {c.username}
                      </span>
                      <time
                        dateTime={c.create_at}
                        className="text-xs text-slate-400 flex-shrink-0"
                      >
                        {new Date(c.create_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-relaxed break-words">
                      {c.comment}
                    </p>
                  </div>
                  {c.userid === user?._id && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      aria-label="Delete comment"
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;