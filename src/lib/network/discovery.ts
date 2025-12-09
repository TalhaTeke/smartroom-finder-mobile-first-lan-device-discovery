import type { Device } from '@/types/device';
import type { ScanSettings } from '@/types/settings';
import { defaultSettings } from '@/types/settings';
const PING_ENDPOINT = '/ping';
const CONCURRENCY_LIMIT = 40;
/**
 * A utility to create a promise that rejects after a specified timeout.
 */
function withTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Promise timed out'));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}
/**
 * Probes a single IP address to check for a SmartRoomHub device.
 */
export async function probeIP(ip: string, ports: number[], timeout: number): Promise<Device | null> {
  for (const port of ports) {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const fetchTimeout = setTimeout(() => controller.abort(), timeout);
      await fetch(`http://${ip}:${port}${PING_ENDPOINT}`, {
        method: 'GET',
        mode: 'no-cors',
        signal,
      });
      clearTimeout(fetchTimeout);
      const rttMs = Math.round(performance.now() - startTime);
      return {
        ip,
        hostname: 'SmartRoomHub',
        foundBy: 'http',
        rttMs,
        lastSeen: new Date().toISOString(),
        status: 'online',
      };
    } catch (error) {
      try {
        await withTimeout(timeout, new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = `http://${ip}:${port}/favicon.ico?t=${Date.now()}`;
        }));
        const rttMs = Math.round(performance.now() - startTime);
        return {
            ip,
            hostname: 'SmartRoomHub (Port Open)',
            foundBy: 'port',
            rttMs,
            lastSeen: new Date().toISOString(),
            status: 'online',
        };
      } catch (imgError) {
        // Port likely closed, continue.
      }
    }
  }
  return null;
}
/**
 * Performs a lightweight connectivity test against a specific device.
 */
export async function connectivityTest(ip: string, port: number = 80): Promise<{ ok: boolean; method: string; details?: string }> {
    try {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchTimeout = setTimeout(() => controller.abort(), 3000);
        await fetch(`http://${ip}:${port}${PING_ENDPOINT}`, { mode: 'no-cors', signal });
        clearTimeout(fetchTimeout);
        return { ok: true, method: 'HTTP Ping' };
    } catch (e) {
        return { ok: false, method: 'HTTP Ping', details: 'Device did not respond to the ping request. It might be offline or on a different network.' };
    }
}
/**
 * Scans a list of subnets for SmartRoomHub devices using provided settings.
 */
export async function* discoverSmartRoomHubs(
  onProgress: (progress: number) => void,
  settings: ScanSettings = defaultSettings
): AsyncGenerator<Device, void, unknown> {
  const ipsToScan: string[] = [];
  for (const subnet of settings.subnets) {
    for (let i = 1; i < 255; i++) {
      ipsToScan.push(`${subnet}${i}`);
    }
  }
  if (ipsToScan.length === 0) {
    onProgress(1);
    return;
  }
  let completed = 0;
  const total = ipsToScan.length;
  for (let i = 0; i < total; i += CONCURRENCY_LIMIT) {
    const chunk = ipsToScan.slice(i, i + CONCURRENCY_LIMIT);
    const promises = chunk.map(ip =>
      probeIP(ip, settings.ports, settings.timeoutMs).then(device => {
        completed++;
        onProgress(completed / total);
        return device;
      })
    );
    const results = await Promise.all(promises);
    for (const device of results) {
      if (device) {
        yield device;
      }
    }
  }
}
/**
 * Probes a single, manually entered IP address using the provided settings.
 */
export async function manualIPProbe(ip: string, settings: ScanSettings): Promise<Device | null> {
    const device = await probeIP(ip, settings.ports, settings.timeoutMs);
    if (device) {
        return { ...device, foundBy: 'manual' };
    }
    return null;
}