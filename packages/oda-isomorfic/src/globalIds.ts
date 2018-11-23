import unbase64 from './unbase64';
import base64 from './base64';

const DELIMITER = ':';

export interface ResolvedGlobalId {
  type: string;
  id: string;
}

export function fromGlobalId(
  globalId: string,
  delimiter?: string,
): ResolvedGlobalId {
  const unbasedGlobalId = unbase64(globalId);
  const delimiterPos = unbasedGlobalId.indexOf(delimiter || DELIMITER);
  if (delimiterPos > -1) {
    return {
      type: unbasedGlobalId.substring(0, delimiterPos),
      id: unbasedGlobalId.substring(
        delimiterPos + (delimiter || DELIMITER).length,
      ),
    };
  } else {
    return {
      type: '',
      id: globalId,
    };
  }
}

export function toGlobalId(
  type: string,
  id: string,
  delimiter?: string,
): string {
  const ub = unbase64(id);
  if (ub.indexOf(delimiter || DELIMITER) !== -1) {
    id = fromGlobalId(id).id;
  }
  return base64([type, id].join(delimiter || DELIMITER));
}
