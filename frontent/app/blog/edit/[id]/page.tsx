"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import axios from "axios";
import {
  author_service,
  blog_service,
  blogCategories,
  useAppData,
} from "../../../../components/context/AppContext";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// ── Types ────────────────────────────────────────────────────────────────────

interface BlogDetail {
  title: string;
  description: string;
  category: string;
  blogcontent: string;
  image: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  image: File | null;
  blogcontent: string;
}

interface ApiResponse {
  message: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

const EditBlogPage = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const router = useRouter();
  const { fetchBlogs } = useAppData();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [existingImage, setExistingImage] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    image: null,
    blogcontent: "",
  });

  // ── Fetch existing blog ───────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<{ blog: BlogDetail }>(
          `${blog_service}/api/v1/blog/${id}`
        );
        const blog = data.blog;

        setFormData({
          title: blog.title,
          description: blog.description,
          category: blog.category,
          image: null,
          blogcontent: blog.blogcontent,
        });

        setContent(blog.blogcontent);
        setExistingImage(blog.image);
      } catch {
        toast.error("Could not load blog. Please try again.");
        router.push("/blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.blogcontent.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setLoading(true);
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("blogcontent", formData.blogcontent);
    payload.append("category", formData.category);
    if (formData.image) payload.append("file", formData.image);

    try {
      const token = Cookies.get("token");
      const { data } = await axios.post<ApiResponse>(
        `${author_service}/api/v1/blog/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message ?? "Blog updated successfully!");
      fetchBlogs();
      router.push(`/blog/${id}`);
    } catch {
      toast.error("Error while updating blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing your blog content...",
    }),
    []
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Edit Blog</h2>
          <p className="text-sm text-muted-foreground">
            Update your blog post details below.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter blog description"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {blogCategories.map((cat, i) => (
                    <SelectItem key={i} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image */}
            <div className="space-y-1.5">
              <Label htmlFor="image">Cover Image</Label>
              {existingImage && !formData.image && (
                <div className="mb-2">
                  <img
                    src={existingImage}
                    className="w-40 h-40 object-cover rounded-lg border"
                    alt="Current cover"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current image — upload a new one to replace it.
                  </p>
                </div>
              )}
              {formData.image && (
                <div className="mb-2">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    className="w-40 h-40 object-cover rounded-lg border"
                    alt="New cover preview"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    New image preview
                  </p>
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Blog Content */}
            <div className="space-y-1.5">
              <Label>Blog Content</Label>
              <p className="text-sm text-muted-foreground">
                Write or paste your blog content. Use rich text formatting as
                needed. Add images after finalising your text.
              </p>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setFormData({ ...formData, blogcontent: newContent });
                }}
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving changes…
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBlogPage;