export function dispatch(
	eventName: string,
	fileName: string,
  data?: any,
): void {
	const lispatcher = document.getElementById('lispatcher');
	if (!lispatcher) {
		console.log(`lispatcher not found to dispatch event ${eventName} for ${fileName}`);
		return;
	}
	const eventData = { fileName, data };
	let event = new CustomEvent(eventName, { detail: eventData });
	lispatcher.dispatchEvent(event);
};