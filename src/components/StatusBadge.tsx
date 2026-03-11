import { cn, getStatusColor, getPlatformColor } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  const colors = getStatusColor(status);
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', colors.bg, colors.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {status}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const colors = getPlatformColor(platform);
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', colors.bg, colors.text)}>
      {platform}
    </span>
  );
}

export function CountryBadge({ country }: { country: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-500/10 text-slate-400">
      {country}
    </span>
  );
}

export function NicheBadge({ niche }: { niche: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400">
      {niche}
    </span>
  );
}
