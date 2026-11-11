import * as L from 'lucide-react';

const MAP: Record<string, L.LucideIcon> = {
  ClipboardList: L.ClipboardList, GitBranch: L.GitBranch, Palette: L.Palette, DatabaseZap: L.DatabaseZap, Users: L.Users, Variable: L.Variable,
  Workflow: L.Workflow, Send: L.Send, BellRing: L.BellRing, Plug: L.Plug, Code2: L.Code2, Webhook: L.Webhook, Cloud: L.Cloud, Share2: L.Share2,
  Building2: L.Building2, ShoppingBag: L.ShoppingBag, Puzzle: L.Puzzle, LayoutDashboard: L.LayoutDashboard, BrainCircuit: L.BrainCircuit,
  LineChart: L.LineChart, FileDown: L.FileDown, ShieldCheck: L.ShieldCheck, KeyRound: L.KeyRound, Globe: L.Globe, Mail: L.Mail, Code: L.Code,
  ServerCog: L.ServerCog, CheckCircle2: L.CheckCircle2, GraduationCap: L.GraduationCap, Presentation: L.Presentation, BookOpen: L.BookOpen,
  Rocket: L.Rocket, LifeBuoy: L.LifeBuoy, HeartPulse: L.HeartPulse, Target: L.Target, TrendingUp: L.TrendingUp, Orbit: L.Orbit,
  MessagesSquare: L.MessagesSquare, Award: L.Award, MessageSquareHeart: L.MessageSquareHeart, Layers: L.Layers, Building: L.Building,
  Contact: L.Contact, Network: L.Network, CalendarDays: L.CalendarDays, MessageCircle: L.MessageCircle, BarChart3: L.BarChart3,
  MessageSquareText: L.MessageSquareText, Sprout: L.Sprout, Package: L.Package,
};
export function Icon({ name, className }: { name?: string | null; className?: string }) {
  const C = (name && MAP[name]) || L.Package;
  return <C className={className} />;
}
