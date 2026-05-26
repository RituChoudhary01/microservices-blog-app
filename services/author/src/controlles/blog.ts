import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import { invalidateChacheJob } from "../utils/rabbitmq.js";
import TryCatch from "../utils/TryCatch.js";
import cloudinary from "cloudinary";
import { GoogleGenAI } from "@google/genai";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;
  if (!file) {
    res.status(400).json({
      message: "No file to upload",
    });
    return;
  }
  const fileBuffer = getBuffer(file);
  if (!fileBuffer || !fileBuffer.content) {
    res.status(400).json({
      message: "Failed to generate buffer",
    });
    return;
  }
  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });
  const result =
    await sql`INSERT INTO blogs (title, description, image, blogcontent,category, author) VALUES (${title}, ${description},${cloud.secure_url},${blogcontent},${category},${req.user?._id}) RETURNING *`;
    await invalidateChacheJob(["blogs:*"]);
  res.json({
    message: "Blog Created",
    blog: result[0],
  });
});

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id",
    });
    return;
  }
  if (blog[0].author !== req.user?._id){
    res.status(401).json({
      message: "You are not author of this blog",
    });
    return;
  }
  let imageUrl = blog[0].image;
  if (file){
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer",
      });
      return;
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });
    imageUrl = cloud.secure_url;
  }
  //updated code
  const updatedBlog = await sql`UPDATE blogs SET
    title = ${title || blog[0].title},
    description = ${description || blog[0].description},
    image= ${imageUrl},
    blogcontent = ${blogcontent || blog[0].blogcontent},
    category = ${category || blog[0].category}

    WHERE id = ${id}
    RETURNING *
    `;

  await invalidateChacheJob(["blogs:*", `blog:${id}`]);

  res.json({
    message: "Blog Updated",
    blog: updatedBlog[0],
  });
});

export const deleteBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const blog = await sql`SELECT * FROM blogs WHERE id = ${req.params.id}`;

  if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id",
    });
    return;
  }

  if (blog[0].author !== req.user?._id) {
    res.status(401).json({
      message: "You are not author of this blog",
    });
    return;
  }

  await sql`DELETE FROM savedblogs WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM comments WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM blogs WHERE id = ${req.params.id}`;

  await invalidateChacheJob(["blogs:*", `blog:${req.params.id}`]);

  res.json({
    message: "Blog Delete",
  });
});

export const aiTitleResponse = TryCatch(async (req, res) => {
  const { text } = req.body;
  const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols: "${text}"`;
  let result;
  const ai = new GoogleGenAI({
    apiKey: process.env.Gemini_Api_Key!,
  });
  async function main() {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    let rawtext = response.text;
    if (!rawtext) {
      res.status(400).json({
        message: "Something went wrong",
      });
      return;
    }
    result = rawtext
      .replace(/\*\*/g, "")
      .replace(/[\r\n]+/g, "")
      .replace(/[*_`~]/g, "")
      .trim();
  }
  await main();
  res.json(result);
}
);

export const aiDescriptionResponse = TryCatch(async (req, res) => {
  const { title, description } = req.body;

  const prompt =
    description === ""
      ? `Generate only one short blog description based on this 
title: "${title}". Your response must be only one sentence, strictly under 30 words, with no options, no greetings, and 
no extra text. Do not explain. Do not say 'here is'. Just return the description only.`
      : `Fix the grammar in the 
following blog description and return only the corrected sentence. Do not add anything else: "${description}"`;

  let result;

  const ai = new GoogleGenAI({
    apiKey: process.env.Gemini_Api_Key!,
  });

  async function main() {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let rawtext = response.text;

    if (!rawtext) {
      res.status(400).json({
        message: "Something went wrong",
      });
      return;
    }

    result = rawtext
      .replace(/\*\*/g, "")
      .replace(/[\r\n]+/g, "")
      .replace(/[*_`~]/g, "")
      .trim();
  }

  await main();

  res.json(result);
});

export const aiBlogResponse = TryCatch(async (req, res) => {

  try {

    const { blog } = req.body;

    if (!blog) {
      res.status(400).json({
        message: "Please provide blog",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.Gemini_Api_Key!,
    });

    const prompt = `
You are a grammar correction engine.

I will provide blog HTML content from Jodit editor.

Rules:
- Only fix grammar, spelling, punctuation
- DO NOT rewrite content
- DO NOT remove HTML tags
- Preserve styles, images, formatting
- Return ONLY corrected HTML
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `${prompt}\n\n${blog}`,
    });

    const cleanedHtml = response.text
      ?.replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    res.status(200).json({
      html: cleanedHtml,
    });

  } catch (error: any) {

    console.log(error);

    if (error.status === 429) {
      res.status(429).json({
        message: "Gemini quota exceeded. Please try again later.",
      });
      return;
    }

    res.status(500).json({
      message: "AI blog correction failed",
    });
  }
});