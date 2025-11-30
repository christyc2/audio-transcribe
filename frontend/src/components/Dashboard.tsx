import { useEffect, useState } from 'react';
import {
  fetchProfile,
  fetchUserItems,
  type UserItem,
} from '../api/auth';
import { useAuth } from './AuthProvider';

export const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [items, setItems] = useState<UserItem[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      fetchProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          /* handled by RequireAuth */
        });
    }
  }, [setUser, user]);

  const loadItems = async () => {
    setItemsLoading(true);
    setItemsError(null);
    try {
      const data = await fetchUserItems();
      setItems(data);
    } catch (error) {
      setItemsError(
        error instanceof Error ? error.message : 'Unable to load items.',
      );
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 text-white">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-slate-400">
          {user ? `Signed in as ${user.username}` : 'Fetching profile...'}
        </p>
        {user?.disabled ? (
          <p className="mt-2 text-sm text-amber-300">
            Your account is currently disabled.
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/40">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your items</h2>
          <button
            onClick={loadItems}
            className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
            disabled={itemsLoading}
          >
            {itemsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {itemsError ? (
          <p className="mt-4 text-sm text-red-400">{itemsError}</p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.item_id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <p className="text-lg font-semibold">{item.item_id}</p>
                <p className="text-sm text-slate-400">Owner: {item.owner}</p>
              </li>
            ))}
          </ul>
        )}
        {!itemsError && !itemsLoading && items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No items yet. Trigger any protected API call to see data appear.
          </p>
        ) : null}
      </section>
    </div>
  );
};

