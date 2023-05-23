/* Author: Nico Pareigis and Lakzan Nathan */

import { Entity } from './entity';

export interface User extends Entity {
  username: string;
  email: string;
  password: string;
  activation: boolean;
  code: number;
  new: boolean;

  rating: boolean;
}
