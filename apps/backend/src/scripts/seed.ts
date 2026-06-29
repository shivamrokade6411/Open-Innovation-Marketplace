/*
 * Purpose: Database seeding script for sample development data.
 * Author: Antigravity
 * Date: 2026-06-29
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { User } from '../models/User.model';
import { Company } from '../models/Company.model';
import { Challenge } from '../models/Challenge.model';
import { Submission } from '../models/Submission.model';
import { connectDatabase } from '../config/database';

const companiesData = [
  {
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    passwordHash: 'Company@123',
    role: 'company' as const,
    companyName: 'TechCorp Solutions',
    industry: 'Enterprise Software',
    size: 'enterprise' as const,
    location: 'San Francisco, CA'
  },
  {
    name: 'EcoSphere Tech',
    email: 'hello@ecosphere.dev',
    passwordHash: 'Company@123',
    role: 'company' as const,
    companyName: 'EcoSphere Tech',
    industry: 'Cleantech',
    size: 'medium' as const,
    location: 'Berlin, Germany'
  }
];

const innovatorsData = [
  { name: 'Alice Dev', email: 'alice@innovate.dev', passwordHash: 'Innovator@123', skills: ['React', 'TypeScript', 'Node.js', 'Next.js'] },
  { name: 'Bob Smith', email: 'bob@innovate.dev', passwordHash: 'Innovator@123', skills: ['Python', 'TensorFlow', 'PyTorch', 'FastAPI'] },
  { name: 'Charlie Kim', email: 'charlie@innovate.dev', passwordHash: 'Innovator@123', skills: ['Solidity', 'Go', 'Rust', 'Web3.js'] },
  { name: 'David Lee', email: 'david@innovate.dev', passwordHash: 'Innovator@123', skills: ['Flutter', 'Swift', 'Kotlin', 'Firebase'] },
  { name: 'Emma Watson', email: 'emma@innovate.dev', passwordHash: 'Innovator@123', skills: ['UI/UX', 'Figma', 'CSS', 'Tailwind'] }
];

async function seed() {
  try {
    console.log('Connecting to database for seeding...');
    await connectDatabase();

    // 1. Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Company.deleteMany({});
    await Challenge.deleteMany({});
    await Submission.deleteMany({});

    // 2. Create Admin User
    console.log('Seeding admin user...');
    await User.create({
      name: 'OIM Admin',
      email: 'admin@oim.dev',
      passwordHash: 'Admin@123',
      role: 'admin',
      isVerified: true,
      isActive: true,
      skills: ['Security', 'Management']
    });

    // 3. Create Companies (User + Company profile)
    console.log('Seeding companies...');
    const seededCompanies = [];
    for (const c of companiesData) {
      const user = await User.create({
        name: c.name,
        email: c.email,
        passwordHash: c.passwordHash,
        role: c.role,
        isVerified: true,
        isActive: true,
        skills: []
      });

      const companyProfile = await Company.create({
        userId: user._id.toString(),
        companyName: c.companyName,
        industry: c.industry,
        size: c.size,
        location: c.location,
        verificationStatus: 'verified',
        totalChallenges: 0,
        totalHires: 0,
        rating: 4.8,
        socialLinks: {}
      });
      seededCompanies.push(companyProfile);
    }

    // 4. Create Innovators
    console.log('Seeding innovators...');
    const seededInnovators = [];
    for (const inn of innovatorsData) {
      const user = await User.create({
        name: inn.name,
        email: inn.email,
        passwordHash: inn.passwordHash,
        role: 'innovator',
        isVerified: true,
        isActive: true,
        skills: inn.skills
      });
      seededInnovators.push(user);
    }

    // 5. Create 10 challenges (mix of active and completed)
    console.log('Seeding challenges...');
    const challenges = [];
    const techStacks = [
      ['React', 'Node.js', 'MongoDB'],
      ['Python', 'TensorFlow', 'Docker'],
      ['Solidity', 'Ethereum', 'Next.js'],
      ['Flutter', 'Firebase', 'Dart'],
      ['Next.js', 'TailwindCSS', 'TypeScript'],
      ['Kubernetes', 'AWS', 'Terraform'],
      ['Rust', 'Wasm', 'Web3'],
      ['Figma', 'HTML', 'Tailwind'],
      ['FastAPI', 'PostgreSQL', 'Redis'],
      ['Node.js', 'Express', 'Socket.io']
    ];

    const categories = ['web', 'ai', 'blockchain', 'mobile', 'web', 'cloud', 'blockchain', 'design', 'other', 'web'] as const;

    for (let i = 1; i <= 10; i++) {
      const company = seededCompanies[i % seededCompanies.length];
      const isCompleted = i > 7; // 3 completed challenges, 7 active
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (isCompleted ? 30 : 5));

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (isCompleted ? -10 : 25));

      const challenge = await Challenge.create({
        companyId: company._id.toString(),
        title: `Challenge ${i}: ${isCompleted ? 'Historical' : 'Innovative'} Project`,
        description: `This is a comprehensive description for challenge ${i}. Candidates should build a fully functional prototype resolving issue ${i}.`,
        problemStatement: `Design a system to streamline process ${i} with modern tooling and high availability.`,
        techStack: techStacks[i - 1],
        category: categories[i - 1],
        difficulty: (i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy') as any,
        prizes: {
          first: 5000 * i,
          second: 2000 * i,
          third: 1000 * i,
          total: 8000 * i
        },
        startDate,
        deadline,
        status: isCompleted ? 'completed' : 'active',
        tags: [categories[i - 1].toUpperCase(), 'INNOVATION'],
        requirements: ['GitHub repository', 'Deployed URL', 'Short demo video'],
        maxParticipants: 50 + (i * 10),
        currentParticipants: 5 + i,
        views: 100 * i,
        isRemote: i % 2 === 0,
        attachments: [],
        aiSummary: `Build an advanced solution for ${categories[i - 1]} using ${techStacks[i - 1].join(', ')}.`
      });
      challenges.push(challenge);
      
      // Update company challenge count
      await Company.findByIdAndUpdate(company._id, { $inc: { totalChallenges: 1 } });
    }

    // 6. Create sample submissions
    console.log('Seeding submissions...');
    for (let i = 0; i < 5; i++) {
      const challenge = challenges[i];
      const innovator = seededInnovators[i % seededInnovators.length];

      await Submission.create({
        challengeId: challenge._id.toString(),
        userId: innovator._id.toString(),
        title: `Solution for ${challenge.title} by ${innovator.name}`,
        description: `This submission implements a scalable and decoupled architecture to address all requirements of the challenge. Built with clean code practices.`,
        solutionUrl: 'https://oim-sample-solution.vercel.app',
        githubUrl: 'https://github.com/sample/oim-solution',
        videoUrl: 'https://youtube.com/watch?v=sample',
        pdfUrl: 'https://oim-sample.pdf',
        files: [],
        techStack: challenge.techStack,
        status: i === 0 ? 'winner' : i === 1 ? 'shortlisted' : 'submitted',
        score: i === 0 ? 95 : i === 1 ? 88 : 75,
        aiScore: i === 0 ? 92 : i === 1 ? 85 : 70,
        aiFeedback: {
          summary: 'The code quality is excellent and adheres to safety policies. Decoupled services are robust.',
          codeQuality: i === 0 ? 9 : 8,
          innovation: i === 0 ? 10 : 8,
          plagiarismScore: 5,
          strengths: ['Highly optimized algorithm', 'Clean component separation'],
          weaknesses: ['Minimal unit test coverage'],
          suggestions: ['Add integrations tests for socket channels']
        },
        reviewNotes: i === 0 ? 'Outstanding work!' : undefined,
        rank: i === 0 ? 1 : i === 1 ? 2 : undefined
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

void seed();
