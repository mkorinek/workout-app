export default function OfflinePage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <pre className="text-term-amber text-sm mb-4 font-mono">
{`> CONNECTION LOST
> offline mode active`}
        </pre>
        <p className="text-term-gray-light text-xs uppercase tracking-widest">
          your data will sync when you&apos;re back online
        </p>
      </div>
    </div>
  );
}
