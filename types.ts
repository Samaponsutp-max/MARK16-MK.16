
export enum ElectionType {
  MAYOR = 'MAYOR',
  MEMBER = 'MEMBER'
}

export interface Candidate {
  id: number;
  name: string;
  number: number;
  party: string;
  color: string;
  photoUrl: string;
}

export interface Village {
  id: number;
  moo: number;
  name: string;
  totalVoters: number;
  zone: 'North' | 'Central' | 'South' | 'East' | 'West';
  location: string;
  mapUrl: string;
}

export interface VoteRecord {
  villageId: number;
  candidateId: number;
  count: number;
  electionType?: ElectionType;
}

export interface VillageStatus {
  villageId: number;
  isReported: boolean;
  isVerified: boolean;
  lastUpdated?: Date;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: 'LOGIN' | 'SUBMIT_VOTE' | 'RESET_SYSTEM' | 'ROLLBACK';
  details: string;
  remark?: string;
  diff?: {
    candidateId: number;
    before: number;
    after: number;
    villageName?: string;
  }[];
  snapshot?: {
    votes: VoteRecord[];
    statuses: VillageStatus[];
  };
  user: string;
  ip?: string;
}

export interface AppState {
  votes: VoteRecord[];
  statuses: VillageStatus[];
  lastUpdate: Date;
}

export type NotificationCategory = 'close-race' | 'over-limit' | 'system' | 'general';

export interface NotificationSettings {
  enableInApp: boolean;
  enableEmail: boolean;
  emailAddress: string;
  alertCloseRace: boolean;
  alertOverLimit: boolean;
  alertSystemStatus: boolean;
}
