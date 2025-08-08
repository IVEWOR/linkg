import { signInWithX, signInWithEmail, signUpWithEmail } from "./actions";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {/* X / Twitter */}
      <form action={signInWithX}>
        <button className="w-full rounded-md border px-4 py-2">
          Continue with X (Twitter)
        </button>
      </form>

      {/* Email sign in */}
      <form action={signInWithEmail} className="space-y-3">
        <input
          className="w-full rounded-md border px-3 py-2"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button className="w-full rounded-md border px-4 py-2">
          Sign in with Email
        </button>
      </form>

      {/* Email sign up */}
      <form action={signUpWithEmail} className="space-y-3">
        <input
          className="w-full rounded-md border px-3 py-2"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button className="w-full rounded-md border px-4 py-2">
          Create account
        </button>
      </form>
    </div>
  );
}
