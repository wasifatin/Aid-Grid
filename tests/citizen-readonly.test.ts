import { describe, it, expect } from 'vitest';
import { signToken, getRequestUser, rejectCitizenMutation } from '../src/lib/auth';

function makeRequest(token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers.cookie = `aidgrid_token=${encodeURIComponent(token)}`;
  }
  return new Request('http://localhost:3000/api/reports', {
    method: 'POST',
    headers,
  });
}

describe('Citizen Read-Only Access Guard', () => {
  it('blocks requests authenticated as CITIZEN via cookie with 403', async () => {
    const citizenToken = signToken({
      id: 'citizen-1',
      email: 'citizen@aidgrid.gov.bd',
      fullName: 'Rahim Ahmed',
      role: 'CITIZEN',
    });

    const req = makeRequest(citizenToken);
    expect(getRequestUser(req)?.role).toBe('CITIZEN');

    const res = rejectCitizenMutation(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);

    const body = await res!.json();
    expect(body.error).toContain('Citizen role');
  });

  it('blocks requests authenticated as CITIZEN via Bearer header with 403', async () => {
    const citizenToken = signToken({
      id: 'citizen-2',
      email: 'citizen2@aidgrid.gov.bd',
      fullName: 'Test Citizen',
      role: 'CITIZEN',
    });

    const req = new Request('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });

    const res = rejectCitizenMutation(req);
    expect(res?.status).toBe(403);
  });

  it('allows operational roles to proceed with document mutations', () => {
    for (const role of ['FIELD_OFFICER', 'DEPARTMENT_MANAGER', 'SYSTEM_ADMIN'] as const) {
      const token = signToken({
        id: `user-${role}`,
        email: `${role.toLowerCase()}@aidgrid.gov.bd`,
        fullName: role,
        role,
      });

      const req = makeRequest(token);
      expect(getRequestUser(req)?.role).toBe(role);
      expect(rejectCitizenMutation(req)).toBeNull();
    }
  });
});
