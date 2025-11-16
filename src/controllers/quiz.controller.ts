// controllers/quiz.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Class } from '../Models/class.model.js';
import { QuizProgress } from '../Models/quiz.model.js';
import { UserLeaderboard } from '../Models/quiz.model.js';

// ============================================
// GET QUIZ BY ID (with user progress)
// ============================================
const getQuizById = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { courseId, quizId } = req.params;

  if (!user || !user.currentClassId) {
    throw new ApiError({ statusCode: 400, message: 'User class information is missing' });
  }

  // Find the class and course
  const userClass = await Class.findOne({ classId: user.currentClassId });
  if (!userClass) {
    throw new ApiError({ statusCode: 404, message: 'Class not found' });
  }

  const course = userClass.courses.find((c) => c.courseId === courseId);
  if (!course) {
    throw new ApiError({ statusCode: 404, message: 'Course not found' });
  }

  if (!course.quiz || course.quiz.quizId !== quizId) {
    throw new ApiError({ statusCode: 404, message: 'Quiz not found' });
  }

  // Get user's progress for this quiz
  let quizProgress = await QuizProgress.findOne({
    userId: user._id,
    quizId: quizId,
  });

  // If no progress exists, create a new one with status 'new'
  if (!quizProgress) {
    quizProgress = await QuizProgress.create({
      userId: user._id,
      classId: user.currentClassId,
      courseId: courseId,
      quizId: quizId,
      status: 'new',
      attempts: [],
      bestScore: 0,
      bestPercentage: 0,
      pointsEarned: 0,
    });
  }

  // Return quiz without correct answers (for security)
  const quizData = {
    quizId: course.quiz.quizId,
    quizTitle: course.quiz.quizTitle,
    quizImage: course.quiz.quizImage,
    totalQuestions: course.quiz.totalQuestions,
    passingScore: course.quiz.passingScore,
    timeLimit: course.quiz.timeLimit,
    questions: course.quiz.questions.map((q) => ({
      questionId: q.questionId,
      questionText: q.questionText,
      options: q.options,
      // correctAnswer is NOT included for security
    })),
  };

  return res.status(200).json(
    new ApiResponse(200, 'Quiz fetched successfully', {
      quiz: quizData,
      progress: {
        status: quizProgress.status,
        attempts: quizProgress.attempts.length,
        bestScore: quizProgress.bestScore,
        bestPercentage: quizProgress.bestPercentage,
        pointsEarned: quizProgress.pointsEarned,
      },
      courseName: course.courseName,
    })
  );
});

// ============================================
// SUBMIT QUIZ ATTEMPT
// ============================================
const submitQuizAttempt = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { courseId, quizId } = req.params;
  const { answers, timeSpent } = req.body; // answers: [{ questionId, selectedAnswer }]

  if (!user || !user.currentClassId) {
    throw new ApiError({ statusCode: 400, message: 'User class information is missing' });
  }

  if (!answers || !Array.isArray(answers)) {
    throw new ApiError({ statusCode: 400, message: 'Answers are required' });
  }

  // Find the class and course
  const userClass = await Class.findOne({ classId: user.currentClassId });
  if (!userClass) {
    throw new ApiError({ statusCode: 404, message: 'Class not found' });
  }

  const course = userClass.courses.find((c) => c.courseId === courseId);
  if (!course || !course.quiz || course.quiz.quizId !== quizId) {
    throw new ApiError({ statusCode: 404, message: 'Quiz not found' });
  }

  const quiz = course.quiz;

  // Calculate score
  let correctCount = 0;
  const processedAnswers = answers.map((answer) => {
    const question = quiz.questions.find((q) => q.questionId === answer.questionId);
    if (!question) {
      throw new ApiError({ statusCode: 400, message: `Question ${answer.questionId} not found` });
    }

    const isCorrect = question.correctAnswer === answer.selectedAnswer;
    if (isCorrect) correctCount++;

    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    };
  });

  const percentage = (correctCount / quiz.totalQuestions) * 100;

  // Find or create quiz progress
  let quizProgress = await QuizProgress.findOne({
    userId: user._id,
    quizId: quizId,
  });

  if (!quizProgress) {
    quizProgress = new QuizProgress({
      userId: user._id,
      classId: user.currentClassId,
      courseId: courseId,
      quizId: quizId,
      status: 'new',
      attempts: [],
      bestScore: 0,
      bestPercentage: 0,
      pointsEarned: 0,
    });
  }

  // Determine new status based on percentage
  let newStatus: 'new' | 'incomplete' | 'complete' = 'incomplete';
  let pointsEarned = 0;

  if (percentage < 50) {
    newStatus = 'incomplete'; // Needs retake
  } else if (percentage >= 70) {
    newStatus = 'complete';
    if (percentage === 100) {
      pointsEarned = 5; // Bonus points for perfect score
    }
  }

  // Add attempt
  const attemptNumber = quizProgress.attempts.length + 1;
  quizProgress.attempts.push({
    attemptNumber,
    score: correctCount,
    totalQuestions: quiz.totalQuestions,
    percentage,
    answers: processedAnswers,
    timeSpent: timeSpent || 0,
    attemptedAt: new Date(),
  });

  // Update best score
  if (percentage > quizProgress.bestPercentage) {
    quizProgress.bestScore = correctCount;
    quizProgress.bestPercentage = percentage;
  }

  // Update status and points
  quizProgress.status = newStatus;

  // Award points only once (first time reaching 100%)
  if (percentage === 100 && quizProgress.pointsEarned === 0) {
    quizProgress.pointsEarned = pointsEarned;
  }

  if (newStatus === 'complete' && !quizProgress.completedAt) {
    quizProgress.completedAt = new Date();
  }

  await quizProgress.save();

  // Update user leaderboard
  await updateUserLeaderboard(
    user._id,
    user.currentClassId,
    user.educationLevel || 'primary',
    pointsEarned,
    newStatus === 'complete',
    percentage === 100
  );

  return res.status(200).json(
    new ApiResponse(200, 'Quiz submitted successfully', {
      attemptNumber,
      score: correctCount,
      totalQuestions: quiz.totalQuestions,
      percentage,
      status: newStatus,
      pointsEarned,
      passed: percentage >= quiz.passingScore,
      passingScore: quiz.passingScore,
      answers: processedAnswers,
      message:
        percentage === 100
          ? '🎉 Perfect score! You earned 5 bonus points!'
          : percentage >= 70
          ? '✅ Quiz completed!'
          : percentage >= 50
          ? '⚠️ Nice one, but try to improve your score'
          : '❌ You need to retake this quiz',
    })
  );
});

