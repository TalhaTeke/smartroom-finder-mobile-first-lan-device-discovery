export interface ScanSettings {
  subnets: string[];
  ports: number[];
  timeoutMs: number;
  manualIp: string;
}
export const defaultSettings: ScanSettings = {
  subnets: ['192.168.1.', '192.168.0.', '10.0.0.'],
  ports: [80, 443, 3000, 8080],
  timeoutMs: 3000,
  manualIp: '',
};