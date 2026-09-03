# Survival Wiki Legacy BGM v1 — 保管専用 / DO NOT DELETE

このディレクトリは、2026-09-03 に新AS BGMへ差し替える直前の本番BGM原本を保管するためのアーカイブです。

## 目的

- 旧トップページBGM + 旧NPC BGM 3曲（エルナン / Dr.アーク / 旧ancient枠）の音源ロジックを将来参照できるよう残す。
- 本番から接続が外れても「未使用コード」「残骸」と判断して削除しない。
- 新AS BGMとの比較・復元・音響研究用途に限って使用する。

## 重要ルール

**このディレクトリは本番未接続でも削除禁止。**

コード整理・未使用ファイル整理・Design Imports整理の対象外とする。削除する場合は、ユーザーの明示許可を必須とする。

## 保管元

GitHub main 基準コミット:
`dcd8291ebf8bc46ae3cc3d93fde72b5a6d4b9607`

旧BGMの実装元:
- `project/src/lib/bgm.ts` — NPC BGM 3曲 + BGM切替管理
- `project/src/lib/bgmSequencer.ts` — 旧トップ / WORLD SELECT BGM
- `project/src/lib/bgmSettings.ts` — 旧4Channel設定
- `project/src/components/settings/WorldBgmChannelSettings.tsx` — 旧4Channel UI

新AS 4曲への切替後も、このREADMEをアーカイブ保護マーカーとして維持する。
