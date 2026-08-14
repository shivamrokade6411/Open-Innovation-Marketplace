/*
 * Purpose: PostgreSQL database seeding using Prisma ORM.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { PrismaClient, UserRole, ChallengeStatus, SubmissionStatus, NotificationType, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database...');

  // Clear existing records
  console.log('Clearing existing records...');
  await prisma.userAchievement.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.submissionComment.deleteMany({});
  await prisma.submissionScore.deleteMany({});
  await prisma.submissionVersion.deleteMany({});
  await prisma.submissionFile.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.challengeTimeline.deleteMany({});
  await prisma.challengePrize.deleteMany({});
  await prisma.challengeSkill.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.companyMember.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'OIM Administrator',
      email: 'admin@oim.market',
      passwordHash,
      role: UserRole.ADMIN,
      bio: 'Open Innovation Marketplace Platform Administrator.'
    }
  });

  // 2. Create Companies
  console.log('Creating companies...');
  const acme = await prisma.company.create({
    data: {
      name: 'Acme Technologies',
      slug: 'acme-technologies',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=60',
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1000&auto=format&fit=crop&q=80',
      description: 'Building next-generation enterprise integration middleware and orchestration layers.',
      website: 'https://acme.tech',
      industry: 'Enterprise Software',
      location: 'San Francisco, CA',
      verified: true
    }
  });

  const greenfuture = await prisma.company.create({
    data: {
      name: 'GreenFuture Labs',
      slug: 'greenfuture-labs',
      logo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=128&auto=format&fit=crop&q=60',
      coverImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1000&auto=format&fit=crop&q=80',
      description: 'Pioneering clean energy software, greenhouse gas accounting systems, and grid optimizations.',
      website: 'https://greenfuture.labs',
      industry: 'Cleantech & Energy',
      location: 'Berlin, Germany',
      verified: true
    }
  });

  const nova = await prisma.company.create({
    data: {
      name: 'Nova Systems',
      slug: 'nova-systems',
      logo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=128&auto=format&fit=crop&q=60',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
      description: 'Pioneering low-earth orbit controls, sensor telemetry data modeling, and simulation environments.',
      website: 'https://nova.systems',
      industry: 'Aerospace & Defence',
      location: 'Austin, TX',
      verified: true
    }
  });

  // Create Company Users
  const companyUsers = [];
  for (const comp of [acme, greenfuture, nova]) {
    const compUser = await prisma.user.create({
      data: {
        name: `${comp.name} representative`,
        email: `partner@${comp.slug}.com`,
        passwordHash,
        role: UserRole.COMPANY
      }
    });
    companyUsers.push(compUser);

    await prisma.companyMember.create({
      data: {
        companyId: comp.id,
        userId: compUser.id,
        role: 'OWNER'
      }
    });
  }

  // 3. Create Skills
  console.log('Creating skills...');
  const react = await prisma.skill.create({ data: { name: 'React' } });
  const node = await prisma.skill.create({ data: { name: 'Node.js' } });
  const python = await prisma.skill.create({ data: { name: 'Python' } });
  const tensorflow = await prisma.skill.create({ data: { name: 'TensorFlow' } });
  const postgres = await prisma.skill.create({ data: { name: 'PostgreSQL' } });
  const typescript = await prisma.skill.create({ data: { name: 'TypeScript' } });
  const docker = await prisma.skill.create({ data: { name: 'Docker' } });
  const tailwind = await prisma.skill.create({ data: { name: 'TailwindCSS' } });

  // 4. Create 10 participants
  console.log('Creating participants...');
  const participants = [];
  const participantNames = [
    'Alice Dev', 'Bob Smith', 'Charlie Kim', 'David Lee', 'Emma Watson',
    'Fiona Gallagher', 'George Cooper', 'Hannah Baker', 'Ian Malcolm', 'Julia Roberts'
  ];

  for (let i = 0; i < 10; i++) {
    const pName = participantNames[i];
    const user = await prisma.user.create({
      data: {
        name: pName,
        email: `${pName.toLowerCase().replace(' ', '')}@innovator.net`,
        passwordHash,
        role: UserRole.PARTICIPANT,
        bio: `Full-stack engineer and open innovator specializing in resolving complex technical challenges.`,
        location: 'Remote',
        githubUrl: `https://github.com/${pName.toLowerCase().replace(' ', '')}`,
        linkedinUrl: `https://linkedin.com/in/${pName.toLowerCase().replace(' ', '')}`
      }
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        bio: user.bio,
        skills: [typescript.name, react.name, node.name].slice(0, 1 + (i % 3)),
        portfolioLinks: [user.githubUrl || '']
      }
    });

    participants.push(user);
  }

  // 5. Create 10 challenges
  console.log('Creating challenges...');
  const challenges = [];
  const challengeDefinitions = [
    {
      title: 'AI-Powered Sustainability Scoring',
      slug: 'ai-powered-sustainability-scoring',
      shortDescription: 'Calculate, verify, and visualize carbon emission indicators using AI agents.',
      company: greenfuture,
      skills: [python, tensorflow, postgres],
      prizePool: 25000,
      prizes: [15000, 7000, 3000]
    },
    {
      title: 'Smart Waste Management Optimization',
      slug: 'smart-waste-management-optimization',
      shortDescription: 'Optimize garbage collection routes using real-time telemetry sensors.',
      company: greenfuture,
      skills: [node, postgres, docker],
      prizePool: 18000,
      prizes: [10000, 5000, 3000]
    },
    {
      title: 'AI Healthcare Diagnostics Assistant',
      slug: 'ai-healthcare-diagnostics-assistant',
      shortDescription: 'Analyze medical scans and generate reports using image segmentation.',
      company: acme,
      skills: [python, tensorflow, react],
      prizePool: 30000,
      prizes: [20000, 7000, 3000]
    },
    {
      title: 'Climate Risk Simulation Sandbox',
      slug: 'climate-risk-simulation-sandbox',
      shortDescription: 'Predict sea-level rises and risk distributions for global shorelines.',
      company: greenfuture,
      skills: [python, postgres, typescript],
      prizePool: 22000,
      prizes: [12000, 7000, 3000]
    },
    {
      title: 'EV Charging Grid Optimization',
      slug: 'ev-charging-grid-optimization',
      shortDescription: 'Balance peak utility load across residential EV vehicle charging blocks.',
      company: greenfuture,
      skills: [python, node, docker],
      prizePool: 15000,
      prizes: [9000, 4000, 2000]
    },
    {
      title: 'Zero-Trust Secure File Escrow',
      slug: 'zero-trust-secure-file-escrow',
      shortDescription: 'Build a decentralized cryptographic platform for sensitive digital handovers.',
      company: acme,
      skills: [typescript, react, postgres],
      prizePool: 20000,
      prizes: [12000, 5000, 3000]
    },
    {
      title: 'Autonomous Satellite Telemetry Monitor',
      slug: 'autonomous-satellite-telemetry-monitor',
      shortDescription: 'Aggregate sensor matrices and signal logs for low-orbit communication arrays.',
      company: nova,
      skills: [python, tensorflow, docker],
      prizePool: 35000,
      prizes: [20000, 10000, 5000]
    },
    {
      title: 'Modular Docking Simulation Engine',
      slug: 'modular-docking-simulation-engine',
      shortDescription: 'Create interactive 3D simulators modeling docking mechanics.',
      company: nova,
      skills: [typescript, react, tailwind],
      prizePool: 12000,
      prizes: [7000, 3500, 1500]
    },
    {
      title: 'Scalable Microservices Gateway API',
      slug: 'scalable-microservices-gateway-api',
      shortDescription: 'Architect a high-performance routing reverse-proxy handling thousands of parallel connections.',
      company: acme,
      skills: [node, docker, postgres],
      prizePool: 16000,
      prizes: [10000, 4000, 2000]
    },
    {
      title: 'Smart Home Energy Dashboard',
      slug: 'smart-home-energy-dashboard',
      shortDescription: 'A premium visual hub illustrating household appliance power telemetry.',
      company: greenfuture,
      skills: [typescript, react, tailwind],
      prizePool: 10000,
      prizes: [6000, 3000, 1000]
    }
  ];

  for (let i = 0; i < 10; i++) {
    const def = challengeDefinitions[i];
    const isCompleted = i > 7; // 2 completed, 8 open

    const regDeadline = new Date();
    regDeadline.setDate(regDeadline.getDate() + (isCompleted ? -15 : 10));

    const subDeadline = new Date();
    subDeadline.setDate(subDeadline.getDate() + (isCompleted ? -10 : 20));

    const judDeadline = new Date();
    judDeadline.setDate(judDeadline.getDate() + (isCompleted ? -5 : 25));

    const announcement = new Date();
    announcement.setDate(announcement.getDate() + (isCompleted ? -2 : 30));

    const challenge = await prisma.challenge.create({
      data: {
        title: def.title,
        slug: def.slug,
        shortDescription: def.shortDescription,
        description: `This is a comprehensive hackathon challenge regarding ${def.title}. Solve the real-world problems and help organizations deploy production ready tools.`,
        problemStatement: `Organizations lack scalable infrastructure to support ${def.title.toLowerCase()}. Innovators should architect decoupled schemas addressing this.`,
        expectedSolution: `A repository containing structural models, a deployed demo, and an evaluation report outlining performance characteristics.`,
        companyId: def.company.id,
        industry: def.company.industry,
        status: isCompleted ? ChallengeStatus.COMPLETED : ChallengeStatus.OPEN,
        prizePool: def.prizePool,
        maxTeamSize: 4,
        registrationDeadline: regDeadline,
        submissionDeadline: subDeadline,
        judgingDeadline: judDeadline,
        winnerAnnouncement: announcement,
        eligibility: 'Open globally to participants aged 18 or older. Individuals and teams of up to 4 members are eligible to register.',
        submissionGuidelines: 'Submit a clean GitHub repository containing code and types, along with a live hosted demo URL and a 2-minute walkthrough video.',
        judgingCriteria: 'Innovations are scored on technical feasibility (25%), architectural quality (25%), environmental/business impact (25%), design presentation (15%), and code correctness (10%).',
        publishedAt: new Date()
      }
    });

    challenges.push(challenge);

    // Link skills
    for (const skill of def.skills) {
      await prisma.challengeSkill.create({
        data: {
          challengeId: challenge.id,
          skillId: skill.id
        }
      });
    }

    // Link Prizes
    for (let placeIdx = 0; placeIdx < def.prizes.length; placeIdx++) {
      await prisma.challengePrize.create({
        data: {
          challengeId: challenge.id,
          place: placeIdx + 1,
          amount: def.prizes[placeIdx],
          description: placeIdx === 0 ? 'Grand Prize Winner' : placeIdx === 1 ? 'Runner Up' : 'Third Place Special'
        }
      });
    }

    // Link Timelines
    await prisma.challengeTimeline.create({
      data: {
        challengeId: challenge.id,
        title: 'Registration Opens',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Sign up and create your team.'
      }
    });
    await prisma.challengeTimeline.create({
      data: {
        challengeId: challenge.id,
        title: 'Submission Closes',
        date: subDeadline,
        description: 'Commit your final repositories.'
      }
    });
  }

  // 6. Create 3 Teams
  console.log('Creating teams...');
  const teams = [];
  for (let i = 0; i < 3; i++) {
    const leader = participants[i * 2];
    const member = participants[i * 2 + 1];
    const challenge = challenges[0]; // Seed teams for the first challenge

    const team = await prisma.team.create({
      data: {
        name: `Team Delta ${i + 1}`,
        challengeId: challenge.id,
        inviteCode: `INV-DELTA-${i + 1}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        maxMembers: 4
      }
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: leader.id,
        role: 'LEADER'
      }
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: member.id,
        role: 'MEMBER'
      }
    });

    teams.push(team);
  }

  // 7. Create 15 submissions
  console.log('Creating submissions...');
  const submissions = [];
  for (let i = 0; i < 15; i++) {
    const challenge = challenges[i % challenges.length];
    const participant = participants[i % participants.length];
    const team = i < 3 ? teams[i] : null;

    const sub = await prisma.submission.create({
      data: {
        challengeId: challenge.id,
        userId: participant.id,
        teamId: team?.id || null,
        title: `AI solution prototype v${i + 1} for ${challenge.title}`,
        description: `This project implements modular, highly available telemetry aggregation algorithms tailored to the ${challenge.title} challenge specification. Built with standard models.`,
        solutionUrl: 'https://oim-prototype.vercel.app',
        githubUrl: 'https://github.com/innovator/oim-prototype',
        videoUrl: 'https://youtube.com/watch?v=sample-walkthrough',
        pdfUrl: 'https://oim-prototype.vercel.app/pitch.pdf',
        techStack: ['Python', 'React', 'Docker'].slice(0, 1 + (i % 3)),
        status: i === 0 ? SubmissionStatus.WINNER : i === 1 ? SubmissionStatus.SHORTLISTED : SubmissionStatus.SUBMITTED,
        score: i === 0 ? 94.5 : i === 1 ? 88.0 : 75.0,
        aiScore: i === 0 ? 91.0 : i === 1 ? 84.5 : 72.0,
        aiFeedback: 'Architectural patterns are clean and adhere to standard design guidelines. Resource footprint is within bounds.'
      }
    });

    submissions.push(sub);

    // Create file records
    await prisma.submissionFile.create({
      data: {
        submissionId: sub.id,
        fileUrl: 'https://github.com/innovator/oim-prototype/archive/refs/heads/main.zip',
        fileName: 'source-code.zip',
        fileSize: 1024 * 512
      }
    });

    // Create version
    await prisma.submissionVersion.create({
      data: {
        submissionId: sub.id,
        version: 1,
        description: 'Initial Prototype MVP release'
      }
    });
  }

  // 8. Create 10 Notifications
  console.log('Creating notifications...');
  for (let i = 0; i < 10; i++) {
    const user = participants[i % participants.length];
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.CHALLENGE,
        title: `New Challenge Published`,
        body: `A new innovation challenge "${challenges[i % challenges.length].title}" has been published. Register your team today!`,
        priority: Priority.MEDIUM,
        isRead: i > 7
      }
    });
  }

  // 9. Create 5 Achievements
  console.log('Creating achievements...');
  const achievements = [];
  const achDefs = [
    { title: 'First Solver', description: 'Submitted a solution prototype to any open challenge.' },
    { title: 'Grand Prize Winner', description: 'Awarded first place in an enterprise innovation challenge.' },
    { title: 'Team Coordinator', description: 'Created a collaborative team with multiple active members.' },
    { title: 'Green Scorer', description: 'Analyzed carbon telemetry utilizing the sustainability score module.' },
    { title: 'Continuous Learner', description: 'Competed in at least three hackathons on the platform.' }
  ];

  for (const ach of achDefs) {
    const achievement = await prisma.achievement.create({
      data: {
        title: ach.title,
        description: ach.description
      }
    });
    achievements.push(achievement);
  }

  // Award achievements to users
  for (let i = 0; i < 5; i++) {
    await prisma.userAchievement.create({
      data: {
        userId: participants[i].id,
        achievementId: achievements[i].id
      }
    });
  }

  console.log('PostgreSQL database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
