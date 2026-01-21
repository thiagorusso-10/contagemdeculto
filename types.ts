export interface Campus {
  id: string;
  name: string;
  color: string;
}

export interface Preacher {
  id: string;
  name: string;
}

export interface VolunteerArea {
  id: string;
  name: string;
}

// Map of AreaID -> Count
export interface VolunteerBreakdown {
  [areaId: string]: number;
}

export interface Report {
  id: string;
  campusId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  preacherId: string;
  notes: string;
  attendance: {
    adults: number;
    kids: number;
    visitors: number;
    teens: number;
    volunteers: number; // Calculated sum
  };
  volunteerBreakdown: VolunteerBreakdown;
  createdAt: number;
}

export interface AppState {
  campuses: Campus[];
  preachers: Preacher[];
  volunteerAreas: VolunteerArea[];
  reports: Report[];
}