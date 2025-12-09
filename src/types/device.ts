export type Device = {
  ip: string;
  hostname?: string;
  id?: string;
  foundBy: 'http' | 'port' | 'mdns' | 'manual' | 'mock';
  rttMs?: number;
  metadata?: Record<string, string>;
  lastSeen: string;
  status?: 'online' | 'offline' | 'unknown';
};