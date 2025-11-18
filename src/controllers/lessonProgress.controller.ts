// controllers/lessonProgress.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { LessonProgress, LessonProgressDocument } from '../Models/lessonProgress.model.js';
import { CourseProgress, CourseProgressDocument } from '../Models/courseProgress.model.js';
import { Class, ILesson } from '../Models/class.model.js';
import { unlockAchievementHelper } from './rewards.controller.js';
import mongoose from 'mongoose';

// ============================================
// GET LESSON PROGRESS
// ============================================
export const getLessonProgress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { lessonId } = req.params;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  let progress = await LessonProgress.findOne({
    userId: user._id,
    lessonId,
  });

  // If no progress exists, return default values
  if (!progress) {
    return res.status(200).json(
      new ApiResponse(200, 'No progress found', {
        status: 'not_started',
        progress: 0,
        timeSpent: 0,
        isBookmarked: false,
      })
    );
  }

  return res.status(200).json(
    new ApiResponse(200, 'Lesson progress fetched successfully', progress)
  );
});

// ============================================
// GET ALL LESSONS PROGRESS FOR A COURSE
// ============================================
export const getCourseLessonsProgress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { courseId } = req.params;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  const progresses = await LessonProgress.find({
    userId: user._id,
    courseId,
  });

  // Create a map for easy lookup
  const progressMap = new Map(
    progresses.map((p) => [p.lessonId, p])
  );

  return res.status(200).json(
    new ApiResponse(200, 'Course lessons progress fetched successfully', {
      progresses,
      progressMap: Object.fromEntries(progressMap),
    })
  );
});

// ============================================
// START/UPDATE LESSON PROGRESS
// ============================================
export const updateLessonProgress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { lessonId } = req.params;
  const {
    courseId,
    progress,
    timeSpent,
    videoWatchPercentage,
    audioListenPercentage,
    textReadPercentage,
  } = req.body;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  if (!courseId) {
    throw new ApiError({ statusCode: 400, message: 'Course ID is required' });
  }

  // Find or create lesson progress
  let lessonProgress: LessonProgressDocument | null = await LessonProgress.findOne({
    userId: user._id,
    courseId,
    lessonId,
  });

  if (!lessonProgress) {
    lessonProgress = await LessonProgress.create({
      userId: user._id,
      courseId,
      lessonId,
      status: 'in_progress',
      progress: 0,
    });
  }

  // Update progress
  if (progress !== undefined) {
    await lessonProgress.updateProgress(progress);
  }

  // Update time spent (incremental)
  if (timeSpent !== undefined && timeSpent > 0) {
    lessonProgress.timeSpent += timeSpent;
  }

  // Update media-specific progress
  if (videoWatchPercentage !== undefined) {
    lessonProgress.videoWatchPercentage = videoWatchPercentage;
  }
  if (audioListenPercentage !== undefined) {
    lessonProgress.audioListenPercentage = audioListenPercentage;
  }
  if (textReadPercentage !== undefined) {
    lessonProgress.textReadPercentage = textReadPercentage;
  }

  lessonProgress.lastAccessedAt = new Date();
  await lessonProgress.save();

  // Update course progress
  await updateCourseProgressHelper(user._id, courseId);
console.log('Updated lesson progress:', {
  lessonProgress,

  progress: {
    progress,
    timeSpent,
    videoWatchPercentage,
    audioListenPercentage,
    textReadPercentage
  },
});
  return res.status(200).json(
    new ApiResponse(200, 'Lesson progress updated successfully', lessonProgress)
  );
});

// ============================================
// MARK LESSON AS COMPLETED
// ============================================
export const markLessonCompleted = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { lessonId } = req.params;
  const { courseId } = req.body;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  if (!courseId) {
    throw new ApiError({ statusCode: 400, message: 'Course ID is required' });
  }

  // Find or create lesson progress
  let lessonProgress: LessonProgressDocument | null = await LessonProgress.findOne({
    userId: user._id,
    courseId,
    lessonId,
  });

  if (!lessonProgress) {
    lessonProgress = await LessonProgress.create({
      userId: user._id,
      courseId,
      lessonId,
    });
  }

  // Mark as completed
  await lessonProgress.markAsCompleted();

  // Update course progress
  const courseProgress = await updateCourseProgressHelper(user._id, courseId);

  // Check for achievements
  const completedLessonsCount = await LessonProgress.countDocuments({
    userId: user._id,
    status: 'completed',
  });

  // First lesson completed
  if (completedLessonsCount === 1) {
    await unlockAchievementHelper(user._id, 'first_course_completed');
  }
console.log('Lesson completed result:', {
  lessonProgress,
  courseProgress,
  completedLessonsCount,
});
  return res.status(200).json(
    new ApiResponse(
      200,
      'Lesson marked as completed',
      {
        lessonProgress,
        courseProgress,
      }
    )
  );
});

// ============================================
// TOGGLE BOOKMARK
// ============================================
export const toggleLessonBookmark = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { lessonId } = req.params;
  const { courseId } = req.body;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  // Find or create lesson progress
  let lessonProgress: LessonProgressDocument | null = await LessonProgress.findOne({
    userId: user._id,
    courseId,
    lessonId,
  });

  if (!lessonProgress) {
    lessonProgress = await LessonProgress.create({
      userId: user._id,
      courseId,
      lessonId,
    });
  }

  lessonProgress.isBookmarked = !lessonProgress.isBookmarked;
  await lessonProgress.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      'Bookmark toggled successfully',
      {
        isBookmarked: lessonProgress.isBookmarked,
      }
    )
  );
});

