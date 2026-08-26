import { WorldCreateScreen } from '@/screens/WorldCreateScreen';

export function WorldCreateModal({
  gameId,
  onClose,
  onCreated,
}: {
  gameId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  return (
    <WorldCreateScreen
      gameId={gameId}
      gameName="SURVIVAL_WIKI"
      navigate={() => {
        onCreated();
        onClose();
      }}
      goBack={() => {
        onCreated();
        onClose();
      }}
    />
  );
}
