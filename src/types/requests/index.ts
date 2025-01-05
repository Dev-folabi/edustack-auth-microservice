type ID = string;
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
  admission_date?: string;
  religion: string;
  blood_group?: string;
  father_name?: string;
  mother_name?: string;
  guardian_name?: string;
  guardian_phone: string[];
  father_occupation?: string;
  mother_occupation?: string;
  isActive?: boolean;
  city: string;
  state: string;
  country: string;
  route_vehicle_id?: string;
  room_id?: ID;
  added_by?: ID;
  photo_url?: string;
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

export interface TermRequest {
  label: string;
  start_date: Date;
  end_date: Date;
}

export interface SessionRequest {
  label: string;
  start_date: Date;
  end_date: Date;
  isActive: boolean;
  terms: TermRequest[];
}

export interface classSchoolRequest {
  label: string;
  section: string;
  school_id: string[];
}

