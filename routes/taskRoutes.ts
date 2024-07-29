import express from "express"
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from "../ controllers/taskController"

const router = express.Router()

router.post("/", createTask)
router.get("/", getAllTasks)
router.get("/:id", getTask)
router.put("/:id", updateTask)
router.delete("/:id", deleteTask)

export default router
