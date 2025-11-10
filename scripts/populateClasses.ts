// scripts/populateClasses.ts
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Class } from '../src/models/class.model'; // Adjust path to your models

// Database connection
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/storra';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Populate all classes from JSON files
const populateAllClasses = async () => {
  try {
    console.log('🌱 Starting database population...\n');

    // Directory where your JSON files are stored
    const jsonDir = path.join(__dirname, '../json');

    // All class JSON files in the correct order
    const classFiles = [
      // Primary School (6 classes)
      { file: 'primary-1.json', order: 1 },
      { file: 'primary-2.json', order: 2 },
      { file: 'primary-3.json', order: 3 },
      { file: 'primary-4.json', order: 4 },
      { file: 'primary-5.json', order: 5 },
      { file: 'primary-6.json', order: 6 },
      
      // Junior Secondary (3 classes)
      { file: 'jss1.json', order: 7 },
      { file: 'jss2.json', order: 8 },
      { file: 'jss3.json', order: 9 },
      
      // Senior Secondary (3 classes)
      { file: 'sss1.json', order: 10 },
      { file: 'sss2.json', order: 11 },
      { file: 'sss3.json', order: 12 },
    ];

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const { file, order } of classFiles) {
      try {
        const filePath = path.join(jsonDir, file);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${file}`);
          errorCount++;
          results.push({ file, status: 'not_found' });
          continue;
        }

        // Read and parse JSON file
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const classData = JSON.parse(fileContent);

        // Add order field for sorting
        classData.order = order;

        // Check if class already exists
        const existingClass = await Class.findOne({ classId: classData.classId });

        if (existingClass) {
          // Update existing class
          await Class.findOneAndUpdate(
            { classId: classData.classId },
            { ...classData, isActive: true, order },
            { new: true }
          );
          console.log(`✅ Updated: ${classData.className} (${classData.courses.length} courses)`);
          results.push({ file, status: 'updated', className: classData.className });
        } else {
          // Create new class
          await Class.create({ ...classData, isActive: true, order });
          console.log(`✅ Created: ${classData.className} (${classData.courses.length} courses)`);
          results.push({ file, status: 'created', className: classData.className });
        }

        successCount++;

      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error processing ${file}:`, error.message);
        results.push({ file, status: 'error', error: error.message });
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 POPULATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Total files: ${classFiles.length}\n`);

    // Display statistics
    const stats = await Class.aggregate([
      {
        $group: {
          _id: '$educationLevel',
          count: { $sum: 1 },
          totalCourses: { $sum: { $size: '$courses' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('📈 DATABASE STATISTICS:');
    stats.forEach(stat => {
      const level = stat._id
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      console.log(`  ${level}: ${stat.count} classes, ${stat.totalCourses} total courses`);
    });

    // List all classes in order
    console.log('\n📚 ALL CLASSES (in order):');
    const allClasses = await Class.find().sort({ order: 1 }).select('className classId courses');
    allClasses.forEach((cls, index) => {
      console.log(`  ${index + 1}. ${cls.className} (${cls.classId}) - ${cls.courses.length} courses`);
    });

    return { success: true, successCount, errorCount, results };

  } catch (error: any) {
    console.error('❌ Fatal error during population:', error);
    throw error;
  }
};

// Clear all classes (optional - use with caution!)
const clearAllClasses = async () => {
  try {
    console.log('🗑️  Clearing all classes from database...');
    const result = await Class.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} classes\n`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error clearing classes:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');

    // Clear existing data if --clear flag is passed
    if (shouldClear) {
      await clearAllClasses();
    }

    // Populate all classes
    const result = await populateAllClasses();

    console.log('\n✨ Population completed successfully!');
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
    process.exit(0);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
main();

// ============================================
// USAGE INSTRUCTIONS:
// ============================================
/*
1. Create a folder structure like this:
   project-root/
   ├── data/
   │   └── classes/
   │       ├── primary-1.json
   │       ├── primary-2.json
   │       ├── jss-1.json
   │       └── ... (all other class JSON files)
   ├── scripts/
   │   └── populateClasses.ts (this file)
   └── models/
       └── index.ts (your models)

2. Add to package.json scripts:
   "scripts": {
     "populate": "ts-node scripts/populateClasses.ts",
     "populate:clear": "ts-node scripts/populateClasses.ts --clear"
   }

3. Run the script:
   npm run populate              // Populate or update classes
   npm run populate:clear        // Clear all then populate

4. The script will:
   ✅ Read all JSON files in order
   ✅ Create or update classes in MongoDB
   ✅ Maintain the correct order (Primary 1-6, JSS 1-3, SSS 1-3)
   ✅ Show detailed progress and statistics
   ✅ Handle errors gracefully
*/