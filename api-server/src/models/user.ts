/* Author: Nico Pareigis and Lakzan Nathan */

import { Entity } from './entity';

export interface User extends Entity {
  name: string;
  email: string;
  password: string;
  new: boolean;
  money: number;
  performance: [{ date: string; value: number }];
  friends: [{ name: string; accepted: boolean }];
}
