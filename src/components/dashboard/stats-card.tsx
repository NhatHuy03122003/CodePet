// TODO: Implement stats card component

export default function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
