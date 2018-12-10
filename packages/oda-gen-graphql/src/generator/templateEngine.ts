import { Factory } from 'fte.js';

export default function({ root }) {
  return new Factory({
    ext: ['njs'],
    root,
    preload: true,
    debug: true,
  });
}
