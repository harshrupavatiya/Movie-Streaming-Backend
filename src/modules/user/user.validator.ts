import { IEditDetails, IEditUserDataReqBody } from "./user.interface";

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