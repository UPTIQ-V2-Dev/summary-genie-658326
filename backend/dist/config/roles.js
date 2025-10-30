import { Role } from "../constants/role.constants.js";
const allRoles = {
    [Role.USER]: ['getSummaries', 'manageSummaries'],
    [Role.ADMIN]: ['getUsers', 'manageUsers', 'getSummaries', 'manageSummaries']
};
export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
