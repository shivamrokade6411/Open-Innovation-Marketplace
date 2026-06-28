/*
 * Purpose: Messages page with split chat layout.
 * Author: Copilot
 * Date: 2026-06-28
 */

'use client';

import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { useSocket } from '../../../hooks/useSocket';

const sampleConversations = [
  { id: '1', name: 'Acme Labs', lastMessage: 'We reviewed your idea.', unread: 2, timestamp: '2m ago' },
  { id: '2', name: 'Nova Ventures', lastMessage: 'Please submit the PDF.', unread: 0, timestamp: '1h ago' }
];

export default function MessagesPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const { isConnected } = useSocket(null);

  return (
    <main className="grid min-h-[calc(100vh-5rem)] gap-4 px-4 py-6 md:grid-cols-[320px_1fr] md:px-8 lg:px-16">
      <aside className="space-y-4">
        <Card variant="glass">
          <input className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Card>
        <div className="space-y-3">
          {sampleConversations.map((conversation) => (
            <Card key={conversation.id} variant="glass">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{conversation.name}</div>
                  <div className="text-sm text-slate-500">{conversation.lastMessage}</div>
                </div>
                {conversation.unread > 0 && <span className="rounded-full bg-brand-primary px-2 py-1 text-xs text-white">{conversation.unread}</span>}
              </div>
            </Card>
          ))}
        </div>
      </aside>
      <Card variant="glass" className="flex min-h-[70vh] flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold">Conversation</h1>
            <p className="text-sm text-slate-500">{isConnected ? 'Connected' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 py-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="max-w-lg rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">Hello, we are reviewing your submission.</div>
          <div className="ml-auto max-w-lg rounded-2xl bg-brand-primary/15 p-4 text-right">Thanks, happy to answer questions.</div>
        </div>
        <div className="flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">Attach</button>
          <input className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900" placeholder="Type a message..." />
        </div>
      </Card>
    </main>
  );
}
