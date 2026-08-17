/*
 * Purpose: Skills list component displaying user skills as badges.
 * Author: GitHub Copilot
 * Date: 2026-08-17
 */

interface SkillsListProps {
  skills: string[];
}

export function SkillsList({ skills }: SkillsListProps) {
  if (!skills || skills.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
        <p className="text-sm text-slate-400 italic">No skills added yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
