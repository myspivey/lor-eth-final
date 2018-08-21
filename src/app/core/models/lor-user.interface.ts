import { UserInfo } from '@firebase/auth-types';

export interface ILorUser extends UserInfo {
  address?: string;
}
