import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.refereshAccessToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave : false});

        return {accessToken, refreshToken}

    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating Access Token or Refresh Token.")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullname, email, username, password} = req.body;
    for(let i of [fullname, email, username, password])
    {
        if(i == undefined || i.trim() === "") {
            res.status(400).json(
                new ApiResponse(400 ,"All field required.", "Failed")
            )
        }
        
    }

    const existedUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() }, 
            { email: email }
        ]
    });

    if (existedUser) {
        res.status(400).json(
            new ApiResponse(408 ,"Email or Username already exists", "Failed")
        )
        throw new ApiError(408, "Email or Username already exists");
    }
    const user = await User.create({
        fullname,
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser)
    {
        res.status(400).json(
            new ApiResponse(500 ,"Something went wrong while registering a user", "Failed")
        )
        throw new ApiError(500, "Something went wrong while registering a user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser,"User Created Succesfully")
    );

})

const loginUser = asyncHandler( async (req, res) =>{

    const {username, email, password} = req.body;

    if(!username && !email)
    {
        res.status(400).json(
            new ApiResponse(400 ,"username or email is required", "Failed")
        )
        throw new ApiError(400, "username or email is required");
    }
    const user = await User.findOne({
        $or : [{username}, {email}]
    })

    if(!user)
    {
        res.status(400).json(
            new ApiResponse(400 ,"User not Found", "Failed")
        )
        throw new ApiError(404, "User not Found");
        
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid)
    {
        res.status(401).json(
            new ApiResponse(401 ,"Invalid User credential", "Failed")
        )
        throw new ApiError(401, "Invalid User credential");
    }


    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,     
        secure: true,
        sameSite: "None", 
        path: "/",   
    };

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user : loggedInUser, accessToken, refreshToken 
            },
            "User Logged In Succesfully."
        )
    )
})

const logoutUser = asyncHandler( async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
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

    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out."));

})

export {registerUser, loginUser, logoutUser};