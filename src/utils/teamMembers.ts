export type CreatedTeamMember = {
  id: number;
  uid: string;
  status: boolean;
  banned: boolean;
  isSuperAdmin: false;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee';
  balance: string;
  verified: boolean;
  createdAt: string;
  department: string;
};

const createdTeamMembersKey = 'aeropoint-created-team-members';

export function readCreatedTeamMembers(): CreatedTeamMember[] {
  return JSON.parse(localStorage.getItem(createdTeamMembersKey) || '[]') as CreatedTeamMember[];
}

export function saveCreatedTeamMember(member: CreatedTeamMember): void {
  const members = readCreatedTeamMembers();
  localStorage.setItem(createdTeamMembersKey, JSON.stringify([...members.filter(existing => existing.id !== member.id), member]));
}
