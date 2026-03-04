import { describe, expect, it } from 'vitest';

import {
  deriveSponsorTier,
  normalizeSponsorshipStatus,
  toSponsorStudent,
} from '@/db/queries/sponsor-students';

import { sponsorStudentRows } from '../fixtures/sponsor-students';

describe('sponsor student query helpers', () => {
  it('maps pending sponsored students to tier 2 until sponsorship is active', () => {
    const student = toSponsorStudent(sponsorStudentRows[0]);

    expect(student.status).toBe('pending');
    expect(student.tier).toBe(2);
    expect(student.studentName).toBe('Ada Okafor');
    expect(student.studentInitials).toBe('AO');
  });

  it('maps active sponsorships to tier 3 and keeps destination context', () => {
    const student = toSponsorStudent(sponsorStudentRows[1]);

    expect(student.status).toBe('active');
    expect(student.tier).toBe(3);
    expect(student.universityName).toBe('New York University');
    expect(student.programName).toBe('MBA');
  });

  it('normalizes unsupported statuses and keeps safe fallbacks', () => {
    const student = toSponsorStudent(sponsorStudentRows[2]);

    expect(normalizeSponsorshipStatus('cancelled')).toBe('pending');
    expect(deriveSponsorTier({
      kycStatus: sponsorStudentRows[2].kycStatus,
      bankStatus: sponsorStudentRows[2].bankStatus,
      sponsorshipStatus: sponsorStudentRows[2].sponsorshipStatus,
    })).toBe(1);
    expect(student.status).toBe('pending');
    expect(student.universityName).toBe('University pending');
    expect(student.programName).toBe('Program pending');
    expect(student.studentInitials).toBe('M');
  });
});
