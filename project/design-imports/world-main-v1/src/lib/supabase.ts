export const supabase = {
  functions: {
    invoke: async (name: string, { body }: { body: unknown }) => {
      console.log(`[Supabase Function Mock] Invoked ${name} with`, body);
      return {
        data: { ok: true, message: '通信テスト成功：冒険の書サーバーへ正常に接続されました。' },
        error: null
      };
    }
  }
};
