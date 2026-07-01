'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { ArrowLeft, MessageSquare, Users, Star, Brain, Clock, CheckCircle2 } from 'lucide-react';

export default function FeedbackFeaturePage() {
  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Expert Mentorship',
      description: 'Get detailed feedback from experienced mentors in your field'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Threaded Discussions',
      description: 'Engage in meaningful discussions with follow-up replies and clarifications'
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: '5-Star Rating System',
      description: 'Clear quality indicators help track improvement across submissions'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Structured Feedback',
      description: 'Receive organized feedback on strengths, improvements, and next steps'
    }
  ];

  const features = [
    {
      title: 'Comprehensive Feedback Form',
      description: 'Mentors can provide structured feedback with ratings, strengths, improvements, and actionable next steps'
    },
    {
      title: 'Real-Time Notifications',
      description: 'Get instant notifications when mentors post feedback on your submissions'
    },
    {
      title: 'Threaded Conversations',
      description: 'Reply to specific feedback points and have focused discussions with mentors'
    },
    {
      title: 'Private & Professional',
      description: 'All feedback is private by default, with options for visibility control'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-cyan-600/20 text-cyan-300 border border-cyan-500/30">
              <MessageSquare className="h-3 w-3 mr-1" />
              COLLABORATION
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Expert Mentor Feedback
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl">
            Receive structured, professional feedback from domain experts to accelerate your learning and improve your submissions
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {benefits.map((benefit, i) => (
            <Card key={i} className="p-6 hover:border-cyan-500/50 transition">
              <div className="text-cyan-400 mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-slate-400 text-sm">{benefit.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="space-y-4">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Feedback Form Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Mentor Feedback Form</h2>
          <Card className="p-8 bg-slate-800/50">
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled
                      className="p-2 text-yellow-400 text-xl"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Comments</label>
                <div className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-slate-500 text-sm h-20">
                  Share your detailed feedback...
                </div>
              </div>

              {/* Strengths, Improvements, Next Steps */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Strengths', placeholder: 'e.g., Clean code structure' },
                  { label: 'Improvements', placeholder: 'e.g., Add error handling' },
                  { label: 'Next Steps', placeholder: 'e.g., Optimize performance' }
                ].map((item) => (
                  <div key={item.label}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{item.label}</label>
                    <div className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-slate-500 text-xs h-16">
                      {item.placeholder}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { label: 'Average Response Time', value: '< 24 hours' },
            { label: 'Expert Mentors', value: '500+' },
            { label: 'Feedback Quality', value: '4.9/5' }
          ].map((metric, i) => (
            <Card key={i} className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {metric.value}
              </div>
              <p className="text-slate-400 text-sm">{metric.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Expert Feedback?</h2>
          <p className="text-slate-400 mb-8">Submit your solution and connect with mentors who will help you grow</p>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3">
            Start Submitting <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}

