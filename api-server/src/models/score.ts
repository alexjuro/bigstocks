/* Author: Alexander Lensjak */

import { Entity } from './entity';

export interface Score extends Entity {
  name: string;
  score: number;
}
