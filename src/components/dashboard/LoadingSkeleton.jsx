export default function LoadingSkeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-[2rem] bg-slate-200 ${className}`} />;
}
