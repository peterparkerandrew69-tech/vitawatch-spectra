// ===== VITAWATCH SPECTRA — MOCK DATA GENERATORS =====

export function generateHeartRateData(points = 60): number[] {
  const data: number[] = [];
  let base = 72;
  for (let i = 0; i < points; i++) {
    base += (Math.random() - 0.5) * 6;
    base = Math.max(58, Math.min(110, base));
    data.push(Math.round(base));
  }
  return data;
}

export function generateECGPath(width: number, height: number, points = 200): string {
  const step = width / points;
  const mid = height / 2;
  let path = `M 0 ${mid}`;
  for (let i = 1; i < points; i++) {
    const x = i * step;
    const cycle = i % 40;
    let y = mid;
    if (cycle === 15) y = mid - height * 0.1;
    else if (cycle === 17) y = mid - height * 0.45;
    else if (cycle === 18) y = mid + height * 0.3;
    else if (cycle === 19) y = mid - height * 0.15;
    else if (cycle === 20) y = mid;
    else if (cycle === 25) y = mid - height * 0.08;
    else y = mid + (Math.random() - 0.5) * 3;
    path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path;
}

export function generateStressData(days = 7): { day: string; hours: number[] }[] {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return dayNames.slice(0, days).map(day => ({
    day,
    hours: Array.from({ length: 24 }, () => Math.random()),
  }));
}

export function generateSleepData(): { stage: string; hours: number; color: string }[] {
  return [
    { stage: 'Deep Sleep', hours: 1.5 + Math.random() * 1.5, color: '#6366F1' },
    { stage: 'Light Sleep', hours: 2.5 + Math.random() * 2, color: '#00D4FF' },
    { stage: 'REM', hours: 1 + Math.random() * 1.5, color: '#A855F7' },
    { stage: 'Awake', hours: 0.2 + Math.random() * 0.5, color: '#FF3366' },
  ];
}

export function generateWellnessScore(): number {
  return Math.round(72 + Math.random() * 20);
}

export function generatePredictionData(days = 7): { day: string; score: number; predicted: number }[] {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let actual = 75;
  let predicted = 76;
  return dayNames.slice(0, days).map(day => {
    actual += (Math.random() - 0.45) * 8;
    predicted += (Math.random() - 0.48) * 6;
    actual = Math.max(50, Math.min(100, actual));
    predicted = Math.max(50, Math.min(100, predicted));
    return {
      day,
      score: Math.round(actual),
      predicted: Math.round(predicted),
    };
  });
}

export interface VitalSign {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

export function getVitals(): VitalSign[] {
  return [
    { label: 'Heart Rate', value: `${68 + Math.floor(Math.random() * 15)}`, unit: 'BPM', icon: '❤️', color: '#FF3366', trend: 'stable', status: 'normal' },
    { label: 'Blood Oxygen', value: `${96 + Math.floor(Math.random() * 3)}`, unit: '%', icon: '🫁', color: '#00D4FF', trend: 'up', status: 'normal' },
    { label: 'Blood Pressure', value: `${115 + Math.floor(Math.random() * 10)}/${72 + Math.floor(Math.random() * 8)}`, unit: 'mmHg', icon: '🩸', color: '#A855F7', trend: 'stable', status: 'normal' },
    { label: 'Temperature', value: `${(97.8 + Math.random() * 1.2).toFixed(1)}`, unit: '°F', icon: '🌡️', color: '#FFB800', trend: 'stable', status: 'normal' },
    { label: 'Stress Level', value: `${20 + Math.floor(Math.random() * 40)}`, unit: '%', icon: '🧠', color: '#06FDD8', trend: 'down', status: 'normal' },
    { label: 'Sleep Score', value: `${75 + Math.floor(Math.random() * 20)}`, unit: '/100', icon: '😴', color: '#6366F1', trend: 'up', status: 'normal' },
  ];
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'suggestion';
  icon: string;
}

export function getAIInsights(): AIInsight[] {
  return [
    { id: '1', title: 'Excellent Recovery', description: 'Your HRV has improved 12% this week. Your body is recovering well from recent activities.', type: 'positive', icon: '✨' },
    { id: '2', title: 'Hydration Reminder', description: 'Based on activity patterns, consider increasing water intake by 500ml today.', type: 'suggestion', icon: '💧' },
    { id: '3', title: 'Stress Pattern Detected', description: 'Elevated cortisol indicators between 2-4 PM. Consider a brief meditation session.', type: 'warning', icon: '⚡' },
    { id: '4', title: 'Sleep Optimization', description: 'Moving bedtime 30 minutes earlier could improve your deep sleep by up to 18%.', type: 'suggestion', icon: '🌙' },
    { id: '5', title: 'Activity Goal Progress', description: 'You\'re 85% toward your weekly movement goal. 2,400 more steps to complete it.', type: 'positive', icon: '🎯' },
  ];
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  avatar: string;
}

export function getEmergencyContacts(): EmergencyContact[] {
  return [
    { name: 'Dr. Sarah Chen', relation: 'Primary Doctor', phone: '+1 (555) 234-5678', avatar: '👩‍⚕️' },
    { name: 'James Mitchell', relation: 'Emergency Contact', phone: '+1 (555) 345-6789', avatar: '👤' },
    { name: 'City General Hospital', relation: 'Nearest Hospital', phone: '+1 (555) 911-0000', avatar: '🏥' },
  ];
}

export function generateMoodData(): { mood: string; value: number; color: string }[] {
  return [
    { mood: 'Happy', value: 0.5 + Math.random() * 0.5, color: '#00FF88' },
    { mood: 'Calm', value: 0.4 + Math.random() * 0.5, color: '#00D4FF' },
    { mood: 'Focused', value: 0.3 + Math.random() * 0.6, color: '#A855F7' },
    { mood: 'Energetic', value: 0.3 + Math.random() * 0.5, color: '#FFB800' },
    { mood: 'Stressed', value: Math.random() * 0.5, color: '#FF3366' },
    { mood: 'Tired', value: Math.random() * 0.4, color: '#6366F1' },
  ];
}

export function generateReactionTimes(count = 20): number[] {
  return Array.from({ length: count }, () => 180 + Math.random() * 220);
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  trend: 'up' | 'down' | 'same';
}

export function getLeaderboard(): LeaderboardEntry[] {
  const names = ['Alex Mercer', 'Zara Knight', 'You', 'Kai Tanaka', 'Nova Singh', 'Liam Chen', 'Aria Patel', 'Marcus Holm'];
  return names.map((name, i) => ({
    rank: i + 1,
    name,
    score: Math.round(980 - i * (40 + Math.random() * 30)),
    avatar: name === 'You' ? '🧑' : ['🧑‍💻', '👩‍🔬', '', '🧑‍🎨', '👩‍🚀', '🧑‍💼', '👩‍⚕️', '🧑‍🔧'][i],
    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'same' as const,
  }));
}

export interface CaregiverPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: 'stable' | 'attention' | 'critical';
  heartRate: number;
  lastUpdate: string;
  avatar: string;
}

export function getCaregiverPatients(): CaregiverPatient[] {
  return [
    { id: '1', name: 'Eleanor Richards', age: 78, condition: 'Post-Surgery Recovery', status: 'stable', heartRate: 72, lastUpdate: '2 min ago', avatar: '👵' },
    { id: '2', name: 'Robert Huang', age: 82, condition: 'Cardiac Monitoring', status: 'attention', heartRate: 88, lastUpdate: '5 min ago', avatar: '👴' },
    { id: '3', name: 'Maria Santos', age: 71, condition: 'Diabetes Management', status: 'stable', heartRate: 68, lastUpdate: '1 min ago', avatar: '👵' },
    { id: '4', name: 'William Park', age: 85, condition: 'Fall Risk Assessment', status: 'critical', heartRate: 95, lastUpdate: 'Just now', avatar: '👴' },
  ];
}

export const featureCards = [
  { title: 'Real-Time Vitals', description: 'Continuous monitoring of heart rate, SpO2, blood pressure, and body temperature with AI anomaly detection.', icon: '❤️‍🔥', color: '#FF3366' },
  { title: 'AI Predictions', description: 'Advanced machine learning models predict health trends and potential risks before they emerge.', icon: '🧠', color: '#A855F7' },
  { title: 'Emergency Response', description: 'Instant fall detection, voice-activated SOS, and GPS emergency tracking with auto-alert.', icon: '🚨', color: '#FF3366' },
  { title: 'AR Cognitive Tests', description: 'Augmented reality reaction testing, reflex analysis, and hand-eye coordination challenges.', icon: '👁️', color: '#06FDD8' },
  { title: 'Sleep Intelligence', description: 'Deep analysis of sleep stages, quality scoring, and AI-optimized bedtime recommendations.', icon: '🌙', color: '#6366F1' },
  { title: 'Mood Analytics', description: 'Real-time emotion tracking, burnout risk assessment, and personalized wellness strategies.', icon: '😊', color: '#00FF88' },
];

export const statNumbers = [
  { label: 'Active Users', value: 2400000, suffix: '+', prefix: '' },
  { label: 'Data Points/Day', value: 50000000, suffix: '+', prefix: '' },
  { label: 'AI Accuracy', value: 99.7, suffix: '%', prefix: '' },
  { label: 'Response Time', value: 0.3, suffix: 's', prefix: '<' },
];
