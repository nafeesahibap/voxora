// ─── Types ───────────────────────────────────────────────
export interface HRTask {
  id: string
  title: string
  candidate?: string
  dueDate: string
  priority: "high" | "medium" | "low"
  status: "pending" | "completed"
  voiceCreated: boolean
  category: "interview" | "compliance" | "follow-up" | "voice"
}

export interface Candidate {
  id: string
  name: string
  role: string
  experience: string
  matchScore: number
  status: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected"
  lastUpdated: string
  email: string
  phone: string
  skills: { name: string; level: number }[]
  resumeUrl?: string
  interviewHistory: { date: string; type: string; interviewer: string; notes: string }[]
  linkedTasks: string[]
}

export interface Interview {
  id: string
  time: string
  date: string
  candidateName: string
  candidateId: string
  position: string
  type: "Technical" | "HR" | "Final"
  status: "Likely Hire" | "Pending" | "Rejected"
  notes: string
  recording?: string
}

// ─── Mock Data ───────────────────────────────────────────
export const initialTasks: HRTask[] = [
  {
    id: "t1",
    title: "Review Sarah Chen's technical assessment",
    candidate: "Sarah Chen",
    dueDate: "2026-02-13",
    priority: "high",
    status: "pending",
    voiceCreated: false,
    category: "interview",
  },
  {
    id: "t2",
    title: "Schedule final interview with Marcus Johnson",
    candidate: "Marcus Johnson",
    dueDate: "2026-02-14",
    priority: "medium",
    status: "pending",
    voiceCreated: false,
    category: "interview",
  },
  {
    id: "t3",
    title: "Complete I-9 verification for new hires",
    dueDate: "2026-02-15",
    priority: "high",
    status: "pending",
    voiceCreated: false,
    category: "compliance",
  },
  {
    id: "t4",
    title: "Send offer letter to Emily Park",
    candidate: "Emily Park",
    dueDate: "2026-02-13",
    priority: "high",
    status: "completed",
    voiceCreated: false,
    category: "follow-up",
  },
  {
    id: "t5",
    title: "Follow up with David Kim on references",
    candidate: "David Kim",
    dueDate: "2026-02-16",
    priority: "low",
    status: "pending",
    voiceCreated: true,
    category: "voice",
  },
  {
    id: "t6",
    title: "Update compliance training records",
    dueDate: "2026-02-17",
    priority: "medium",
    status: "pending",
    voiceCreated: false,
    category: "compliance",
  },
]

