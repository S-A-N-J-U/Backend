import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userid) => {

    try {
        const user = User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, " Something went wrong while generating access and refresh token ")
    }

}


const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validation - not empty
    // check if user is already exits : by username and email
    // check for image, check for avatar
    // upload them to cloudnary, avatar
    // create user obj - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, username, email, password } = req.body
    // console.log('\nEmail :', email, "\n", password);

    if
        (
        [fullName, username, email, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required"); // check format of email
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // console.log('existedUser', existedUser);


    if (existedUser) throw new ApiError(409, "User already exists");

    // middleware add additional info or data in req

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath =  req.files?.coverImage[0]?.path   // Method 1

    let coverImageLocalPath;   // Method 2
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"     // fields that were not sent in the response by select method
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong")

    }
    // console.log('createdUser', createdUser);

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    // Take data from req.body
    // check details isn't empty
    // use mongoose to match data if is correct lodin user successfully

    const { email, password, username } = req.body

    if (!req.body) throw new ApiError(401, "No request is found")

    if (!email || !username) throw new ApiError(400, "Username or email and password are required")

    if ((email.trim() === "" || username.trim() === "") && password.trim() === "") throw new ApiError(400, "Username or email and password are required")

    // TODO: Check format of email and strength of password by regexp  or validator or match keyword in mongoose

    // decrypt the password

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) throw new ApiError(404, "user not found")

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, "Password is incorrect")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken ")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
       new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged In Successfuly"
       )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refresh", options).json( new ApiResponse(200, {}, " user successfully loggout ") )
} )

export { registerUser, loginUser, logoutUser }