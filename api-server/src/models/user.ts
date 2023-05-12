/* Author: Nico Pareigis */

import { Binary } from 'mongodb';
import { Entity } from './entity';

export interface User extends Entity {
  name: string;
  email: string;
  password: string;
  avatar: Binary;
}
