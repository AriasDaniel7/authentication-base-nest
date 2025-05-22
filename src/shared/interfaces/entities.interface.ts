export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBaseUser extends IBaseEntity {
  email: string;
  password?: string;
}