export const initialCandidates: Candidate[] = [
  {
    id: "c1",
    name: "Sarah Chen",
    role: "Senior Frontend Engineer",
    experience: "6 years",
    matchScore: 92,
    status: "interview",
    lastUpdated: "2026-02-12",
    email: "sarah.chen@email.com",
    phone: "(555) 234-5678",
    skills: [
      { name: "React", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Next.js", level: 85 },
      { name: "CSS/Tailwind", level: 88 },
    ],
    interviewHistory: [
      { date: "2026-02-08", type: "Technical", interviewer: "Alex Rivera", notes: "Strong problem-solving skills, excellent React knowledge" },
      { date: "2026-02-10", type: "HR", interviewer: "Megan Cole", notes: "Great cultural fit, strong communication" },
    ],
    linkedTasks: ["t1"],
  },
  {
    id: "c2",
    name: "Marcus Johnson",
    role: "Product Manager",
    experience: "8 years",
    matchScore: 87,
    status: "interview",
    lastUpdated: "2026-02-11",
    email: "marcus.j@email.com",
    phone: "(555) 345-6789",
    skills: [
      { name: "Product Strategy", level: 92 },
      { name: "Agile/Scrum", level: 88 },
      { name: "Data Analysis", level: 80 },
      { name: "Stakeholder Mgmt", level: 90 },
    ],
    interviewHistory: [
      { date: "2026-02-07", type: "HR", interviewer: "Megan Cole", notes: "Impressive track record at previous companies" },
    ],
    linkedTasks: ["t2"],
  },
  {
    id: "c3",
    name: "Emily Park",
    role: "UX Designer",
    experience: "5 years",
    matchScore: 94,
    status: "offer",
    lastUpdated: "2026-02-10",
    email: "emily.park@email.com",
    phone: "(555) 456-7890",
    skills: [
      { name: "Figma", level: 96 },
      { name: "User Research", level: 90 },
      { name: "Prototyping", level: 92 },
      { name: "Design Systems", level: 88 },
    ],
    interviewHistory: [
      { date: "2026-02-03", type: "Technical", interviewer: "Jordan Lee", notes: "Outstanding portfolio, strong design thinking" },
      { date: "2026-02-05", type: "HR", interviewer: "Megan Cole", notes: "Enthusiastic and well-prepared" },
      { date: "2026-02-09", type: "Final", interviewer: "VP Design", notes: "Recommended for offer" },
    ],
    linkedTasks: ["t4"],
  },
  {
    id: "c4",
    name: "David Kim",
    role: "Backend Engineer",
    experience: "4 years",
    matchScore: 78,
    status: "screening",
    lastUpdated: "2026-02-09",
    email: "david.kim@email.com",
    phone: "(555) 567-8901",
    skills: [
      { name: "Node.js", level: 85 },
      { name: "PostgreSQL", level: 80 },
      { name: "Docker", level: 75 },
      { name: "AWS", level: 70 },
    ],
    interviewHistory: [],
    linkedTasks: ["t5"],
  },
  {
    id: "c5",
    name: "Rachel Torres",
    role: "DevOps Engineer",
    experience: "7 years",
    matchScore: 89,
    status: "applied",
    lastUpdated: "2026-02-13",
    email: "r.torres@email.com",
    phone: "(555) 678-9012",
    skills: [
      { name: "Kubernetes", level: 92 },
      { name: "Terraform", level: 88 },
      { name: "CI/CD", level: 90 },
      { name: "AWS", level: 85 },
    ],
    interviewHistory: [],
    linkedTasks: [],
  },
  {
    id: "c6",
    name: "James Wright",
    role: "Data Analyst",
    experience: "3 years",
    matchScore: 72,
    status: "hired",
    lastUpdated: "2026-02-06",
    email: "j.wright@email.com",
    phone: "(555) 789-0123",
    skills: [
      { name: "SQL", level: 90 },
      { name: "Python", level: 82 },
      { name: "Tableau", level: 85 },
      { name: "Statistics", level: 78 },
    ],
    interviewHistory: [
      { date: "2026-01-20", type: "Technical", interviewer: "Alex Rivera", notes: "Good analytical skills" },
      { date: "2026-01-25", type: "HR", interviewer: "Megan Cole", notes: "Eager to learn and grow" },
      { date: "2026-01-30", type: "Final", interviewer: "VP Data", notes: "Approved for hire" },
    ],
    linkedTasks: [],
  },
]

export const initialInterviews: Interview[] = [
  {
    id: "i1",
    time: "09:00 AM",
    date: "2026-02-13",
    candidateName: "Sarah Chen",
    candidateId: "c1",
    position: "Senior Frontend Engineer",
    type: "Final",
    status: "Likely Hire",
    notes: "Final round with CTO. Focus on system design and architecture decisions.",
  },
  {
    id: "i2",
    time: "11:30 AM",
    date: "2026-02-13",
    candidateName: "Marcus Johnson",
    candidateId: "c2",
    position: "Product Manager",
    type: "Technical",
    status: "Pending",
    notes: "Case study presentation. Evaluate product thinking and prioritization skills.",
  },
  {
    id: "i3",
    time: "02:00 PM",
    date: "2026-02-14",
    candidateName: "Rachel Torres",
    candidateId: "c5",
    position: "DevOps Engineer",
    type: "HR",
    status: "Pending",
    notes: "Initial screening. Discuss experience with cloud infrastructure and team fit.",
  },
  {
    id: "i4",
    time: "10:00 AM",
    date: "2026-02-15",
    candidateName: "David Kim",
    candidateId: "c4",
    position: "Backend Engineer",
    type: "Technical",
    status: "Pending",
    notes: "Live coding session. Focus on API design and database optimization.",
  },
]

// ─── Pipeline Data ───────────────────────────────────────
export const pipelineStages = [
  { name: "Applications Received", count: 42 },
  { name: "Screening", count: 28 },
  { name: "Interview", count: 15 },
  { name: "Offer Extended", count: 5 },
  { name: "Hired", count: 3 },
]

// ─── Report Data ─────────────────────────────────────────
export const reportData = {
  hiringPerformance: [
    { month: "Sep", applications: 38, hires: 4 },
    { month: "Oct", applications: 45, hires: 5 },
    { month: "Nov", applications: 52, hires: 3 },
    { month: "Dec", applications: 41, hires: 6 },
    { month: "Jan", applications: 60, hires: 7 },
    { month: "Feb", applications: 42, hires: 3 },
  ],
  conversionRate: 16.7,
  taskCompletionRate: 82,
  avgTimeToHire: 23,
}

// ─── API Placeholder Functions ───────────────────────────
export async function fetchDashboardMetrics() {
  return {
    todayInterviews: 2,
    pendingTasks: 4,
    activeCandidates: 6,
    openPositions: 8,
  }
}

export async function fetchCandidates() {
  return initialCandidates
}

export async function fetchInterviews() {
  return initialInterviews
}

export async function fetchTasks() {
  return initialTasks
}

export async function createTask(task: Omit<HRTask, "id">) {
  return { ...task, id: `t${Date.now()}` }
}

export async function updateTask(id: string, updates: Partial<HRTask>) {
  return { id, ...updates }
}

export async function deleteTask(id: string) {
  return { id }
}

export async function createCandidate(candidate: Omit<Candidate, "id">) {
  return { ...candidate, id: `c${Date.now()}` }
}

export async function scheduleInterview(interview: Omit<Interview, "id">) {
  return { ...interview, id: `i${Date.now()}` }
}
