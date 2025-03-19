import { isValidISOBirthDate, validateGender, validateName } from "../validate/inputValidators";
import { ICrew, IEditCrewReqBody } from "./crew.interface";
import validator from 'validator';

export const getValidCrewPayload = (
  reqBody: IEditCrewReqBody,
  existingCast: boolean
): Partial<ICrew> => {
  const { name, gender, dateOfBirth, nationality } = reqBody;

  const editData: Partial<ICrew> = {};

  if (!existingCast) {
    if (!name) {
      throw new Error("Name field required");
    }
    validateName(name);
    editData.name = name;
    if (gender) {
      validateGender(gender);
      editData.gender = gender;
    }
    if (dateOfBirth) {
      isValidISOBirthDate(dateOfBirth);
      editData.dateOfBirth = new Date(dateOfBirth);
    }
    if (nationality && validator.isAlpha(nationality)) {
      editData.nationality = nationality;
    }

    return editData;
  }

  if (name) {
    validateName(name);
    editData.name = name;
  }
  if (gender) {
    validateGender(gender);
    editData.gender = gender;
  }
  if (dateOfBirth) {
    isValidISOBirthDate(dateOfBirth);
    editData.dateOfBirth = new Date(dateOfBirth);
  }
  if (nationality) {
    if(!validator.isAlpha(nationality)) {
      throw new Error("Only alphabets are allowed in notionality");
    }
    editData.nationality = nationality;
  }

  return editData;
};