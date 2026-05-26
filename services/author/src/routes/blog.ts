import express from "express"
import { isAuth } from "../middleware/isAuth.js"
import { aiBlogResponse, aiDescriptionResponse, aiTitleResponse, createBlog, deleteBlog, updateBlog } from "../controlles/blog.js"
import uploadFile from "../middleware/multer.js"
const router = express()
router.post("/blog/new",isAuth, uploadFile, createBlog)
router.post("/blog/:id",isAuth,uploadFile,updateBlog)
router.delete("/blog/:id",isAuth,deleteBlog);
router.post("/ai/title", aiTitleResponse);
router.post("/ai/descripiton", aiDescriptionResponse);
router.post("/ai/blog", aiBlogResponse);
export default router