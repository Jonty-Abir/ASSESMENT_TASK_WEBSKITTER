const { StatusCodes } = require("http-status-codes");
const { verifyToken } = require("../../service/token.service");
const {UserModel} = require("../../model/api/userModel");

async function isAuthorized(req, res, next) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if(!token){
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "BAD_REQUEST...!",
          status: StatusCodes.BAD_REQUEST,
        });
    }
    // Check JWT token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({
          message: "UNAUTHORIZED...!",
          status: StatusCodes.UNAUTHORIZED,
        });
    }
    const user = await UserModel.findById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    console.log("from isAuthorized.", error?.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "UNAUTHORIZED...!", status: StatusCodes.UNAUTHORIZED });
  }
}

module.exports = { isAuthorized };
