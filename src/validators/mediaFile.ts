import { UploadedFile } from "express-fileupload";

export const validateFileContent = (
  file: UploadedFile,
  contentType: string
): void => {
  if (!file) {
    throw new Error("File is not present");
  }

  if (file.mimetype.split("/")[0] !== contentType) {
    throw new Error(`only ${contentType} can be sent`);
  }
};
