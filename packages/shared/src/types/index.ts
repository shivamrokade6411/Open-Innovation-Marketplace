/*
 * Purpose: Shared TypeScript contracts for the Open Innovation Marketplace monorepo.
 * Author: Copilot
 * Date: 2026-06-28
 */

export type UserRole = 'admin' | 'company' | 'innovator';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ChallengeStatus = 'draft' | 'active' | 'review' | 'completed' | 'cancelled';
export type SubmissionStatus = 'submitted' | 'underReview' | 'shortlisted' | 'winner' | 'rejected';
export type NotificationType = 'challenge' | 'submission' | 'message' | 'payment' | 'system' | 'achievement';
export type Priority = 'low' | 'medium' | 'high';
export type MessageType = 'text' | 'file' | 'image' | 'system';
export type TeamStatus = 'draft' | 'active' | 'locked' | 'disbanded';
export type CertificateType = 'winner' | 'participant' | 'finalist';
export type PaymentType = 'subscription' | 'prize' | 'withdrawal';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentGateway = 'razorpay' | 'stripe';
export type CompanyVerificationStatus = 'pending' | 'verified' | 'rejected';
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type ChallengeCategory = 'ai' | 'web' | 'mobile' | 'blockchain' | 'cloud' | 'iot' | 'design' | 'other';

export interface IAPIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  meta: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    nextCursor?: string | null;
  };
}

export interface IJWTPayload {
  userId: string;
  role: UserRole;
  email: string;
  tokenVersion?: number;
  type?: 'access' | 'refresh' | 'reset' | 'verify';
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  portfolioUrl?: string;
  innovationScore: number;
  isVerified: boolean;
  isActive: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompany {
  _id: string;
  userId: string;
  companyName: string;
  logo?: string;
  description?: string;
  industry?: string;
  website?: string;
  size?: CompanySize;
  location?: string;
  verificationStatus: CompanyVerificationStatus;
  totalChallenges: number;
  totalHires: number;
  rating: number;
  subscriptionPlan?: string;
  subscriptionExpiry?: Date;
  socialLinks: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChallengePrizes {
  first?: number;
  second?: number;
  third?: number;
  total?: number;
}

export interface IChallenge {
  _id: string;
  companyId: string;
  title: string;
  description: string;
  problemStatement: string;
  techStack: string[];
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  prizes: IChallengePrizes;
  deadline: Date;
  startDate: Date;
  status: ChallengeStatus;
  tags: string[];
  requirements: string[];
  maxParticipants: number;
  currentParticipants: number;
  views: number;
  isRemote: boolean;
  attachments: string[];
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmissionAIFeedback {
  summary: string;
  codeQuality: number;
  innovation: number;
  plagiarismScore: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

export interface ISubmission {
  _id: string;
  challengeId: string;
  userId: string;
  title: string;
  description: string;
  solutionUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  files: string[];
  techStack: string[];
  status: SubmissionStatus;
  score: number;
  aiScore: number;
  aiFeedback: ISubmissionAIFeedback;
  reviewNotes?: string;
  rank?: number;
  certificateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

export interface IConversation {
  _id: string;
  participants: string[];
  lastMessage?: string;
  lastActivity: Date;
  unreadCounts: Record<string, number>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  priority: Priority;
  createdAt: Date;
}

export interface ITeamMember {
  userId: string;
  role: string;
  joinedAt: Date;
}

export interface ITeam {
  _id: string;
  name: string;
  challengeId: string;
  leaderId: string;
  members: ITeamMember[];
  inviteCode: string;
  maxMembers: number;
  status: TeamStatus;
  submissionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertificate {
  _id: string;
  userId: string;
  challengeId: string;
  submissionId: string;
  certificateNumber: string;
  type: CertificateType;
  issueDate: Date;
  qrCode: string;
  verificationUrl: string;
  metadata: Record<string, unknown>;
  isRevoked: boolean;
  createdAt: Date;
}

export interface IPayment {
  _id: string;
  userId: string;
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface IChallengeFilters {
  category?: ChallengeCategory;
  difficulty?: ChallengeDifficulty;
  status?: ChallengeStatus;
  prizeMin?: number;
  prizeMax?: number;
  deadlineBefore?: string;
  techStack?: string[];
  remoteOnly?: boolean;
  search?: string;
  sortBy?: 'newest' | 'prize' | 'deadline' | 'popularity';
}

export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  innovationScore: number;
  wins: number;
  submissions: number;
  category?: string;
}

export interface IAnalyticsDashboard {
  totalUsers: number;
  totalCompanies: number;
  totalChallenges: number;
  totalSubmissions: number;
  revenue: number;
  growthRate: number;
}

export interface IChallengeAnalytics {
  challengeId: string;
  submissionTrend: Array<{ date: string; count: number }>;
  scoreDistribution: Array<{ bucket: string; count: number }>;
  participantDemographics: Record<string, number>;
}

export interface ISubmissionJobResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: Record<string, unknown>;
}
