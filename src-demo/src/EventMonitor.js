import React, { useRef, useEffect } from 'react';

const EventMonitor = () => {

	const eventMonitorRef = useRef();

	// subscribe for file upload events on mount
	useEffect(() => {

		const uploadWillStartEventHandler = ({ detail: { fileName } }) => {
			console.log(`upload '${fileName}' will start`);
			// use a react "toast" module (such as react-toastify) to display notifications
		};

		const uploadRunningEventHandler = ({ detail: { fileName } }) => {
			console.log(`upload '${fileName}' running`);
			// use a react "toast" module (such as react-toastify) to display notifications
		};

		const uploadProgressEventHandler = ({ detail: { fileName, data } }) => {
			console.log(`upload '${fileName}' progress ${data}%`);
			// use a react "toast" module (such as react-toastify) to display notifications
		};

		const uploadCompleteEventHandler = ({ detail: { fileName } }) => {
			console.log(`upload '${fileName}' complete`);
			// use a react "toast" module (such as react-toastify) to display notifications
		};

		const fileReadyEventHandler = ({ detail: { fileName } }) => {
			console.log(`file '${fileName}' ready`);
			// use a react "toast" module (such as react-toastify) to display notifications
		};

		const eventMonitor = eventMonitorRef.current;
		if (!eventMonitor) return; // never too cautious

		// @ts-ignore
		eventMonitor.addEventListener('FILE_UPLOAD_WILL_START', uploadWillStartEventHandler);
		// @ts-ignore
		eventMonitor.addEventListener('FILE_UPLOAD_RUNNING', uploadRunningEventHandler);
		// @ts-ignore
		eventMonitor.addEventListener('FILE_UPLOAD_PROGRESS', uploadProgressEventHandler);
		// @ts-ignore
		// eventMonitor.addEventListener('FILE_UPLOAD_PAUSED', ___);
		// @ts-ignore
		// eventMonitor.addEventListener('FILE_UPLOAD_CANCELD', ___);
		// @ts-ignore
		eventMonitor.addEventListener('FILE_UPLOAD_COMPLETE', uploadCompleteEventHandler);
		// @ts-ignore
		eventMonitor.addEventListener('FILE_SAVED', fileReadyEventHandler);

		// unsubscribe on unmount
		return () => {
			if (!eventMonitor) return; // never too cautious

			// @ts-ignore
			eventMonitor.removeEventListener('FILE_UPLOAD_WILL_START', uploadWillStartEventHandler);
			// @ts-ignore
			eventMonitor.removeEventListener('FILE_UPLOAD_RUNNING', uploadRunningEventHandler);
			// @ts-ignore
			eventMonitor.removeEventListener('FILE_UPLOAD_PROGRESS', uploadProgressEventHandler);
			// @ts-ignore
			// eventMonitor.removeEventListener('FILE_UPLOAD_PAUSED', ___);
			// @ts-ignore
			// eventMonitor.removeEventListener('FILE_UPLOAD_CANCELD', ___);
			// @ts-ignore
			eventMonitor.removeEventListener('FILE_UPLOAD_COMPLETE', uploadCompleteEventHandler);
			// @ts-ignore
			eventMonitor.removeEventListener('FILE_SAVED', fileReadyEventHandler);
		};
	}, []);

	return <div id="eventMonitor" ref={eventMonitorRef} />;
};

export default EventMonitor;
