import { Request, Response } from "express"
import { prisma } from "../src/app"
import { STATUS_CODES } from "http"

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  const {
    title,
    starting_date,
    ending_date,
    file,
    team,
    assigned_users,
    project_name,
    team_members,
  } = req.body
  try {
    const project = await prisma.project.findFirst({
      where: {
        name: project_name,
      },
    })
    //create the project and add members if doesnt exist
    if (!project) {
      await prisma.project.create({
        data: {
          name: project_name.toLowerCase(),
          team_members: {
            create: team_members.map((memberId: string) => ({
              user: { connect: { id: memberId } },
            })),
          },
        },
      })
      return res.json({
        status: "created",
        project_name,
      })
    }

    const task = await prisma.task.create({
      data: {
        title,
        starting_date: starting_date ? new Date(starting_date) : new Date(),
        ending_date: new Date(ending_date),
        file,
        project_name,
        project_id: project.id,
        team: team.toUpperCase(),
        assigned_users: {
          create: assigned_users.map((memberId: string) => ({
            user: { connect: { id: memberId } },
          })),
        },
      },
    })
    res.status(201).json({
      status: "success",
      task,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: "Task creation failed" })
  }
}

// Read all tasks
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assigned_users: {
          include: {
            task: false,
            user: true,
          },
        },
        subtasks: true,
        comments: true,
      },
    })
    const filteredTask = tasks.map((task) => ({
      ...task,
      assigned_users: task.assigned_users.map((assignment) => assignment.user),
    }))

    res.status(200).json({
      status: "success",
      tasks: filteredTask,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve tasks" })
  }
}

// Read a single task by ID
export const getTask = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assigned_users: {
          include: {
            user: true,
          },
        },
        subtasks: true,
        comments: true,
      },
    })
    const filteredTask = {
      ...task,
      assigned_users: task?.assigned_users.map((assignment) => assignment.user),
    }
    if (task) {
      res.json(filteredTask)
    } else {
      res.status(404).json({ error: "Task not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve task" })
  }
}

// Update a task by ID
export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params
  const { title, starting_date, ending_date, file, project_id, team } = req.body
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        starting_date: new Date(starting_date),
        ending_date: new Date(ending_date),
        file,
        project_id,
        team,
      },
    })
    res.json(task)
  } catch (error) {
    res.status(400).json({ error: "Task update failed" })
  }
}

// Delete a task by ID
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await prisma.task.delete({
      where: { id },
    })
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: "Task deletion failed" })
  }
}
