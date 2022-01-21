export function dispatch(
	eventName: string,
	fileName: string,
  data?: any,
): void {
	const eventMonitor = document.getElementById('eventMonitor');
	if (!eventMonitor) {
		console.log(`eventMonitor not found to dispatch event ${eventName} for ${fileName}`);
		return;
	}
	const eventData = { fileName, data };
	let event = new CustomEvent(eventName, { detail: eventData });
	eventMonitor.dispatchEvent(event);
};