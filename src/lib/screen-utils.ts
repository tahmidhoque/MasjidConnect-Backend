import { customAlphabet } from 'nanoid';

// Generate a 6-character pairing code using numbers and uppercase letters
const generateCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export function generatePairingCode(): string {
  return generateCode();
}

export function formatLastSeen(date: Date | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function isScreenOnline(lastSeen: Date | null): boolean {
  if (!lastSeen) return false;
  const now = new Date();
  const diff = now.getTime() - lastSeen.getTime();
  return diff < 5 * 60 * 1000; // Consider online if seen in last 5 minutes
} 