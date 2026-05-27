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
import { RefreshCw } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import axios from "axios";
import {
  author_service,
  blogCategories,
  useAppData,
} from "../../../components/context/AppContext";
import toast from "react-hot-toast";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface AiBlogResponse {
  html: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

const AddBlog = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const { fetchBlogs } = useAppData();

  const [loading, setLoading] = useState(false);
  const [aiTitle, setAiTitle] = useState(false);
  const [aiDescription, setAiDescription] = useState(false);
  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    image: null,
    blogcontent: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      image: null,
      blogcontent: "",
    });
    setContent("");
  };

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
    if (!formData.blogcontent.trim()) {
      toast.error("Blog content cannot be empty.");
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
        `${author_service}/api/v1/blog/new`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message ?? "Blog published!");
      resetForm();
      setTimeout(() => fetchBlogs(), 4000);
    } catch {
      toast.error("Error while adding blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── AI Handlers ───────────────────────────────────────────────────────────

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post<string>(
        `${author_service}/api/v1/ai/title`,
        { text: formData.title }
      );
      setFormData({ ...formData, title: data });
    } catch {
      toast.error("Problem while fetching AI title.");
    } finally {
      setAiTitle(false);
    }
  };

  const aiDescriptionResponse = async () => {
    try {
      setAiDescription(true);
      const { data } = await axios.post<string>(
        `${author_service}/api/v1/ai/descripiton`,
        { title: formData.title, description: formData.description }
      );
      setFormData({ ...formData, description: data });
    } catch {
      toast.error("Problem while fetching AI description.");
    } finally {
      setAiDescription(false);
    }
  };

  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true);
      const { data } = await axios.post<AiBlogResponse>(
        `${author_service}/api/v1/ai/blog`,
        { blog: formData.blogcontent }
      );
      setContent(data.html);
      setFormData({ ...formData, blogcontent: data.html });
    } catch {
      toast.error("Problem while fixing grammar.");
    } finally {
      setAiBlogLoading(false);
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
          <h2 className="text-2xl font-bold">Add New Blog</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to publish a new blog post.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog title"
                  className={aiTitle ? "animate-pulse" : ""}
                  required
                />
                {formData.title && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={aiTitleResponse}
                    disabled={aiTitle}
                    title="Improve title with AI"
                  >
                    <RefreshCw
                      size={16}
                      className={aiTitle ? "animate-spin" : ""}
                    />
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter blog description"
                  className={aiDescription ? "animate-pulse" : ""}
                  required
                />
                {formData.title && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={aiDescriptionResponse}
                    disabled={aiDescription}
                    title="Improve description with AI"
                  >
                    <RefreshCw
                      size={16}
                      className={aiDescription ? "animate-spin" : ""}
                    />
                  </Button>
                )}
              </div>
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
              {formData.image && (
                <div className="mb-2">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    className="w-40 h-40 object-cover rounded-lg border"
                    alt="Cover preview"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Image preview
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
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Write or paste your content. Add images after fixing grammar.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading || !formData.blogcontent.trim()}
                  title="Fix grammar with AI"
                >
                  <RefreshCw
                    size={16}
                    className={aiBlogLoading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">
                    {aiBlogLoading ? "Fixing…" : "Fix Grammar"}
                  </span>
                </Button>
              </div>
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
                  Publishing…
                </span>
              ) : (
                "Publish Blog"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;
