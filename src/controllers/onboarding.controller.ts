// controllers/onboarding.controller.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { Class } from '../models/class.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// ============================================
// STEP 1: Update Basic Personalization
// ============================================
export const updatePersonalization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { age, currentClassLevel, preferredLanguage } = req.body;

    // Validate required fields
    if (!age || !currentClassLevel || !preferredLanguage) {
      throw new ApiError({
        statusCode: 400,
        message: 'Age, class level, and preferred language are required',
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        age,
        currentClassLevel,
        preferredLanguage,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError({ statusCode: 404, message: 'User not found' });
    }

    logger.info('User personalization updated', { userId, currentClassLevel });

    return res.status(200).json(
      new ApiResponse(200, 'Personalization updated successfully', {
        user,
        nextStep: 'learning-goals', // Tell frontend what screen is next
      })
    );
  } catch (error: any) {
    logger.error('Update personalization error', { error: error.message });
    next(error);
  }
};

// ============================================
// STEP 2: Update Learning Goals
// ============================================
// controllers/onboarding.controller.ts

export const updateLearningGoals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { goals, learningGoals } = req.body;

    // Accept either "goals" or "learningGoals" from frontend
    const finalGoals = learningGoals || goals;

    // Validate input
    if (!finalGoals || !Array.isArray(finalGoals) || finalGoals.length === 0) {
      throw new ApiError({
        statusCode: 400,
        message: "At least one learning goal is required",
      });
    }

    // Update user in MongoDB
    const user = await User.findByIdAndUpdate(
      userId,
      { learningGoals: finalGoals },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError({ statusCode: 404, message: "User not found" });
    }

    logger.info("✅ User learning goals updated", { userId, goals: finalGoals });

    // Decide next step
    let nextStep = "dashboard";
    let requiresClassSelection = false;

    if (
      user.currentClassLevel === "primary" ||
      user.currentClassLevel === "secondary"
    ) {
      nextStep = "class-selection";
      requiresClassSelection = true;
    } else {
      user.hasCompletedOnboarding = true;
      await user.save();
    }

    return res.status(200).json(
      new ApiResponse(200, "Learning goals updated successfully", {
        user,
        nextStep,
        requiresClassSelection,
      })
    );
  } catch (error: any) {
    logger.error("❌ Update learning goals error", { error: error.message });
    next(error);
  }
};


// ============================================
// STEP 3: Get Available Classes
// ============================================
export const getAvailableClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError({ statusCode: 404, message: 'User not found' });
    }

    let educationLevel: string;
    let classes;

    // Map currentClassLevel to educationLevel
    if (user.currentClassLevel === 'primary') {
      educationLevel = 'primary';
      classes = await Class.find({ educationLevel: 'primary', isActive: true })
        .sort({ order: 1 })
        .select('classId className order');
      // Returns: Primary 1, Primary 2, ..., Primary 6
    } else if (user.currentClassLevel === 'secondary') {
      // Get both JSS and SSS
      classes = await Class.find({
        educationLevel: { $in: ['junior-secondary', 'senior-secondary'] },
        isActive: true,
      })
        .sort({ order: 1 })
        .select('classId className educationLevel order');
      // Returns: JSS 1, JSS 2, JSS 3, SSS 1, SSS 2, SSS 3
    } else {
      // No specific classes for nursery, tertiary, general-studies
      return res.status(200).json(
        new ApiResponse(200, 'No class selection required', {
          requiresClassSelection: false,
        })
      );
    }

    return res.status(200).json(
      new ApiResponse(200, 'Available classes fetched successfully', {
        classes,
        userClassLevel: user.currentClassLevel,
      })
    );
  } catch (error: any) {
    logger.error('Get available classes error', { error: error.message });
    next(error);
  }
};

// ============================================
// STEP 4: Select Specific Class
// ============================================
export const selectClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { classId } = req.body;

    if (!classId) {
      throw new ApiError({ statusCode: 400, message: 'Class ID is required' });
    }

    // Verify class exists
    const classData = await Class.findOne({ classId, isActive: true });
    if (!classData) {
      throw new ApiError({ statusCode: 404, message: 'Class not found' });
    }

    // Update user with selected class
    const user = await User.findByIdAndUpdate(
      userId,
      {
        currentClassId: classId,
        educationLevel: classData.educationLevel,
        hasCompletedOnboarding: true, // Mark onboarding as complete
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError({ statusCode: 404, message: 'User not found' });
    }

    logger.info('User class selected', {
      userId,
      classId,
      educationLevel: classData.educationLevel,
    });

    return res.status(200).json(
      new ApiResponse(200, 'Class selected successfully', {
        user,
        selectedClass: classData,
        nextStep: 'dashboard',
      })
    );
  } catch (error: any) {
    logger.error('Select class error', { error: error.message });
    next(error);
  }
};

// ============================================
// Get User's Courses (Based on Selected Class)
// ============================================
export const getUserCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError({ statusCode: 404, message: 'User not found' });
    }

    // Check if user has completed onboarding
    if (!user.hasCompletedOnboarding) {
      return res.status(200).json(
        new ApiResponse(200, 'Onboarding not completed', {
          requiresOnboarding: true,
          nextStep: determineOnboardingStep(user),
        })
      );
    }

    // Check if user has selected a class
    if (!user.currentClassId) {
      return res.status(200).json(
        new ApiResponse(200, 'No class selected', {
          requiresClassSelection: true,
        })
      );
    }

    // Fetch class with all courses
    const classData = await Class.findOne({
      classId: user.currentClassId,
      isActive: true,
    });

    if (!classData) {
      throw new ApiError({ statusCode: 404, message: 'Class not found' });
    }

    return res.status(200).json(
      new ApiResponse(200, 'User courses fetched successfully', {
        user: {
          id: user._id,
          fullname: user.fullname,
          currentClassLevel: user.currentClassLevel,
          currentClassId: user.currentClassId,
          educationLevel: user.educationLevel,
        },
        class: {
          classId: classData.classId,
          className: classData.className,
          educationLevel: classData.educationLevel,
        },
        courses: classData.courses,
      })
    );
  } catch (error: any) {
    logger.error('Get user courses error', { error: error.message });
    next(error);
  }
};

// ============================================
// Helper: Determine Onboarding Step
// ============================================
const determineOnboardingStep = (user: any) => {
  if (!user.age || !user.currentClassLevel || !user.preferredLanguage) {
    return 'basic-personalization';
  }
  if (!user.learningGoals || !user.learningDaysPerWeek || !user.learningTimePerDay) {
    return 'learning-goals';
  }
  if (
    (user.currentClassLevel === 'primary' || user.currentClassLevel === 'secondary') &&
    !user.currentClassId
  ) {
    return 'class-selection';
  }
  return 'dashboard';
};