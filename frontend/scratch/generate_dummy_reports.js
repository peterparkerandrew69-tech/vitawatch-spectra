const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../../vitawatch_dummy_reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Vitals Telemetry
let vitals = 'Timestamp,Heart_Rate_BPM,HRV_ms,SpO2_Percent,Respiration_Rate,Body_Temp_C,Stress_Score\n';
let date = new Date('2026-05-10T08:00:00');
for (let i = 0; i < 1440; i++) { // 24 hours minute-by-minute
  let hr = Math.round(65 + Math.random() * 15 + (i > 600 && i < 700 ? 25 : 0)); // Exercise spike
  let hrv = Math.round(50 + Math.random() * 20 - (hr > 85 ? 15 : 0));
  let spo2 = Math.round(97 + Math.random() * 3);
  let resp = Math.round(12 + Math.random() * 4);
  let temp = (36.5 + Math.random() * 0.4).toFixed(1);
  let stress = Math.round(15 + Math.random() * 20 + (hr > 85 ? 30 : 0));
  vitals += `${date.toISOString()},${hr},${hrv},${spo2},${resp},${temp},${stress}\n`;
  date.setMinutes(date.getMinutes() + 1);
}
fs.writeFileSync(path.join(outputDir, 'vitals_telemetry.csv'), vitals);

// 2. Sleep Analytics
let sleep = 'Date,Total_Sleep_Hours,Deep_Sleep_Hours,REM_Sleep_Hours,Light_Sleep_Hours,Awake_Minutes,Sleep_Quality_Score\n';
for (let d = 1; d <= 7; d++) {
  let total = (6.5 + Math.random() * 2).toFixed(1);
  let deep = (1.2 + Math.random() * 0.8).toFixed(1);
  let rem = (1.0 + Math.random() * 0.6).toFixed(1);
  let light = (parseFloat(total) - parseFloat(deep) - parseFloat(rem)).toFixed(1);
  let awake = Math.round(10 + Math.random() * 30);
  let score = Math.round(70 + Math.random() * 25);
  sleep += `2026-05-0${d},${total},${deep},${rem},${light},${awake},${score}\n`;
}
fs.writeFileSync(path.join(outputDir, 'sleep_analytics.csv'), sleep);

// 3. Mood and Stress Logs
let mood = 'Timestamp,Mood_State,Stress_Level_1_100,Activity,Energy_Level_1_10\n';
const activities = ['Working', 'Exercising', 'Relaxing', 'Eating', 'Commuting', 'Socializing'];
const moods = ['Focused', 'Calm', 'Energetic', 'Anxious', 'Tired', 'Happy'];
let moodDate = new Date('2026-05-10T09:00:00');
for (let i = 0; i < 30; i++) {
  let act = activities[Math.floor(Math.random() * activities.length)];
  let md = moods[Math.floor(Math.random() * moods.length)];
  let stress = Math.round(20 + Math.random() * 60);
  let energy = Math.round(4 + Math.random() * 5);
  mood += `${moodDate.toISOString()},${md},${stress},${act},${energy}\n`;
  moodDate.setHours(moodDate.getHours() + 6);
}
fs.writeFileSync(path.join(outputDir, 'mood_stress_logs.csv'), mood);

// 4. Cognitive Performance Lab
let cognitive = 'Test_Date,Reaction_Time_ms,Target_Hits,Accuracy_Percent,Focus_Score_1_100,Reflex_Rating\n';
for (let d = 1; d <= 10; d++) {
  let rt = Math.round(180 + Math.random() * 120);
  let hits = Math.round(15 + Math.random() * 10);
  let acc = Math.round(85 + Math.random() * 15);
  let focus = Math.round(75 + Math.random() * 25);
  let rating = rt < 210 ? 'Elite' : rt < 250 ? 'Superior' : rt < 290 ? 'Average' : 'Fatigued';
  cognitive += `2026-05-${d < 10 ? '0' + d : d},${rt},${hits},${acc},${focus},${rating}\n`;
}
fs.writeFileSync(path.join(outputDir, 'cognitive_performance.csv'), cognitive);

// 5. Emergency Incident Log
let emergency = 'Timestamp,Incident_Type,Detected_Location,Fall_Severity,GPS_Coordinates,Resolution_Status\n';
emergency += '2026-05-17T14:32:00Z,Fall Detected,Kitchen,Critical,"13.0827° N, 80.2707° E",Responded\n';
emergency += '2026-05-16T09:15:00Z,Fall Detected,Bathroom,Warning,"13.0825° N, 80.2705° E",Auto-cleared\n';
emergency += '2026-05-14T18:40:00Z,Fall Detected,Stairs,Warning,"13.0829° N, 80.2709° E",Responded\n';
emergency += '2026-05-11T22:10:00Z,Cardiac Warning,Living Room,Critical,"13.0827° N, 80.2707° E",Responded\n';
fs.writeFileSync(path.join(outputDir, 'emergency_incidents.csv'), emergency);

console.log('Dummy reports successfully generated in /vitawatch_dummy_reports');
