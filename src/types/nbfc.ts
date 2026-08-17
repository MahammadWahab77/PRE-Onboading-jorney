export interface AcademyRecord {
  idMasked: string;
  nameMasked: string;
  currentTeam: string;
  active: boolean;
}

export interface NbfcRecord {
  id: string; // masked Salesforce record id - safe for client
  name: string;
  statusRaw: string | null;
  statusCode: string;
  displayStatus: string;
  statusType: 'success' | 'failed' | 'warning' | 'in_progress' | 'neutral';
  message?: string | null;
  owner: string;
  nextAction: string;
  ctaLabel: string | null;
  ctaRoute: string | null;
  progressStep: number;
}

export interface NbfcApiResponse {
  found: boolean;
  success: boolean;
  message: string;
  mobileMasked?: string;
  academyRecord: AcademyRecord | null;
  nbfcRecords: NbfcRecord[];
}
