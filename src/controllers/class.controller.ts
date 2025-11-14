// import { Request, Response } from 'express';
// import { asyncHandler } from '../utils/AsyncHandler.js';
// import { ApiResponse } from '../utils/ApiResponse.js';
// import { ApiError } from '../utils/ApiError.js';
// import { Class } from '../Models/class.model.js';

// // Get all courses (subjects) for the user's class
// const getCoursesByClass = asyncHandler(async (req: Request, res: Response) => {
//     const user = req.user;

//     if (!user || !user.currentClassId) {
//         throw new ApiError({statusCode: 400, message: 'User class information is missing'});
//     }

//     const userClass = await Class.findOne({ classId: user.currentClassId });

//     if (!userClass) {
//         throw new ApiError({statusCode: 404, message: 'Class not found for the user'});
//     }

//     // Transform courses to match frontend structure
//     const subjects = userClass.courses.map(course => ({
//         id: course.courseId,
//         name: course.courseName,
//         code: course.courseCode,
//         image: course.courseImage,
//         paragraph: course.description,
//         topics: course.lessons.map(lesson => ({
//             id: lesson.lessonId,
//             title: lesson.lessonTitle,
//             paragraph: lesson.description,
//             coverImage: course.courseImage || '', // Use course image as cover
//             lessonType: lesson.lessonType,
//             content: {
//                 text: lesson.textContent,
//                 video: lesson.videoUrl,
//                 audio: lesson.audioUrl
//             }
//         })),
//            quiz: course.quiz 
//     }));
//      console.log("s",subjects)

//     return res.status(200).json(
//         new ApiResponse(200, 'Courses fetched successfully', {
//             subjects,
//             className: userClass.className,
//             educationLevel: userClass.educationLevel
//         })
//     );
// });

// // Get specific course topics
// const getCourseTopics = asyncHandler(async (req: Request, res: Response) => {
//     const user = req.user;
//     const { courseId } = req.params;

//     if (!user || !user.currentClassId) {
//         throw new ApiError({statusCode: 400, message: 'User class information is missing'});
//     }

//     const userClass = await Class.findOne({ classId: user.currentClassId });

//     if (!userClass) {
//         throw new ApiError({statusCode: 404, message: 'Class not found'});
//     }

//     const course = userClass.courses.find(c => c.courseId === courseId);

//     if (!course) {
//         throw new ApiError({statusCode: 404, message: 'Course not found'});
//     }

//     const topics = course.lessons.map(lesson => ({
//         id: lesson.lessonId,
//         title: lesson.lessonTitle,
//         paragraph: lesson.description,
//         coverImage: course.courseImage || '',
//         lessonType: lesson.lessonType,
//         content: {
//             text: lesson.textContent,
//             video: lesson.videoUrl,
//             audio: lesson.audioUrl
//         }
//     }));
//       const quiz = course.quiz || null;
//  console.log("t",topics)
//     return res.status(200).json(
//         new ApiResponse(200, 'Topics fetched successfully', {
//             courseName: course.courseName,
//             topics,
//             quiz
//         })
//     );
// });

// export { getCoursesByClass, getCourseTopics };

// controllers/course.controller.ts (UPDATED)
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Class } from '../Models/class.model.js';
import { QuizProgress } from '../Models/quiz.model.js';

// Get all courses (subjects) for the user's class WITH QUIZ STATUS
const getCoursesByClass = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user || !user.currentClassId) {
    throw new ApiError({ statusCode: 400, message: 'User class information is missing' });
  }

  const userClass = await Class.findOne({ classId: user.currentClassId });

  if (!userClass) {
    throw new ApiError({ statusCode: 404, message: 'Class not found for the user' });
  }

  // Get all quiz progress for this user
  const quizProgresses = await QuizProgress.find({ userId: user._id });
  const quizProgressMap = new Map(
    quizProgresses.map((qp) => [qp.quizId, qp])
  );

  // Transform courses to match frontend structure
  const subjects = userClass.courses.map((course) => {
    const quizProgress = quizProgressMap.get(course.quiz.quizId);

    return {
      id: course.courseId,
      name: course.courseName,
      code: course.courseCode,
      image: course.courseImage,
      paragraph: course.description,
      topics: course.lessons.map((lesson) => ({
        id: lesson.lessonId,
        title: lesson.lessonTitle,
        paragraph: lesson.description,
        coverImage: course.courseImage || '',
        lessonType: lesson.lessonType,
        content: {
          text: lesson.textContent,
          video: lesson.videoUrl,
          audio: lesson.audioUrl,
        },
      })),
      quiz: {
        quizId: course.quiz.quizId,
        quizTitle: course.quiz.quizTitle,
        quizImage: course.courseImage || '', // NOW INCLUDED
        totalQuestions: course.quiz.totalQuestions,
        passingScore: course.quiz.passingScore,
        timeLimit: course.quiz.timeLimit,
        // Add quiz status
        status: quizProgress?.status || 'new',
        bestPercentage: quizProgress?.bestPercentage || 0,
        pointsEarned: quizProgress?.pointsEarned || 0,
      },
    };
  });

  console.log('Subjects with quiz status:', subjects);

  return res.status(200).json(
    new ApiResponse(200, 'Courses fetched successfully', {
      subjects,
      className: userClass.className,
      educationLevel: userClass.educationLevel,
    })
  );
});

// Get specific course topics WITH QUIZ STATUS
const getCourseTopics = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { courseId } = req.params;

  if (!user || !user.currentClassId) {
    throw new ApiError({ statusCode: 400, message: 'User class information is missing' });
  }

  const userClass = await Class.findOne({ classId: user.currentClassId });

  if (!userClass) {
    throw new ApiError({ statusCode: 404, message: 'Class not found' });
  }

  const course = userClass.courses.find((c) => c.courseId === courseId);

  if (!course) {
    throw new ApiError({ statusCode: 404, message: 'Course not found' });
  }

  const topics = course.lessons.map((lesson) => ({
    id: lesson.lessonId,
    title: lesson.lessonTitle,
    paragraph: lesson.description,
    coverImage: course.courseImage || '',
    lessonType: lesson.lessonType,
    content: {
      text: lesson.textContent,
      video: lesson.videoUrl,
      audio: lesson.audioUrl,
    },
  }));

  // Get quiz progress
  const quizProgress = await QuizProgress.findOne({
    userId: user._id,
    quizId: course.quiz.quizId,
  });

  const quiz = {
    quizId: course.quiz.quizId,
    quizTitle: course.quiz.quizTitle,
    quizImage: course.courseImage, // NOW INCLUDED
    totalQuestions: course.quiz.totalQuestions,
    passingScore: course.quiz.passingScore,
    timeLimit: course.quiz.timeLimit,
    // Add status
    status: quizProgress?.status || 'new',
    bestPercentage: quizProgress?.bestPercentage || 0,
    attempts: quizProgress?.attempts.length || 0,
    pointsEarned: quizProgress?.pointsEarned || 0,
  };

  console.log('Topics with quiz:', topics);

  return res.status(200).json(
    new ApiResponse(200, 'Topics fetched successfully', {
      courseName: course.courseName,
      topics,
      quiz,
    })
  );
});

export { getCoursesByClass, getCourseTopics };