export default class AclDefault {
  // reverse order
  public readonly roles: string[];
  public constructor(roles: string[] = ['system']) {
    this.roles = roles;
  }
  public allow(role: string, access: string | string[]): boolean {
    if (Array.isArray(access)) {
      return access.some(r => r === role);
    } else {
      return access === role;
    }
  }
}
