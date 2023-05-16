/* Author: Nico Pareigis */

import { Entity } from './entity';

export enum Role {
  ADMIN,
  USER
}

export interface User extends Entity {
  avatar: string;
  email: string;
  name: string;
  password: string;
  role: Role;
}
