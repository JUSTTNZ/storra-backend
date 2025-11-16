import { Request, Response, NextFunction } from 'express';
import { User } from '../Models/user.model.js';
import { QuizProgress } from '../Models/quiz.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all users
    const users = await User.find().select(
      'fullname username email profilePictureUrl currentClassLevel currentClassId educationLevel'
    );

    // Compute total points for each user
    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        const quizProgress = await QuizProgress.find({ userId: user._id }).select(
          'pointsEarned'
        );

        const totalPoints = quizProgress.reduce((sum, qp) => sum + (qp.pointsEarned || 0), 0);

        return {
          userId: user._id,
          fullname: user.fullname,
          email: user.email,
          profilePictureUrl: user.profilePictureUrl,
          currentClassLevel: user.currentClassLevel,
          currentClassId: user.currentClassId,
          educationLevel: user.educationLevel,
          totalPoints,
        };
      })
    );

    // Sort by total points descending
    const sortedLeaderboard = leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add rank
    const rankedLeaderboard = sortedLeaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    // Pagination: support ?page=1&limit=50 (defaults: page=1, limit=50)
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);

    if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
      return next(new ApiError({ statusCode: 400, message: 'Invalid pagination parameters' }));
    }

    const total = rankedLeaderboard.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginated = rankedLeaderboard.slice(startIndex, startIndex + limit);

    return res.status(200).json(
      new ApiResponse(200, 'Leaderboard fetched successfully', {
        leaderboard: paginated,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      })
    );
  } catch (error: any) {
    next(new ApiError({ statusCode: 500, message: error.message }));
  }
};
