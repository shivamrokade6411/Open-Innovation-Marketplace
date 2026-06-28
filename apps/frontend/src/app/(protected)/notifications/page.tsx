/*
 * Purpose: Notifications page.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { Card } from '../../../components/ui/Card';

export default function NotificationsPage(): JSX.Element {
  return (
    <main className="space-y-4 px-4 py-12 md:px-8 lg:px-16">
      {[1, 2, 3].map((index) => <Card key={index} variant="glass">New challenge update #{index}</Card>)}
    </main>
  );
}
