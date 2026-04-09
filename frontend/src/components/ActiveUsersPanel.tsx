type ActiveUsersPanelProps = {
  users: string[];
};

export default function ActiveUsersPanel({ users }: ActiveUsersPanelProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
        Active Users
      </h3>
      {users.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Nobody online yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {users.map((user) => (
            <li
              key={user}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              {user}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
