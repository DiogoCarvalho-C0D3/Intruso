import { useGame } from '../../context/GameContext';
import NotificationToast from './NotificationToast';

export default function GlobalNotifications() {
    const { notifications, removeNotification } = useGame();

    return (
        <NotificationToast
            notifications={notifications}
            removeNotification={removeNotification}
        />
    );
}
