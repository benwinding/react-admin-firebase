import React, { useRef, useEffect } from 'react';

// Lispatcher listens and dispatch
const Lispatcher = () => {

	const lispatcherRef = useRef<HTMLDivElement>(null);

	// subscribe for file upload events on mount
	useEffect(() => {

		const uploadWillStartEventHandler = ({ detail: { fileName } }) => {
			console.log(`upload '${fileName}' will start`);
			// use a react "toast" module (such as react-toastify) to display notifications
		};

		const uploadStartEventHandler = ({ detail: { fileName } }) => {
			console.log(`upload '${fileName}' start`);
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

		const lispatcher = lispatcherRef.current;
		if (!lispatcher) return; // never too cautious

		// @ts-ignore
		lispatcher.addEventListener('FILE_UPLOAD_WILL_START', uploadWillStartEventHandler);
		// @ts-ignore
		lispatcher.addEventListener('FILE_UPLOAD_START', uploadStartEventHandler);
		// @ts-ignore
		lispatcher.addEventListener('FILE_UPLOAD_PROGRESS', uploadProgressEventHandler);
		// @ts-ignore
		// lispatcher.addEventListener('FILE_UPLOAD_PAUSED', ___);
		// @ts-ignore
		// lispatcher.addEventListener('FILE_UPLOAD_CANCELD', ___);
		// @ts-ignore
		lispatcher.addEventListener('FILE_UPLOAD_COMPLETE', uploadCompleteEventHandler);
		// @ts-ignore
		lispatcher.addEventListener('FILE_SAVED', fileReadyEventHandler);

		// unsubscribe on unmount
		return () => {
			if (!lispatcher) return; // never too cautious

			// @ts-ignore
			lispatcher.removeEventListener('FILE_UPLOAD_WILL_START', uploadWillStartEventHandler);
			// @ts-ignore
			lispatcher.removeEventListener('FILE_UPLOAD_START', uploadStartEventHandler);
			// @ts-ignore
			lispatcher.removeEventListener('FILE_UPLOAD_PROGRESS', uploadProgressEventHandler);
			// @ts-ignore
			// lispatcher.removeEventListener('FILE_UPLOAD_PAUSED', ___);
			// @ts-ignore
			// lispatcher.removeEventListener('FILE_UPLOAD_CANCELD', ___);
			// @ts-ignore
			lispatcher.removeEventListener('FILE_UPLOAD_COMPLETE', uploadCompleteEventHandler);
			// @ts-ignore
			lispatcher.removeEventListener('FILE_SAVED', fileReadyEventHandler);
		};
	}, []);

	return <div id="lispatcher" ref={lispatcherRef} />;
};

export default Lispatcher;
