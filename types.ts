export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface Match {
  id: string;
  winnerId: number;
  createdAt: string;
}

export interface League {
  id: string;
  players: Player[];
  matches: Match[];
  winnerId: number | null;
  createdAt: string;
}
