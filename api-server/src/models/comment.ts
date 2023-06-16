import { Entity } from './entity';

export interface Comment extends Entity {
  rating: 0 | 1 | 2 | 3 | 4 | 5;
  comment: string;
}
