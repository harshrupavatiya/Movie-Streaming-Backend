export const validateFileContent = (
  mimetype: string,
  contentType: string
): void => {
  if (mimetype.split("/")[0] !== contentType) {
    throw new Error(`only ${contentType} can be sent`);
  }
};
