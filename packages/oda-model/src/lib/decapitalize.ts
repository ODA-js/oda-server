export default function decapitalize(name: string): string {
  return name.slice(0, 1).toLowerCase() + name.slice(1);
}
