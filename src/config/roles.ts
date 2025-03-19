import { ADMIN_PERMISSIONS, USER_PERMISSIONS } from "./permissions";

const allRoles = {
  admin: ADMIN_PERMISSIONS,
  user: USER_PERMISSIONS,
};

export const userRoles = {
  ADMIN: 'admin',
  USER: 'user',
};

export const roles: string[] = Object.keys(allRoles);
export const roleRights: Map<string, string[]> = new Map(Object.entries(allRoles));
