import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Implementation Marketplace',
  description: 'Configure SurveySparrow and ThriveSparrow implementation services and get a structured estimate.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
