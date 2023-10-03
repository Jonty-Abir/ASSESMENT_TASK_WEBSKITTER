const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const niv = require("node-input-validator");
const { UserModel } = require("../../model/api/userModel");
const { TokenModel } = require("../../model/api/tokenModel");
const { createHash, compareHash } = require("../../service/hash.service");

const { LoginDTO } = require("../../Dto/userDto");
const { sendingEmail } = require("../../service/mail.service");
const {
  signToken,
  verifyToken: verifyTokenService,
} = require("../../service/token.service");

/*============== REGISTER ================*/
async function register(req, res) {
  const payload = req.body;

  try {
    // Check Email Address Exist
    niv.extend("unique", async ({ value, args }) => {
      // default field is email in this example
      const field = args[1] || "email";

      let condition = {};

      condition[field] = value;

      let emailExist = await mongoose.model(args[0]).findOne(condition);

      // email already exists
      if (emailExist) {
        return false;
      }
      return true;
    });

    // Check Valid Mobile NO
    niv.extendMessages(
      {
        validNo: "Invalid mobile No..!",
      },
      "en"
    );

    niv.extend("validNo", async ({ value }) => {
      // email already exists
      if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(value)) {
        return false;
      }
      return true;
    });

    const rules = {
      fullName: "required|string|minLength:3",
      email: "required|email|unique:User,email",
      mobileNo: "required|string|validNo",
      answer: "required|string",
      password: "required|string|minLength:6",
      cPassword: "required|string|minLength:6",
    };
    const v = new niv.Validator(payload, rules);
    const matched = await v.check();

    if (!matched) {
      // console.log(v.errors);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: v.errors });
    }

    // Check Both password word are same
    if (payload.password !== payload.cPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: {
          cPassword: { message: "both password not same!" },
        },
        message: "Bad request",
      });
    }
    // create has password
    const hashPassword = await createHash(req.body.password);

    let user;

    if (req?.file) {
      const userModel = new UserModel({
        ...req.body,
        password: hashPassword,
        avatar: req?.file?.filename,
      });
      // Save to DB
      user = await userModel.save();
    } else {
      const userModel = new UserModel({ ...req.body, password: hashPassword });
      // Save to DB
      user = await userModel.save();
    }

    // const model = new UserModel({ ...req.body, password: hashPassword });
    // // Save to DB
    // await model.save();
    // Token Model
    const tokenMOdel = new TokenModel({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    const token = await tokenMOdel.save();
    // sending email
    await sendingEmail(req, user, token);

    return res.status(StatusCodes.CREATED).json({
      message: "success",
      status: StatusCodes.CREATED,
      user: new LoginDTO(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server Error.!",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
    });
  }
}

/*============== LOGIN ================*/
async function login(req, res) {
  const payload = req.body;

  try {
    const rules = {
      email: "required|email",
      password: "required|string",
    };
    const v = new niv.Validator(payload, rules);
    const matched = await v.check();

    if (!matched) {
      // console.log(v.errors);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: v.errors });
    }

    //User Exist Or Not

    const user = await UserModel.findOne({
      email: payload.email,
      role: "User",
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: {
          errorMsg: "UNAUTHORIZED... try again .!",
        },
        message: "Bad request",
        status: StatusCodes.UNAUTHORIZED,
      });
    }
    // Check User already verified ir not
    if (!user?.isVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "User not verified. Check your email.",
        message: "Bad request",
        status: StatusCodes.BAD_REQUEST,
      });
    }

    // create has password
    const validPw = await compareHash(payload.password, user.password);

    if (!validPw) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: {
          errorMsg: "UNAUTHORIZED... try again .!",
        },
        message: "unauthorized... try again!",
        status: StatusCodes.UNAUTHORIZED,
      });
    }
    // sing Token
    const tokenPayload = {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
    };

    const token = await signToken(tokenPayload);

    res.cookie("user-token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 2,
    });

    return res.status(StatusCodes.OK).json({
      message: "success",
      status: StatusCodes.OK,
      token,
      user: new LoginDTO(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server Error.!",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
    });
  }
}

