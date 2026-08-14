/*
 * Purpose: Interactive Workspace for submitted challenges, featuring Kanban, Real-time Chat, Version history, and Team settings.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../services/api';
import {
  Folder,
  Users,
  CheckSquare,
  MessageSquare,
  History,
  Globe,
  ExternalLink,
  Plus,
  Send,
  Upload,
  UserPlus,
  Settings,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';

const GithubIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function WorkspacePage(): JSX.Element {
  const { submissionId } = useParams() as { submissionId: string };
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'members' | 'chat' | 'history'>('overview');

  // Socket state
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Local Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Version form states
  const [versionTitle, setVersionTitle] = useState('');
  const [versionDesc, setVersionDesc] = useState('');
  const [versionGithub, setVersionGithub] = useState('');
  const [versionDemo, setVersionDemo] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);

  // Invite member states
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Team settings states
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('');

  // Fetch Workspace Details
  const { data: workspaceData, isLoading, error } = useQuery({
    queryKey: ['workspace', submissionId],
    queryFn: async () => {
      const res = await api.get(`/api/workspaces/${submissionId}`);
      return res.data.data;
    },
    enabled: !!submissionId
  });

  const submission = workspaceData?.submission;
  const team = workspaceData?.team;
  const tasks = workspaceData?.tasks || [];
  const comments = workspaceData?.comments || [];
  const versions = workspaceData?.versions || [];
  const activities = workspaceData?.activities || [];

  // Setup sockets
  useEffect(() => {
    if (!submissionId) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';
    // Create socket connection to /chat namespace
    const socket = io(`${backendUrl}/chat`, {
      auth: { token: 'mock-session-or-jwt' }, // backend middleware accepts connection
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.emit('join_workspace', submissionId);

    socket.on('user_online', (data: { userId: string }) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, data.userId])));
    });

    socket.on('user_offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    socket.on('new_workspace_comment', (comment: any) => {
      queryClient.setQueryData(['workspace', submissionId], (old: any) => {
        if (!old) return old;
        return { ...old, comments: [comment, ...old.comments] };
      });
    });

    socket.on('new_workspace_activity', (activity: any) => {
      queryClient.setQueryData(['workspace', submissionId], (old: any) => {
        if (!old) return old;
        return { ...old, activities: [activity, ...old.activities] };
      });
    });

    socket.on('user_typing', (data: { userId: string }) => {
      setTypingUsers((prev) => Array.from(new Set([...prev, data.userId])));
    });

    socket.on('user_stopped_typing', (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    return () => {
      socket.emit('leave_workspace', submissionId);
      socket.disconnect();
    };
  }, [submissionId, queryClient]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await api.post(`/api/workspaces/${submissionId}/tasks`, { title });
      return res.data.data;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(['workspace', submissionId], (old: any) => {
        if (!old) return old;
        return { ...old, tasks: [...old.tasks, newTask] };
      });
      setNewTaskTitle('');
      toast.success('Task added');
      socketRef.current?.emit('send_workspace_activity', {
        submissionId,
        activity: { userId: session?.user, action: 'task_created', description: `created task "${newTask.title}"`, createdAt: new Date() }
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await api.put(`/api/workspaces/tasks/${taskId}`, { status });
      return res.data.data;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['workspace', submissionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t: any) => (t._id === updatedTask._id ? updatedTask : t))
        };
      });
      toast.success('Task status updated');
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/api/workspaces/${submissionId}/comments`, { content });
      return res.data.data;
    },
    onSuccess: (newCommentData) => {
      socketRef.current?.emit('send_workspace_comment', { submissionId, comment: newCommentData });
      setNewComment('');
    }
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !team) return;
    setIsInviting(true);
    try {
      await api.post(`/api/teams/${team._id}/invite`, { email: inviteEmail });
      toast.success('Invitation sent to innovator');
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateTeamSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    try {
      await api.put(`/api/teams/${team._id}`, { name: teamName, logo: teamLogo });
      toast.success('Team settings saved');
      queryClient.invalidateQueries({ queryKey: ['workspace', submissionId] });
    } catch (err: any) {
      toast.error('Failed to update team settings');
    }
  };

  const handleReleaseVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionTitle || !versionDesc) {
      toast.error('Title and description are required');
      return;
    }
    setIsUploadingVersion(true);
    try {
      const formData = new FormData();
      formData.append('title', versionTitle);
      formData.append('description', versionDesc);
      formData.append('solutionUrl', versionDemo);
      formData.append('githubUrl', versionGithub);
      formData.append('changeSummary', changeSummary);
      if (versionFile) {
        formData.append('code', versionFile);
      }

      await api.post(`/api/workspaces/${submissionId}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('New version published');
      setVersionTitle('');
      setVersionDesc('');
      setVersionDemo('');
      setVersionGithub('');
      setChangeSummary('');
      setVersionFile(null);
      queryClient.invalidateQueries({ queryKey: ['workspace', submissionId] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish new version');
    } finally {
      setIsUploadingVersion(false);
    }
  };

  // Typing indicator debounce
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current?.emit('workspace_typing_start', submissionId);
    }
    const timer = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.emit('workspace_typing_stop', submissionId);
    }, 1500);
    return () => clearTimeout(timer);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-500">
        Workspace not found or unauthorized access.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 md:px-12 lg:px-24">
      {/* Workspace Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {submission.status}
            </span>
            <span className="text-white/40 text-xs">Submission ID: {submission._id}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {submission.title}
          </h1>
          <p className="text-white/60 text-sm mt-1 max-w-2xl">{submission.description}</p>
        </div>

        {/* Action icons / details */}
        <div className="flex gap-3">
          {submission.githubUrl && (
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 text-sm font-semibold transition"
            >
              <GithubIcon /> Repo
            </a>
          )}
          {submission.solutionUrl && (
            <a
              href={submission.solutionUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2 text-sm font-semibold transition shadow-lg shadow-brand-primary/20"
            >
              <Globe className="h-4 w-4" /> Demo URL <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-white/5 mb-8 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: Folder },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'members', label: 'Team', icon: Users },
          { id: 'chat', label: 'Discussions', icon: MessageSquare },
          { id: 'history', label: 'Versions', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
                <h3 className="text-xl font-bold">Project Details</h3>
                <p className="text-white/80 text-sm leading-relaxed">{submission.description}</p>

                {submission.techStack && submission.techStack.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-white/40 uppercase mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {submission.techStack.map((tech: string) => (
                        <span key={tech} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/70">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Media Attachments */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-sm text-white/70">
                    <FileText className="h-4 w-4 text-brand-primary" /> Pitch Deck & Files
                  </h4>
                  {submission.pdfUrl ? (
                    <div className="space-y-4">
                      <a
                        href={submission.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition"
                      >
                        <span className="text-sm font-semibold truncate">Pitch_Deck.pdf</span>
                        <ExternalLink className="h-4 w-4 text-white/50" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs">No documents uploaded.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-sm text-white/70">
                    <Video className="h-4 w-4 text-brand-primary" /> Presentation Video
                  </h4>
                  {submission.videoUrl ? (
                    <video controls src={submission.videoUrl} className="w-full rounded-xl border border-white/10" />
                  ) : (
                    <p className="text-white/40 text-xs">No video presentation uploaded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Create a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                />
                <button
                  onClick={() => {
                    if (newTaskTitle.trim()) createTaskMutation.mutate(newTaskTitle);
                  }}
                  className="bg-brand-primary hover:bg-brand-primary/95 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Plus className="h-4 w-4" /> Add Task
                </button>
              </div>

              {/* Kanban columns */}
              <div className="grid gap-6 md:grid-cols-3">
                {['todo', 'in-progress', 'done'].map((column) => {
                  const columnTasks = tasks.filter((t: any) => t.status === column);
                  return (
                    <div key={column} className="rounded-2xl border border-white/5 bg-white/5 p-5 min-h-[350px]">
                      <h4 className="font-bold text-sm text-white/60 capitalize mb-4 flex items-center justify-between">
                        <span>{column}</span>
                        <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </h4>

                      <div className="space-y-3">
                        {columnTasks.map((task: any) => (
                          <div
                            key={task._id}
                            className="bg-slate-900 border border-white/5 rounded-xl p-4 shadow space-y-3 hover:border-brand-primary/40 transition"
                          >
                            <h5 className="font-bold text-sm text-white">{task.title}</h5>
                            {task.description && <p className="text-white/60 text-xs">{task.description}</p>}

                            <div className="flex justify-between items-center pt-2">
                              {/* status controls */}
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  updateTaskMutation.mutate({ taskId: task._id, status: e.target.value })
                                }
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none"
                              >
                                <option value="todo">Todo</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          </div>
                        ))}

                        {columnTasks.length === 0 && (
                          <div className="text-center py-8 text-white/30 text-xs border border-dashed border-white/5 rounded-xl">
                            No tasks
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-xl font-bold mb-4">Team Members</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {team?.members ? (
                    team.members.map((member: any) => (
                      <div
                        key={member.userId._id}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl"
                      >
                        <div className="h-10 w-10 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold">
                          {member.userId.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            {member.userId.name}
                            {onlineUsers.includes(member.userId._id) && (
                              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                            )}
                          </h4>
                          <p className="text-xs text-white/40">{member.userId.email}</p>
                        </div>
                        <span className="bg-white/10 text-white/75 text-xs px-2.5 py-0.5 rounded-full capitalize">
                          {member.role}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold">
                        {session?.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{session?.user?.name}</h4>
                        <p className="text-xs text-white/40">{session?.user?.email}</p>
                      </div>
                      <span className="bg-white/10 text-white/75 text-xs px-2.5 py-0.5 rounded-full">Submitter</span>
                    </div>
                  )}
                </div>
              </div>

              {team && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Invite Innovator */}
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-sm text-white/80">
                      <UserPlus className="h-4 w-4 text-brand-primary" /> Invite Members
                    </h3>
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Innovator Email</label>
                        <input
                          type="email"
                          placeholder="innovator@marketplace.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isInviting}
                        className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3 rounded-xl text-sm font-semibold transition"
                      >
                        {isInviting ? 'Inviting...' : 'Send Invitation'}
                      </button>
                    </form>
                  </div>

                  {/* Team Settings */}
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-sm text-white/80">
                      <Settings className="h-4 w-4 text-brand-primary" /> Team Config
                    </h3>
                    <form onSubmit={handleUpdateTeamSettings} className="space-y-4">
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Team Name</label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder={team.name}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Team Logo URL</label>
                        <input
                          type="text"
                          value={teamLogo}
                          onChange={(e) => setTeamLogo(e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl text-sm font-semibold transition"
                      >
                        Save Settings
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur flex flex-col h-[500px]">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-brand-primary" /> Discussion Forum
                </h3>

                {/* Comments Stream */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                  {comments.map((comment: any) => (
                    <div key={comment._id} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1">
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white/90">{comment.userId.name}</span>
                          <span className="text-[10px] text-white/40">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">{comment.content}</p>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs">
                      No posts. Start the conversation!
                    </div>
                  )}
                </div>

                {/* Input forum comment */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Ask a question or comment..."
                    className="flex-1 rounded-xl bg-slate-900 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                  />
                  <button
                    onClick={() => {
                      if (newComment.trim()) createCommentMutation.mutate(newComment);
                    }}
                    className="bg-brand-primary hover:bg-brand-primary/95 text-white p-3.5 rounded-xl transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY / VERSIONS TAB */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Release Version Form */}
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Upload className="h-5 w-5 text-brand-primary" /> Publish New Version
                </h3>
                <form onSubmit={handleReleaseVersion} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs text-white/40 block mb-1">Release Title</label>
                    <input
                      type="text"
                      value={versionTitle}
                      onChange={(e) => setVersionTitle(e.target.value)}
                      placeholder="e.g. Version 2.0 - Dockerizing the application"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-white/40 block mb-1">Change Summary</label>
                    <input
                      type="text"
                      value={changeSummary}
                      onChange={(e) => setChangeSummary(e.target.value)}
                      placeholder="What changed in this update?"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-1">GitHub Repo URL</label>
                    <input
                      type="text"
                      value={versionGithub}
                      onChange={(e) => setVersionGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-1">Demo/Deployment URL</label>
                    <input
                      type="text"
                      value={versionDemo}
                      onChange={(e) => setVersionDemo(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-white/40 block mb-1">Description & Notes</label>
                    <textarea
                      value={versionDesc}
                      onChange={(e) => setVersionDesc(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-white/40 block mb-1">Upload updated files (.zip / .pdf)</label>
                    <input
                      type="file"
                      onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-white/60 file:bg-white/10 file:border-none file:text-white file:rounded-xl file:px-4 file:py-2.5 file:mr-4 file:hover:bg-white/15 file:cursor-pointer"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isUploadingVersion}
                      className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3 rounded-xl text-sm font-semibold transition"
                    >
                      {isUploadingVersion ? 'Uploading & Releasing...' : 'Publish Version'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Version History List */}
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-4">
                <h3 className="text-lg font-bold">Release History</h3>
                <div className="space-y-4">
                  {versions.map((ver: any) => (
                    <div
                      key={ver._id}
                      className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          {ver.title}{' '}
                          <span className="text-[10px] bg-white/10 text-brand-primary rounded-full px-2.5 py-0.5 ml-2 font-medium">
                            v{ver.version}
                          </span>
                        </h4>
                        <p className="text-xs text-white/60 mt-1">{ver.description}</p>
                        <span className="text-[10px] text-white/40 block mt-2">
                          Released on: {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {ver.githubUrl && (
                        <a
                          href={ver.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-brand-primary hover:underline"
                        >
                          <GithubIcon /> Source code
                        </a>
                      )}
                    </div>
                  ))}

                  {versions.length === 0 && (
                    <p className="text-center py-6 text-white/30 text-xs">No previous versions released.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workspace Sidebar Activity Logs */}
        <aside className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur space-y-6 h-fit">
          <div>
            <h3 className="font-bold text-sm text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-primary" /> Workspace Activity
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {activities.map((act: any) => (
                <div key={act._id} className="flex gap-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold text-[10px] text-brand-primary shrink-0">
                    {act.userId.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white/80">
                      <span className="font-bold">{act.userId.name}</span> {act.description}
                    </p>
                    <span className="text-[10px] text-white/30 block mt-0.5">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <p className="text-white/40 text-xs text-center py-4">No activity logged.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
