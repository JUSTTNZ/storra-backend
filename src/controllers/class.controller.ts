import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Class } from '../models/class.model.js';

const getCoursesByClass = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.currentClassId) {
        throw new ApiError({statusCode:400, message:'User class information is missing'});
    }

    const userClass = await Class.findOne({ classId: user.currentClassId });

    if (!userClass) {
        throw new ApiError({statusCode:404, message:'Class not found for the user'});
    }

    return res.status(200).json(
        new ApiResponse(200, 'Courses fetched successfully', userClass.courses
            
        )
    );
});

export { getCoursesByClass };
