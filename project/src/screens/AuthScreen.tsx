import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { playAchievementSound, playConfirmSound, playHoverSound, playInputFocusSound, playNewRecordSound } from '@/lib/sound';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) throw signUpError;
        playNewRecordSound();
        setMessage('確認メールを送信しました。メール内のリンクから登録を完了してください。');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;
      playAchievementSound();
      setMessage('ログインしました。');
    } catch (e) {
      setError(e instanceof Error ? e.message : '認証に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#11120f] text-stone-100 flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-2xl border border-[#2d3028] bg-[#1b1c18] p-6 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-bold tracking-tight">Survival Wiki</h1>
        <p className="mt-1 text-sm text-stone-400">
          {isSignUp ? 'アカウントを作成' : 'ログイン'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-stone-300">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onPointerDown={playInputFocusSound}
              autoComplete="email"
              required
              className="mt-2 w-full rounded-xl border border-[#3a3d34] bg-[#11120f] px-4 py-3 text-stone-100 outline-none focus:border-emerald-600"
            />
          </label>

          <label className="block">
            <span className="text-sm text-stone-300">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onPointerDown={playInputFocusSound}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={6}
              required
              className="mt-2 w-full rounded-xl border border-[#3a3d34] bg-[#11120f] px-4 py-3 text-stone-100 outline-none focus:border-emerald-600"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={playHoverSound}
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '処理中…' : isSignUp ? 'アカウントを作成' : 'ログイン'}
          </button>
        </form>

        <button
          type="button"
          onPointerDown={playConfirmSound}
          onMouseEnter={playHoverSound}
          onClick={() => {
            setIsSignUp((value) => !value);
            setMessage('');
            setError('');
          }}
          className="mt-4 w-full text-sm text-stone-400 hover:text-stone-200"
        >
          {isSignUp ? 'ログインに戻る' : '新規アカウントを作成する'}
        </button>
      </div>
    </div>
  );
}