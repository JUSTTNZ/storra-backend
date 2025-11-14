import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Class } from '../Models/class.model.js';

// Get all courses (subjects) for the user's class
const getCoursesByClass = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.currentClassId) {
        throw new ApiError({statusCode: 400, message: 'User class information is missing'});
    }

    const userClass = await Class.findOne({ classId: user.currentClassId });

    if (!userClass) {
        throw new ApiError({statusCode: 404, message: 'Class not found for the user'});
    }

    // Transform courses to match frontend structure
    const subjects = userClass.courses.map(course => ({
        id: course.courseId,
        name: course.courseName,
        code: course.courseCode,
        image: course.courseImage,
        paragraph: course.description,
        topics: course.lessons.map(lesson => ({
            id: lesson.lessonId,
            title: lesson.lessonTitle,
            paragraph: lesson.description,
            coverImage: course.courseImage || '', // Use course image as cover
            lessonType: lesson.lessonType,
            content: {
                text: lesson.textContent,
                video: lesson.videoUrl,
                audio: lesson.audioUrl
            }
        })),
           quiz: course.quiz 
    }));
     console.log("s",subjects)

    return res.status(200).json(
        new ApiResponse(200, 'Courses fetched successfully', {
            subjects,
            className: userClass.className,
            educationLevel: userClass.educationLevel
        })
    );
});

// Get specific course topics
const getCourseTopics = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const { courseId } = req.params;

    if (!user || !user.currentClassId) {
        throw new ApiError({statusCode: 400, message: 'User class information is missing'});
    }

    const userClass = await Class.findOne({ classId: user.currentClassId });

    if (!userClass) {
        throw new ApiError({statusCode: 404, message: 'Class not found'});
    }

    const course = userClass.courses.find(c => c.courseId === courseId);

    if (!course) {
        throw new ApiError({statusCode: 404, message: 'Course not found'});
    }

    const topics = course.lessons.map(lesson => ({
        id: lesson.lessonId,
        title: lesson.lessonTitle,
        paragraph: lesson.description,
        coverImage: course.courseImage || '',
        lessonType: lesson.lessonType,
        content: {
            text: lesson.textContent,
            video: lesson.videoUrl,
            audio: lesson.audioUrl
        }
    }));
      const quiz = course.quiz || null;
 console.log("t",topics)
    return res.status(200).json(
        new ApiResponse(200, 'Topics fetched successfully', {
            courseName: course.courseName,
            topics,
            quiz
        })
    );
});

export { getCoursesByClass, getCourseTopics };