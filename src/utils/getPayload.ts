import {
  isValidISOBirthDate,
  validateContactNo,
  validateGender,
  validateName,
} from "../validators/inputValidators";
import { IEditDetails } from "../types/api";
import { ICast , IDirector} from "../types/db.model";
import validator from "validator";

interface IEditUserDataReqBody {
  name?: string;
  contactNo?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer not to say";
}

interface IEditCastReqBody {
  castId?: string;
  name?: string;
  gender?: "male" | "female" | "other" | "prefer not to say";
  dateOfBirth?: string;
  nationality?: string;
}

interface IEditDirectorReqBody {
  directorId?: string;
  name?: string;
  gender?: "male" | "female" | "other" | "prefer not to say";
  dateOfBirth?: string;
  nationality?: string;
}

export const getValidUserUpdatePayload = (
  reqBody: IEditUserDataReqBody
): IEditDetails => {
  try {
    const { name, contactNo, dateOfBirth, gender } = reqBody;

    const editData: Partial<IEditDetails> = {};

    if (name) {
      validateName(name);
      editData.name = name;
    }
    if (contactNo) {
      validateContactNo(contactNo);
      editData.contactNo = contactNo;
    }
    if (dateOfBirth) {
      isValidISOBirthDate(dateOfBirth);
      editData.dateOfBirth = new Date(dateOfBirth);
    }
    if (gender) {
      validateGender(gender);
      editData.gender = gender;
    }

    return editData;
  } catch (err) {
    throw err;
  }
};

export const getValidCastPayload = (
  reqBody: IEditCastReqBody,
  existingCast: boolean
): Partial<ICast> => {
  const { name, gender, dateOfBirth, nationality } = reqBody;

  const editData: Partial<ICast> = {};

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

export const getValidDirectorPayload = (
  reqBody: IEditDirectorReqBody,
  existingDirector: boolean
): Partial<IDirector> => {
  const { name, gender, dateOfBirth, nationality } = reqBody;

  const editData: Partial<IDirector> = {};

  if (!existingDirector) {
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
  if (nationality && validator.isAlpha(nationality)) {
    editData.nationality = nationality;
  }

  return editData;
};
