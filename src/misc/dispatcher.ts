import { log } from './logger';

export type DispatchEvent =
  | 'FILE_UPLOAD_WILL_START'
  | 'FILE_UPLOAD_PROGRESS'
  | 'FILE_UPLOAD_PAUSED'
  | 'FILE_UPLOAD_RUNNING'
  | 'FILE_UPLOAD_CANCELED'
  | 'FILE_UPLOAD_COMPLETE'
  | 'FILE_SAVED';

export function dispatch(
  eventName: DispatchEvent,
  fileName: string,
  data?: any
): void {
  const eventMonitor = document.getElementById('eventMonitor');
  if (!eventMonitor) {
    log(
      `eventMonitor not found to dispatch event ${eventName} for ${fileName}`
    );
    return;
  }
  const eventData = { fileName, data };
  let event = new CustomEvent(eventName, { detail: eventData });
  eventMonitor.dispatchEvent(event);
}
