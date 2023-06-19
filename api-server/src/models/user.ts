/* Autor: Nico Pareigis */

import { Entity } from './entity';

export enum Role {
  ADMIN,
  USER
}

export interface User extends Entity {
  avatar: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  money: number;
  performance: [{ date: string; value: number }];
  safetyAnswerOne: string;
  safetyAnswerTwo: string;
  activation: boolean;
  code: number;
  new: boolean;
  rating: boolean;
  compareEmail: string;
  friends: [{ username: string; accepted: boolean }];
  tries: { date: string; value: number };
}
