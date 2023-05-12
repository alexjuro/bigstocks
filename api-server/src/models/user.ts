/* Author: Nico Pareigis */

import { Entity } from './entity';

export interface User extends Entity {
  name: string;
  email: string;
  password: string;
}
