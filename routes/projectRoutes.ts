import express from "express"
import {
  getAllProjects,
  createProject,
  deleteProject,
} from "../ controllers/projectController"

const router = express.Router()

router.get("/", getAllProjects)
router.post("/", createProject)
router.delete("/:id", deleteProject)

export default router
