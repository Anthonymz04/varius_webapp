import Skeleton from '@/app/components/Skeleton';

export default function Loading() {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }} aria-hidden>
      <Skeleton width={90} height={12} style={{ marginBottom: 18 }} />
      <Skeleton width="55%" height={30} style={{ marginBottom: 14 }} />
      <Skeleton width="75%" height={14} style={{ marginBottom: 36 }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 18,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: 18,
              background: '#fff',
            }}
          >
            <Skeleton width={46} height={46} radius="50%" style={{ marginBottom: 12 }} />
            <Skeleton width="70%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="45%" height={11} style={{ marginBottom: 12 }} />
            <Skeleton width="90%" height={11} />
          </div>
        ))}
      </div>
    </div>
  );
}