// ============================================
// ADD/UPDATE LESSON NOTES
// ============================================
export const updateLessonNotes = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { lessonId } = req.params;
  const { courseId, notes } = req.body;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  // Find or create lesson progress
  let lessonProgress: LessonProgressDocument | null = await LessonProgress.findOne({
    userId: user._id,
    courseId,
    lessonId,
  });

  if (!lessonProgress) {
    lessonProgress = await LessonProgress.create({
      userId: user._id,
      courseId,
      lessonId,
    });
  }

  lessonProgress.notes = notes;
  await lessonProgress.save();

  return res.status(200).json(
    new ApiResponse(200, 'Notes updated successfully', lessonProgress)
  );
});

// ============================================
// GET ALL BOOKMARKED LESSONS
// ============================================
export const getBookmarkedLessons = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  const bookmarkedLessons = await LessonProgress.find({
    userId: user._id,
    isBookmarked: true,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Bookmarked lessons fetched successfully', bookmarkedLessons)
  );
});

// ============================================
// GET COURSE OVERVIEW WITH PROGRESS
// ============================================
export const getCourseProgressOverview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { courseId } = req.params;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  // Get course progress
  const courseProgress: CourseProgressDocument | null = await CourseProgress.findOne({
    userId: user._id,
    courseId,
  });

  // Get all lesson progresses
  const lessonProgresses = await LessonProgress.find({
    userId: user._id,
    courseId,
  });

  // Get course details from Class
  const userClass = await Class.findOne({ classId: user.currentClassId });
  const course = userClass?.courses.find((c) => c.courseId === courseId);

  if (!course) {
    throw new ApiError({ statusCode: 404, message: 'Course not found' });
  }

  // Map lesson progress
  const lessonsWithProgress = course.lessons.map((lesson: ILesson) => {
    const progress = lessonProgresses.find((lp) => lp.lessonId === lesson.lessonId);
    return {
      ...lesson,
      progress: progress?.progress || 0,
      status: progress?.status || 'not_started',
      timeSpent: progress?.timeSpent || 0,
      isBookmarked: progress?.isBookmarked || false,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      'Course progress overview fetched successfully',
      {
        courseProgress,
        lessons: lessonsWithProgress,
        totalLessons: course.lessons.length,
        completedLessons: lessonProgresses.filter((lp) => lp.status === 'completed').length,
      }
    )
  );
});

// ============================================
// GET USER'S OVERALL LEARNING STATS
// ============================================
export const getUserLearningStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  // Get all course progresses
  const courseProgresses = await CourseProgress.find({ userId: user._id });

  // Get all lesson progresses
  const lessonProgresses = await LessonProgress.find({ userId: user._id });

  // Calculate stats
  const totalCourses = courseProgresses.length;
  const completedCourses = courseProgresses.filter((cp) => cp.status === 'completed').length;
  const inProgressCourses = courseProgresses.filter((cp) => cp.status === 'in_progress').length;

  const totalLessons = lessonProgresses.length;
  const completedLessons = lessonProgresses.filter((lp) => lp.status === 'completed').length;
  const inProgressLessons = lessonProgresses.filter((lp) => lp.status === 'in_progress').length;

  const totalTimeSpent = lessonProgresses.reduce((sum, lp) => sum + lp.timeSpent, 0);

  const averageCourseProgress =
    totalCourses > 0
      ? courseProgresses.reduce((sum, cp) => sum + cp.overallProgress, 0) / totalCourses
      : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      'Learning stats fetched successfully',
      {
        courses: {
          total: totalCourses,
          completed: completedCourses,
          inProgress: inProgressCourses,
          averageProgress: Math.round(averageCourseProgress),
        },
        lessons: {
          total: totalLessons,
          completed: completedLessons,
          inProgress: inProgressLessons,
        },
        totalTimeSpent, // in seconds
        totalTimeSpentHours: Math.round(totalTimeSpent / 3600),
      }
    )
  );
});

// ============================================
// HELPER: UPDATE COURSE PROGRESS
// ============================================
async function updateCourseProgressHelper(userId: mongoose.Types.ObjectId, courseId: string) {
  // Get all lesson progresses for this course
  const lessonProgresses = await LessonProgress.find({ userId, courseId });

  // Get course details
  const userClass = await Class.findOne({
    'courses.courseId': courseId,
  });

  const course = userClass?.courses.find((c) => c.courseId === courseId);
  if (!course) return null;

  const totalLessons = course.lessons.length;
  const completedLessons = lessonProgresses.filter((lp) => lp.status === 'completed').length;
  const totalTimeSpent = lessonProgresses.reduce((sum, lp) => sum + lp.timeSpent, 0);

  // Find or create course progress
  let courseProgress: CourseProgressDocument | null = await CourseProgress.findOne({ userId, courseId });

  if (!courseProgress) {
    courseProgress = await CourseProgress.create({
      userId,
      courseId,
      courseName: course.courseName,
      totalLessons,
      completedLessons,
      totalTimeSpent,
    });
  } else {
    courseProgress.completedLessons = completedLessons;
    courseProgress.totalTimeSpent = totalTimeSpent;
    courseProgress.totalLessons = totalLessons;
    courseProgress.lastAccessedAt = new Date();
  }

  await courseProgress.updateOverallProgress();

  return courseProgress;
}

export { updateCourseProgressHelper };