// ============================================
// GET USER'S QUIZ PROGRESS FOR A COURSE
// ============================================
const getUserQuizProgress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { courseId } = req.params;

  if (!user || !user.currentClassId) {
    throw new ApiError({ statusCode: 400, message: 'User class information is missing' });
  }

  const quizProgress = await QuizProgress.find({
    userId: user._id,
    courseId: courseId,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Quiz progress fetched successfully', {
      quizzes: quizProgress.map((qp) => ({
        quizId: qp.quizId,
        status: qp.status,
        attempts: qp.attempts.length,
        bestScore: qp.bestScore,
        bestPercentage: qp.bestPercentage,
        pointsEarned: qp.pointsEarned,
        completedAt: qp.completedAt,
      })),
    })
  );
});

// ============================================
// GET ALL USER'S QUIZ STATISTICS
// ============================================
const getUserQuizStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  const allProgress = await QuizProgress.find({ userId: user._id });

  const stats = {
    totalQuizzes: allProgress.length,
    completed: allProgress.filter((qp) => qp.status === 'complete').length,
    incomplete: allProgress.filter((qp) => qp.status === 'incomplete').length,
    new: allProgress.filter((qp) => qp.status === 'new').length,
    totalPoints: allProgress.reduce((sum, qp) => sum + qp.pointsEarned, 0),
    perfectScores: allProgress.filter((qp) => qp.bestPercentage === 100).length,
    averageScore: allProgress.length > 0
      ? allProgress.reduce((sum, qp) => sum + qp.bestPercentage, 0) / allProgress.length
      : 0,
  };

  return res.status(200).json(
    new ApiResponse(200, 'Quiz statistics fetched successfully', stats)
  );
});

// ============================================
// GET LEADERBOARD
// ============================================
const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { scope } = req.query; // 'class' | 'education' | 'global'
  const user = req.user;

  let query: any = {};

  if (scope === 'class' && user?.currentClassId) {
    query.classId = user.currentClassId;
  } else if (scope === 'education' && user?.educationLevel) {
    query.educationLevel = user.educationLevel;
  }
  // 'global' scope has no filter

  const leaderboard = await UserLeaderboard.find(query)
    .populate('userId', 'fullname username email')
    .sort({ totalPoints: -1, quizzesCompleted: -1 })
    .limit(100);

  // Add rank
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    totalPoints: entry.totalPoints,
    quizzesCompleted: entry.quizzesCompleted,
    perfectScores: entry.perfectScores,
  }));

  // Find current user's rank
  let userRank = null;
  if (user) {
    const userEntry = rankedLeaderboard.find(
      (entry: any) => entry.userId._id.toString() === user._id.toString()
    );
    userRank = userEntry ? userEntry.rank : null;
  }

  return res.status(200).json(
    new ApiResponse(200, 'Leaderboard fetched successfully', {
      leaderboard: rankedLeaderboard,
      userRank,
      scope: scope || 'global',
    })
  );
});

// ============================================
// HELPER: Update User Leaderboard
// ============================================
async function updateUserLeaderboard(
  userId: any,
  classId: string,
  educationLevel: string,
  pointsEarned: number,
  isCompleted: boolean,
  isPerfectScore: boolean
) {
  let leaderboard = await UserLeaderboard.findOne({ userId });

  if (!leaderboard) {
    leaderboard = new UserLeaderboard({
      userId,
      classId,
      educationLevel,
      totalPoints: 0,
      quizzesCompleted: 0,
      perfectScores: 0,
    });
  }

  // Update points
  if (pointsEarned > 0) {
    leaderboard.totalPoints += pointsEarned;
  }

  // Update completion count (only count once per quiz)
  if (isCompleted) {
    leaderboard.quizzesCompleted += 1;
  }

  // Update perfect score count
  if (isPerfectScore) {
    leaderboard.perfectScores += 1;
  }

  await leaderboard.save();
}


export { getLeaderboard, getQuizById, getUserQuizProgress, getUserQuizStats, updateUserLeaderboard, submitQuizAttempt}