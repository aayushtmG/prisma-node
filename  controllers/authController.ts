import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { prisma } from "../src/app"
import { Request, Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "top_secret@key"

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //validating input
    const { name, email, password, mobile } = req.body
    if (!name || !email || !password || !mobile) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" })
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: hashedPassword,
      },
    })
    res.status(201).json({
      status: "success",
      user: newUser,
    })
  } catch (error: any) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle specific Prisma errors (e.g., unique constraint violation)
      if (error.code === "P2002") {
        return res.status(409).json({
          status: "failed",
          message: "Email or mobile already exists",
        })
      }
    }

    res.status(500).json({
      status: "Failed",
      message: "Internal server error",
    })
  }
}

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body

    // 1) Check if email and password exist
    if (!email || !password) {
      throw new Error("Please provide credentials")
    }

    // 2) Check if user exists && password is correct
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (!user) {
      return res.json({
        status: "failed",
        message: "User doesnt exist",
      })
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.json({
        status: "failed",
        message: "Credential doesn't match",
      })
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    })

    res.json({
      status: "success",
      message: "login succesfull",
      token,
      user,
    })
  } catch (error: any) {
    res.status(401).json({
      message: error.message,
    })
  }
}

export const logout = (req: Request, res: Response) => {
  // res.cookie("jwt", "loggedout", {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // })
  // res.status(200).json({ status: "success" })
}

// export const forgotPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on POSTed email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError("There is no user with email address.", 404));
//   }

//   // 2) Generate the random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   // 3) Send it to user's email
//   try {
//     const resetURL = `${req.protocol}://${req.get(
//       "host"
//     )}/api/v1/users/resetPassword/${resetToken}`;
//     await new Email(user, resetURL).sendPasswordReset();

//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email!"
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(new AppError("There was an error sending the email. Try again later!"), 500);
//   }
// });

// export const resetPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on the token
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() }
//   });

//   // 2) If token has not expired, and there is user, set the new password
//   if (!user) {
//     return next(new AppError("Token is invalid or has expired", 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();

//   // 3) Update changedPasswordAt property for the user
//   // 4) Log the user in, send JWT
//   createSendToken(user, 200, req, res);
// });

// export const updatePassword = catchAsync(async (req, res, next) => {
//   // 1) Get user from collection
//   const user = await User.findById(req.user.id).select("+password");

//   // 2) Check if POSTed current password is correct
//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError("Your current password is wrong.", 401));
//   }

//   // 3) If so, update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();
//   // User.findByIdAndUpdate will NOT work as intended!

//   // 4) Log user in, send JWT
//   createSendToken(user, 200, req, res);
// });
