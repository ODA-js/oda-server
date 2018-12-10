declare module 'inflected';
export function camelize(inp: string, uppercaseFirstLetter?: boolean): string
export function titleize(inp: string, options?: { capitalize?: boolean }): string
export function classify(inp: string): string
export function singularize(inp: string, locale?: string): string
export function pluralize(inp: string, locale?: string): string
export function constantify(inp: string): string
