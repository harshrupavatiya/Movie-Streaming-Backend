/* eslint-disable @typescript-eslint/no-explicit-any */
const pick = (object: Record<string, any>, keys: string[]): Record<string, any> => {
  const result = keys.reduce((obj: Record<string, any>, key: string) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});

  return result;
};

export default pick;
