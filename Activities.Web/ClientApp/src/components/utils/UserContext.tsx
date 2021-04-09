import React from 'react';

export interface User {
  athleteId: number;
  fullName: string;
  profileImageUrl: string;
}

export const UserContext = React.createContext<User | null | undefined>(undefined);
