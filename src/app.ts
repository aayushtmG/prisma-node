import { PrismaClient } from "@prisma/client"
import express from "express"
import userRouter from "../routes/userRoutes"
import taskRouter from "../routes/taskRoutes"
import projectRouter from "../routes/projectRoutes"
export const prisma = new PrismaClient()
const app = express()

app.use(express.json())

app.use("/api/users", userRouter)
app.use("/api/tasks", taskRouter)
app.use("/api/projects", projectRouter)

export default app
