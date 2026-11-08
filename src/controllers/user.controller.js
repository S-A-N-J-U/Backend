import {asyncHandler} from "../utils/asyncHandler.js"


const registerUser = asyncHandler( async (req, res) => {
   // get user detail from frontend
   // validation - not empty
   // check if user is already exits : by username and email
   // check for image, check for avatar
   // upload them to cloudnary, avatar
   // create user obj - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return res

   const {fullName, username, email, password} = req.body
   console.log('Email :', email);
   
} )


export {registerUser}