// controllers/course.controller.ts (UPDATED WITH PROGRESS AND VISUAL FIELD)
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Class } from '../Models/class.model.js';
import { QuizProgress } from '../Models/quiz.model.js';
import { CourseProgress } from '../Models/courseProgress.model.js';
import { LessonProgress } from '../Models/lessonProgress.model.js';

// ============================================
// GET ALL COURSES WITH PROGRESS
// ============================================
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

  // Get all course progress for this user
  const courseProgresses = await CourseProgress.find({ userId: user._id });
  const courseProgressMap = new Map(
    courseProgresses.map((cp) => [cp.courseId, cp])
  );

  // Transform courses to match frontend structure
  const subjects = userClass.courses.map((course) => {
    const quizProgress = quizProgressMap.get(course.quiz.quizId);
    const courseProgress = courseProgressMap.get(course.courseId);

    return {
      id: course.courseId,
      name: course.courseName,
      code: course.courseCode,
      image: course.courseImage,
      paragraph: course.description,
      
      // Course Progress
      progress: courseProgress?.overallProgress || 0,
      status: courseProgress?.status || 'not_started',
      completedLessons: courseProgress?.completedLessons || 0,
      totalLessons: course.lessons.length,
      timeSpent: courseProgress?.totalTimeSpent || 0,
      
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
        // ADD VISUAL FIELD HERE
        visual: lesson.visual || [], // Add this line
      })),
      
      quiz: {
        quizId: course.quiz.quizId,
        quizTitle: course.quiz.quizTitle,
        quizImage: course.courseImage || '',
        totalQuestions: course.quiz.totalQuestions,
        passingScore: course.quiz.passingScore,
        timeLimit: course.quiz.timeLimit,
        status: quizProgress?.status || 'new',
        bestPercentage: quizProgress?.bestPercentage || 0,
        pointsEarned: quizProgress?.pointsEarned || 0,
        // ADD VISUAL TO QUIZ QUESTIONS
        questions: course.quiz.questions.map((question) => ({
          questionId: question.questionId,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          visual: question.visual || [], // Add this line
        })),
      },
    };
  });

  console.log("subjects", subjects);

  return res.status(200).json(
    new ApiResponse(200, 'Courses fetched successfully', {
      subjects,
      className: userClass.className,
      educationLevel: userClass.educationLevel,
    })
  );
});

// ============================================
// GET SPECIFIC COURSE TOPICS WITH PROGRESS
// ============================================
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

  // Get all lesson progress for this course
  const lessonProgresses = await LessonProgress.find({
    userId: user._id,
    courseId,
  });

  const lessonProgressMap = new Map(
    lessonProgresses.map((lp) => [lp.lessonId, lp])
  );

  // Get course progress
  const courseProgress = await CourseProgress.findOne({
    userId: user._id,
    courseId,
  });

  // Transform topics with progress
  const topics = course.lessons.map((lesson) => {
    const progress = lessonProgressMap.get(lesson.lessonId);

    return {
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
      // ADD VISUAL FIELD HERE
      visual: lesson.visual || [], // Add this line
      
      // Lesson Progress
      progress: progress?.progress || 0,
      status: progress?.status || 'not_started',
      timeSpent: progress?.timeSpent || 0,
      isBookmarked: progress?.isBookmarked || false,
      lastAccessedAt: progress?.lastAccessedAt,
      completedAt: progress?.completedAt,
    };
  });

  // Get quiz progress
  const quizProgress = await QuizProgress.findOne({
    userId: user._id,
    quizId: course.quiz.quizId,
  });

  const quiz = {
    quizId: course.quiz.quizId,
    quizTitle: course.quiz.quizTitle,
    quizImage: course.courseImage,
    totalQuestions: course.quiz.totalQuestions,
    passingScore: course.quiz.passingScore,
    timeLimit: course.quiz.timeLimit,
    status: quizProgress?.status || 'new',
    bestPercentage: quizProgress?.bestPercentage || 0,
    attempts: quizProgress?.attempts.length || 0,
    pointsEarned: quizProgress?.pointsEarned || 0,
    // ADD VISUAL TO QUIZ QUESTIONS
    questions: course.quiz.questions.map((question) => ({
      questionId: question.questionId,
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      visual: question.visual || [], // Add this line
    })),
  };

  return res.status(200).json(
    new ApiResponse(200, 'Topics fetched successfully', {
      courseName: course.courseName,
      courseProgress: {
        overallProgress: courseProgress?.overallProgress || 0,
        status: courseProgress?.status || 'not_started',
        completedLessons: courseProgress?.completedLessons || 0,
        totalLessons: course.lessons.length,
        timeSpent: courseProgress?.totalTimeSpent || 0,
      },
      topics,
      quiz,
    })
  );
});

// ============================================
// GET SINGLE TOPIC/LESSON WITH PROGRESS
// ============================================
const getTopicById = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { courseId, lessonId } = req.params;

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

  const lesson = course.lessons.find((l) => l.lessonId === lessonId);

  if (!lesson) {
    throw new ApiError({ statusCode: 404, message: 'Lesson not found' });
  }

  // Get lesson progress
  const lessonProgress = await LessonProgress.findOne({
    userId: user._id,
    courseId,
    lessonId,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Topic fetched successfully', {
      topic: {
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
        // ADD VISUAL FIELD HERE
        visual: lesson.visual || [], // Add this line
        
        // Progress
        progress: lessonProgress?.progress || 0,
        status: lessonProgress?.status || 'not_started',
        timeSpent: lessonProgress?.timeSpent || 0,
        isBookmarked: lessonProgress?.isBookmarked || false,
        notes: lessonProgress?.notes,
        lastAccessedAt: lessonProgress?.lastAccessedAt,
        completedAt: lessonProgress?.completedAt,
        
        // Media-specific progress
        videoWatchPercentage: lessonProgress?.videoWatchPercentage,
        audioListenPercentage: lessonProgress?.audioListenPercentage,
        textReadPercentage: lessonProgress?.textReadPercentage,
      },
      courseName: course.courseName,
    })
  );
});

export { getCoursesByClass, getCourseTopics, getTopicById };