/*============== VERIFY TOKEN ================*/
async function verifyToken(req, res) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "UNAUTHORIZED..!",
        status: StatusCodes.UNAUTHORIZED,
        isAuthorized: false,
      });
    }
    //
    const decoded = await verifyTokenService(token);

    if (!decoded) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "UNAUTHORIZED..!",
        status: StatusCodes.UNAUTHORIZED,
        isAuthorized: false,
      });
    }

    const user = await UserModel.findById(decoded.id);

    return res.status(StatusCodes.OK).json({
      message: "SUCCESS..",
      status: StatusCodes.OK,
      isAuthorized: true,
      user: new LoginDTO(user),
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server Error.!",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
    });
  }
}

/*============== Confirmation ================*/
async function confirmationToLogin(req, res) {
  if (!req?.params?.email || !req?.params?.token) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Bad request",
      message: "failed..!",
      status: StatusCodes.BAD_REQUEST,
    });
  }
  //
  try {
    const token = await TokenModel.findOne({ token: req.params.token });
    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Token may-be expired!",
        status: StatusCodes.BAD_REQUEST,
      });
    }
    const user = await UserModel.findOne({
      _id: token._userId,
      email: req.params.email,
    });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not Found..!",
        status: StatusCodes.NOT_FOUND,
      });
    }

    // Check User Already verified OR not
    if (user.isVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "User Already Verified...",
        status: StatusCodes.BAD_REQUEST,
      });
    } else {
      const updatedUser = await UserModel.findByIdAndUpdate(
        user?._id,
        { isVerified: true },
        { new: true }
      );
      if (updatedUser) {
        // SEND SUCCESS response to Client
        return res.status(StatusCodes.OK).json({
          status: "success",
          message: "Your Account Successfully Verified",
        });
      } else {
        throw new Error();
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed.!",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

/*============== Updated Password ================*/
async function updatedPassword(req, res) {
  const payload = req?.body;
  const user = req?.user;
  try {
    const rules = { email: "required|email", newPassword: "required|string" };

    const v = new niv.Validator(payload, rules);
    const matched = await v.check();

    if (!matched) {
      // console.log(v.errors);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: v.errors });
    }
    if (user?.email !== payload?.email) {
      // console.log(v.errors);
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Failed..!",
        status: StatusCodes.BAD_REQUEST,
        msg: "Email not found..!",
      });
    }
    const hashPassword = await createHash(req.body.newPassword);
    if (await compareHash(payload?.newPassword, user?.password)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Failed..!",
        status: StatusCodes.BAD_REQUEST,
        msg: "Old password and new password should not same..!",
      });
    }
    await UserModel.findByIdAndUpdate(user?._id, { password: hashPassword });

    return res.status(StatusCodes.OK).json({
      message: "SUCCESS",
      status: StatusCodes.OK,
      msg: "Your password updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed.!",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

/*============== Reset Password ================*/
async function resetPassword(req, res) {
  const payload = req?.body;

  try {
    const rules = {
      email: "required|email",
      answer: "required|string",
      newPassword: "required|string",
    };

    const v = new niv.Validator(payload, rules);
    const matched = await v.check();

    if (!matched) {
      // console.log(v.errors);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: v.errors });
    }
    
    const user = await UserModel.findOne({
      answer: req?.body?.answer,
      email: req?.body?.email,
    });
    //
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "wrong Email or Answer",
      });
    }
    // Create Hash Password
    const hashPassword = await createHash(req.body.newPassword);
    if (await compareHash(payload?.newPassword, user?.password)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Failed..!",
        status: StatusCodes.BAD_REQUEST,
        msg: "Old password and new password should not same..!",
      });
    }
    await UserModel.findByIdAndUpdate(user?._id, { password: hashPassword });

    return res.status(StatusCodes.OK).json({
      message: "SUCCESS",
      status: StatusCodes.OK,
      msg: "Your password updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed.!",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

/*============== DashBoard ================*/
async function dashboard(req, res) {
  try {
    return res.status(StatusCodes.OK).json({
      message: "SUCCESS",
      status: StatusCodes.OK,
      result: `Hey ${req?.user?.fullName} welcome to our DashBoard.🥳🥳🥳`,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error?.message,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
module.exports = {
  register,
  login,
  verifyToken,
  confirmationToLogin,
  updatedPassword,
  resetPassword,
  dashboard,
};
