/*
 * Purpose: Certificates page.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { Card } from '../../../components/ui/Card';

export default function CertificatesPage(): JSX.Element {
  return (
    <main className="grid gap-6 px-4 py-12 md:grid-cols-2 md:px-8 lg:px-16">
      {[1, 2, 3].map((index) => (
        <Card key={index} variant="glass">
          <div className="text-sm text-slate-500">Challenge Certificate</div>
          <div className="mt-2 text-2xl font-bold">Winner #{index}</div>
          <div className="mt-4 h-32 rounded-2xl bg-slate-100 dark:bg-slate-900" />
          <div className="mt-4 flex gap-3 text-sm text-brand-primary">
            <button>Download PDF</button>
            <button>Share</button>
          </div>
        </Card>
      ))}
    </main>
  );
}
