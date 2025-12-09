import type { Device } from '@/types/device';
const COMMON_PORTS = [80, 8080, 3000];
const PING_ENDPOINT = '/ping';
const CONCURRENCY_LIMIT = 40;
/**
 * A utility to create a promise that rejects after a specified timeout.
 * @param ms - The timeout in milliseconds.
 * @param promise - The promise to race against the timeout.
 * @returns A promise that resolves with the original promise's result or rejects on timeout.
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
 * It first attempts an HTTP GET request to a /ping endpoint, falling back to a raw port check using an Image tag.
 * @param ip - The IP address to probe.
 * @param ports - An array of ports to check.
 * @param timeout - The timeout in milliseconds for each probe attempt.
 * @returns A Promise that resolves to a Device object if found, otherwise null.
 */
export async function probeIP(ip: string, ports: number[] = COMMON_PORTS, timeout = 2500): Promise<Device | null> {
  for (const port of ports) {
    const startTime = performance.now();
    try {
      // 1. Preferred method: HTTP /ping check
      const controller = new AbortController();
      const signal = controller.signal;
      const fetchTimeout = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(`http://${ip}:${port}${PING_ENDPOINT}`, {
        method: 'GET',
        mode: 'no-cors', // Allows request even if device lacks CORS headers
        signal,
      });
      clearTimeout(fetchTimeout);
      const rttMs = Math.round(performance.now() - startTime);
      // no-cors responses have status 0, so we just check for a response
      return {
        ip,
        hostname: 'SmartRoomHub', // Assume hostname if endpoint responds
        foundBy: 'http',
        rttMs,
        lastSeen: new Date().toISOString(),
        status: 'online',
      };
    } catch (error) {
      // This is expected for IPs that don't respond or have closed ports.
      // Now, try the image-based port check as a fallback.
      try {
        await withTimeout(timeout, new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = `http://${ip}:${port}/favicon.ico?t=${Date.now()}`; // Use a common file and cache-bust
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
        // This port is likely closed or the IP is down. Continue to next port.
      }
    }
  }
  return null;
}
/**
 * Performs a lightweight connectivity test against a specific device.
 * @param ip - The device's IP address.
 * @param port - The port to test (defaults to 80).
 * @returns A promise that resolves with the connection status.
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
 * Scans a list of subnets for SmartRoomHub devices.
 * @param onProgress - A callback function to report scan progress (0 to 1).
 * @param subnets - An array of subnets to scan (e.g., '192.168.1.').
 * @returns An async generator that yields Device objects as they are discovered.
 */
export async function* discoverSmartRoomHubs(
  onProgress: (progress: number) => void,
  subnets = ['192.168.1.']
): AsyncGenerator<Device, void, unknown> {
  const ipsToScan: string[] = [];
  for (const subnet of subnets) {
    for (let i = 1; i < 255; i++) {
      ipsToScan.push(`${subnet}${i}`);
    }
  }
  let completed = 0;
  const total = ipsToScan.length;
  for (let i = 0; i < total; i += CONCURRENCY_LIMIT) {
    const chunk = ipsToScan.slice(i, i + CONCURRENCY_LIMIT);
    const promises = chunk.map(ip => 
      probeIP(ip).then(device => {
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