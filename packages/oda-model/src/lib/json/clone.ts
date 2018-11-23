import clean from './clean';

export default function clone(obj: any) {
  return JSON.parse(JSON.stringify(clean(obj)));
}
