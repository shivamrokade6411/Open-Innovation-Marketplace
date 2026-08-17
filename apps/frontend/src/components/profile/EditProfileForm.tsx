/*
 * Purpose: Edit profile form component.
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

const editProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  bio: z.string().trim().max(280, 'Bio must be at most 280 characters').optional().default(''),
  location: z.string().trim().max(100).optional().default(''),
  avatar: z.string().url().optional().default(''),
  skills: z.array(z.string().trim().min(1).max(40)).max(20),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  user: {
    id: string;
    name: string;
    username: string | null;
    email: string;
    avatar: string | null;
    bio: string | null;
    location: string | null;
    skills: string[];
    githubUrl: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    portfolioUrl: string | null;
  };
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      username: user.username || '',
      bio: user.bio || '',
      location: user.location || '',
      avatar: user.avatar || '',
      skills: user.skills || [],
      githubUrl: user.githubUrl || '',
      linkedinUrl: user.linkedinUrl || '',
      twitterUrl: user.twitterUrl || '',
      portfolioUrl: user.portfolioUrl || '',
    },
  });

  const skills = watch('skills');

  const handleAddSkill = () => {
    if (newSkill.trim() && skills.length < 20) {
      const trimmedSkill = newSkill.trim();
      if (!skills.includes(trimmedSkill)) {
        setValue('skills', [...skills, trimmedSkill]);
        setNewSkill('');
      } else {
        toast.error('This skill is already added');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue('skills', skills.filter((s) => s !== skillToRemove));
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const result = await response.json();
      toast.success('Profile updated successfully!');

      // Redirect to public profile
      router.push(`/profile/${result.data.username}`);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information Section */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 space-y-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Basic Information</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Full Name</label>
          <Input
            {...register('name')}
            placeholder="John Doe"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
          {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Username</label>
          <Input
            {...register('username')}
            placeholder="john-doe"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
          {errors.username && <p className="text-sm text-red-400">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Bio</label>
          <textarea
            {...register('bio')}
            placeholder="Tell us about yourself..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          {errors.bio && <p className="text-sm text-red-400">{errors.bio.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Location</label>
          <Input
            {...register('location')}
            placeholder="Kolhapur, India"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Avatar URL</label>
          <Input
            {...register('avatar')}
            placeholder="https://example.com/avatar.jpg"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Skills Section */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 space-y-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Skills</h2>

        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            placeholder="Add a skill..."
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 flex-1"
          />
          <Button
            type="button"
            onClick={handleAddSkill}
            disabled={!newSkill.trim() || skills.length >= 20}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                <span className="text-sm">{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-purple-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <p className="text-xs text-slate-400">
            {skills.length}/20 skills added
          </p>
        )}
      </div>

      {/* Social Links Section */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 space-y-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Social Links</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">GitHub URL</label>
          <Input
            {...register('githubUrl')}
            placeholder="https://github.com/username"
            type="url"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">LinkedIn URL</label>
          <Input
            {...register('linkedinUrl')}
            placeholder="https://linkedin.com/in/username"
            type="url"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Twitter/X URL</label>
          <Input
            {...register('twitterUrl')}
            placeholder="https://x.com/username"
            type="url"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Portfolio URL</label>
          <Input
            {...register('portfolioUrl')}
            placeholder="https://yourportfolio.com"
            type="url"
            className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
