type ID = string | number;
// Enum for Gender
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
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
export interface IRoleRequest {
  name: string;
  schoolId: ID;
  permissionIds?: string[];
}

// Permission Request
export interface IPermissionRequest {
  name: string;
}

// Student Request
export interface IStudentRequest {
    userId: ID;
    name: string;
    gender: Gender;
    dob: string;
    phone?: string;
    email?: string;
    address: string;
    admissionDate?: string;
    religion?: string;
    bloodGroup?: string;
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    guardianPhone?: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    sectionId: ID;
    sessionId: ID;
    isActive?: boolean;
    city?: string;
    state?: string;
    country?: string;
    routeVehicleId?: ID;
    roomId?: ID;
    addedBy: ID;
    photoUrl?: string;
    parentId?: ID;
  }
  

// Staff Request
export interface IStaffRequest {
  userId: ID;
  name: string;
  phone: string[];
  email?: string;
  address: string;
  schoolId: ID;
  roleIds?: ID[];
  designation?: string;
  dob?: Date;
  salary?: number;
  joining_date?: Date;
  gender?: Gender;
  photo_url?: string;
  isActive?: boolean;
  qualification?: string;
  notes?: string;
  section_id?: number;
}

// Parent Request
export interface IParentRequest {
  userId: ID;
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

