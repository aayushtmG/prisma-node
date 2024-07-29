import express from "express"
import { signUp, signIn } from "../ controllers/authController"
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../ controllers/userController"

const router = express.Router()

router.post("/signup", signUp)
router.post("/signin", signIn)
router.get("/", getAllUsers)
router.get("/:id", getUser)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)

export default router
