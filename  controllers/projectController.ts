import { Request, Response } from "express"
import { prisma } from "../src/app"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        team_members: {
          include: {
            user: {
              omit: {
                password: true,
              },
            },
          },
        },
        tasks: true,
      },
    })

    res.json({
      projects,
    })
  } catch (error) {
    res.json(error)
  }
}

export const createProject = async (req: Request, res: Response) => {
  const { name, team_members } = req.body
  try {
    const newProject = await prisma.project.create({
      data: {
        name: name.toLowerCase(),
        team_members: {
          create: team_members.map((memberId: string) => ({
            user: { connect: { id: memberId } },
          })),
        },
      },
      include: {
        team_members: true,
      },
    })
    res.json({
      newProject,
    })
  } catch (error) {
    console.log(error)
    res.json(error)
  }
}

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.project.delete({
      where: {
        id,
      },
    })

    res.status(204).end()
  } catch (error: PrismaClientKnownRequestError | any) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == "P2025"
    ) {
      res.status(400).json({
        message: "The project doesn't exist",
      })
    }
    res.status(400).json({
      message: error.name || "failed",
      error,
    })
  }
}
