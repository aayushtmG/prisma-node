import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { prisma } from "../src/app"
import { Request, Response, NextFunction } from "express"

//getAlluser
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allUsers = await prisma.user.findMany({
      omit: {
        password: true,
      },
    })
    res.json({
      status: "success",
      allUsers,
    })
  } catch (error: any) {
    console.log(error)
    res.json({
      status: "success",
      error: error.name,
    })
  }
}
//get one user
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    })
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user" })
  }
}

//update user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { name, email, mobile, password } = req.body
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, mobile, password },
    })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: "User update failed" })
  }
}

//delete user

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  try {
    const user = await prisma.user.delete({
      where: { id: id },
    })
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ error: "User deletion failed" })
  }
}
