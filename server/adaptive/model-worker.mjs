import { parentPort,workerData } from 'node:worker_threads';
import { projectCompleteHistory } from './learning-projector.mjs';
try {parentPort.postMessage({result:projectCompleteHistory(workerData)});}
catch {parentPort.postMessage({error:'adaptive_runtime_invalid'});}
