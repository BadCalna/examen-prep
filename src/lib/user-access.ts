export const USER_ROLES = ["USER", "ADMIN"] as const;
export const USER_PLANS = ["FREE", "PRO", "TEAM"] as const;
export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserPlan = (typeof USER_PLANS)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function isUserPlan(value: string): value is UserPlan {
  return USER_PLANS.includes(value as UserPlan);
}

export function isUserStatus(value: string): value is UserStatus {
  return USER_STATUSES.includes(value as UserStatus);
}
