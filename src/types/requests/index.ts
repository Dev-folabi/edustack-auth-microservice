type ID = string | number;
// Enum for Gender
enum Gender {
  male = "male",
  female = "female",
  others = "others",
}

// School Request
export interface ISchoolRequest {
  name: string;
  email: string;
  phone: string[];
  address: string;
  isActive?: boolean;
}

// User Request
export interface IUserRequest {
  email: string;
  username: string;
  password: string;
  isSuperAdmin?: boolean;
}

// Role Request
// export interface IRoleRequest {
//   name: string;
//   schoolId: ID;
//   permissionIds?: string[];
// }

// Permission Request
// export interface IPermissionRequest {
//   name: string;
// }

// Student Request
export interface IStudentRequest extends IUserRequest {
  schoolId: ID;
  name: string;
  gender: Gender;
  dob: string;
  phone?: string;
  address: string;
  admissionDate?: string;
  religion: string;
  bloodGroup?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  isActive?: boolean;
  city: string;
  state: string;
  country: string;
  routeVehicleId?: ID;
  roomId?: ID;
  addedBy?: ID;
  photoUrl?: string;
  parentId?: ID;
}

// Staff Request
export interface IStaffRequest extends IUserRequest {
  name: string;
  phone: string[];
  address: string;
  schoolId: ID;
  role: string;
  designation?: string;
  dob?: Date;
  salary?: number;
  joining_date?: Date;
  gender: Gender;
  photo_url?: string;
  isActive?: boolean;
  qualification?: string;
  notes?: string;
}

// Parent Request
export interface IParentRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  studentIds: ID[];
}

// UserSchool Request
export interface IUserSchoolRequest {
  userId: ID;
  schoolId: ID;
}
