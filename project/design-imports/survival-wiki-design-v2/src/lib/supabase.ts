export const supabase = {
  functions: {
    invoke: async (name: string, { body }: { body: Record<string, unknown> }) => {
      console.log(`[Supabase Functions] Invoke: ${name}`, body);
      return {
        data: {
          ok: true,
          message: 'AI接続は正常です。システム待機中。',
        },
        error: null,
      };
    },
  },
};
