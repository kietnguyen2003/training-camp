import type { Participant } from '../types';

export type AttendanceStatus = Participant['status'];

export function getTapToggleStatus(currentStatus: AttendanceStatus): AttendanceStatus {
  switch (currentStatus) {
    case 'present':
      return 'absent';
    case 'absent':
      return 'present';
    case 'retired':
      return 'present';
  }
}

export function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'CO MAT';
    case 'absent':
      return 'VANG MAT';
    case 'retired':
      return 'DA NGHI';
  }
}
