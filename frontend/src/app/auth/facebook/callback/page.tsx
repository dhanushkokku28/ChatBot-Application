"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { storeSession } from "@/lib/auth";

function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const token = useMemo(
    () =>
      searchParams.get("access_token") ||
      searchParams.get("jwt") ||
      searchParams.get("token") ||
      "",
    [searchParams]
  );

  useEffect(() => {
    let isMounted = true;

    async function finalizeLogin() {
      const providerError = searchParams.get("error") || searchParams.get("error_description");
      if (providerError) {
        if (isMounted) {
          setError("Facebook login was cancelled or failed. Please try again.");
        }
        return;
      }

      if (!token) {
        if (isMounted) {
          setError("Facebook login did not return a valid token.");
        }
        return;
      }

      try {
        const user = await getCurrentUser(token);
        storeSession({ jwt: token, user });
        router.replace("/");
      } catch {
        if (isMounted) {
          setError("Unable to finish Facebook login. Please try again.");
        }
      }
    }

    finalizeLogin();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_60px_-30px_rgba(2,6,23,0.35)]">
        <h1 className="text-xl font-black text-slate-900">Signing you in...</h1>
        <p className="mt-3 text-sm text-slate-600">
          Finalizing Facebook authentication with Saral Chat.
        </p>
        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="mt-6 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Back to home
        </button>
      </section>
    </main>
  );
}

export default function FacebookCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_60px_-30px_rgba(2,6,23,0.35)]">
            <h1 className="text-xl font-black text-slate-900">Loading...</h1>
          </section>
        </main>
      }
    >
      <FacebookCallbackContent />
    </Suspense>
  );
}
