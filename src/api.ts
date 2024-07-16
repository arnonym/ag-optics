import * as Lens from './lens';
import * as Prism from './prism';
import * as Id from './id';
import * as Pipe from './pipe';

export class L {
  static id = Id.id;
  static prop = Lens.prop;
}

export class O {
  static prop = Prism.prop;
  static idx = Prism.idx;
  static findFirst = Prism.findFirst;
  static findLast = Prism.findLast;
}

export const pipe = Pipe.pipe;
