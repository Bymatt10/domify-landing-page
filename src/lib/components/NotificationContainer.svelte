<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import NotificationToast from './NotificationToast.svelte';
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
	{#each $notifications as notification (notification.id)}
		<NotificationToast
			message={notification.message}
			type={notification.type}
			duration={notification.duration || 5000}
			show={true}
			on:close={() => notifications.remove(notification.id)}
		/>
	{/each}
</div> 