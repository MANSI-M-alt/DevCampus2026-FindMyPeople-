export type Goal =
  | 'win a hackathon'
  | 'learn something new'
  | 'build a portfolio'
  | 'start a startup'
  | 'research or publish';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

export interface PreviousProject {
  id: string;
  title: string;
  description: string;
  role: string;
  year?: string;
  link?: string;
  technologies: string[];
  outcomes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  department: string;
  year: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  interests: string[];
  goal: Goal;
  freeSlots: string[]; // e.g., ["Mon-Morning", "Wed-Evening", "Sat-Afternoon"]
  isPhdCandidate?: boolean;
  researchSpecialization?: string;
  advisorLab?: string;
  previousProjects?: PreviousProject[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  goal: Goal;
  authorId: string;
  createdAt: string;
}

export interface MatchResult {
  id: string;
  projectId: string;
  profileId: string;
  matchScore: number;
  reason: string;
  complementarySkill: string;
  goalAlignment: 'strong' | 'partial' | 'weak';
  goalAlignmentNote: string;
  risk: string;
  interestedByAuthor: boolean;
  interestedByCandidate: boolean;
  isMutual: boolean;
}

export interface SparkAgendaItem {
  time: string;
  topic: string;
}

export interface MeetingSlotSuggestion {
  day: string;
  slot: string;
  timeLabel: string;
}

export interface SparkSessionData {
  matchId: string;
  icebreaker: string;
  fitQuestions: string[];
  agenda: SparkAgendaItem[];
  suggestedMeetingTimes: MeetingSlotSuggestion[];
  authorDecision?: 'build' | 'pass';
  candidateDecision?: 'build' | 'pass';
}
