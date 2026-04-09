"use client";

type RoomJoinPanelProps = {
  room: string;
  username: string;
  onRoomChange: (room: string) => void;
  onJoin: () => void;
};

export default function RoomJoinPanel({
  room,
  username,
  onRoomChange,
  onJoin,
}: RoomJoinPanelProps) {
  return (
    <section className="w-full rounded-3xl border border-cyan-200/80 bg-cyan-50/65 p-6 shadow-[0_18px_50px_-30px_rgba(8,47,73,0.45)] backdrop-blur sm:p-8">
      <h2 className="text-2xl font-black tracking-tight text-slate-900">Join a room</h2>
      <p className="mt-2 text-sm text-slate-700">
        Logged in as <strong>{username}</strong>. Choose a room and start chatting in real-time.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={room}
          onChange={(event) => onRoomChange(event.target.value)}
          placeholder="team-alpha"
          className="flex-1 rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-300 transition focus:ring-4"
        />
        <button
          type="button"
          onClick={onJoin}
          className="rounded-2xl bg-sky-800 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700"
        >
          Enter Room
        </button>
      </div>
    </section>
  );
}
