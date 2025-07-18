import { writable } from 'svelte/store';

export interface Notification {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
}

function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);

	function add(notification: Omit<Notification, 'id'>) {
		const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
		const newNotification: Notification = {
			...notification,
			id,
			duration: notification.duration ?? 5000
		};

		update(notifications => [...notifications, newNotification]);

		// Auto-remove after duration
		if (newNotification.duration && newNotification.duration > 0) {
			setTimeout(() => {
				remove(id);
			}, newNotification.duration);
		}

		return id;
	}

	function remove(id: string) {
		update(notifications => notifications.filter(n => n.id !== id));
	}

	function clear() {
		update(() => []);
	}

	// Convenience methods
	function success(message: string, duration?: number) {
		return add({ message, type: 'success', duration });
	}

	function error(message: string, duration?: number) {
		return add({ message, type: 'error', duration });
	}

	function warning(message: string, duration?: number) {
		return add({ message, type: 'warning', duration });
	}

	function info(message: string, duration?: number) {
		return add({ message, type: 'info', duration });
	}

	return {
		subscribe,
		add,
		remove,
		clear,
		success,
		error,
		warning,
		info
	};
}

export const notifications = createNotificationStore(); 