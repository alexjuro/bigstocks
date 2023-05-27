/* Author: Nico Pareigis and Lakzan Nathan */

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
  new: boolean;
  money: number;
  performance: [{ date: string; value: number }];
}
