/**
 * KSV — Protocol DTO
 */

export interface CreateProtocolDto {
  code: string;
  name: string;
  category: 'short-range' | 'long-range' | 'wired' | 'cloud';
  description?: string;
  config?: Record<string, unknown>;
}

export interface UpdateProtocolDto {
  name?: string;
  enabled?: boolean;
  description?: string;
  config?: Record<string, unknown>;
}

export interface ProtocolResponseDto {
  protocolId: string;
  code: string;
  name: string;
  category: string;
  enabled: boolean;
  description?: string;
  createdAt: string;
}
