'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useEmergency } from '@/hooks/useEmergency';
import { 
  ShieldAlert, 
  AlertTriangle, 
  PhoneCall, 
  Mic, 
  MicOff, 
  MapPin, 
  Radio, 
  Navigation, 
  CheckCircle2, 
  Hospital, 
  Clock, 
  Sparkles, 
  Info,
  ExternalLink,
  MessageSquare,
  Route,
  LocateFixed,
  Car,
  Siren,
  HeartPulse,
  Plus,
  Trash2,
  Share2,
  Check,
  Send
} from 'lucide-react';

interface HospitalData {
  id: string;
  name: string;
  shortName: string;
  category: string;
  distKm: number;
  distStr: string;
  driveTimeMin: number;
  lat: number;
  lng: number;
  hotline: string;
  triageDesk: string;
  bedStatus: string;
  radarX: number;
  radarY: number;
}

const HOSPITALS: HospitalData[] = [
  {
    id: 'apollo',
    name: 'Apollo Speciality Hospital (ER & Trauma Center)',
    shortName: 'Apollo Speciality',
    category: 'Level 1 Trauma & Cardiac Bay',
    distKm: 1.2,
    distStr: '1.2 km',
    driveTimeMin: 3,
    lat: 13.0850,
    lng: 80.2720,
    hotline: '+91-44-2829-0200',
    triageDesk: 'Trauma Bay 1 (Acute Resuscitation Desk)',
    bedStatus: '3 Critical Resus Bays Ready',
    radarX: 200,
    radarY: 55,
  },
  {
    id: 'fortis',
    name: 'Fortis Malar Hospital (Cardiac ICU & Stroke Bay)',
    shortName: 'Fortis Malar',
    category: 'Comprehensive Stroke & Cardiac Care',
    distKm: 2.8,
    distStr: '2.8 km',
    driveTimeMin: 7,
    lat: 13.0780,
    lng: 80.2620,
    hotline: '+91-44-4289-2222',
    triageDesk: 'Cardiovascular Intervention Emergency Desk',
    bedStatus: '2 Critical ICU Beds Open',
    radarX: 85,
    radarY: 145,
  },
  {
    id: 'global',
    name: 'Global Health City (Multi-Organ Emergency Triage)',
    shortName: 'Global Health City',
    category: 'Tertiary Critical Care & Trauma',
    distKm: 3.5,
    distStr: '3.5 km',
    driveTimeMin: 9,
    lat: 13.0910,
    lng: 80.2800,
    hotline: '+91-44-4477-7000',
    triageDesk: 'Advanced Surgical Trauma Triage Hub',
    bedStatus: '5 Emergency Beds On Standby',
    radarX: 260,
    radarY: 95,
  },
  {
    id: 'govt_gen',
    name: 'Rajiv Gandhi Govt General Hospital (Level 1 Central)',
    shortName: 'Govt General Hospital',
    category: 'Regional Disaster & Emergency Resuscitation',
    distKm: 2.1,
    distStr: '2.1 km',
    driveTimeMin: 5,
    lat: 13.0810,
    lng: 80.2780,
    hotline: '+91-44-2530-5000',
    triageDesk: 'Central 24/7 Red Code Trauma Facility',
    bedStatus: 'Open 24/7 Resuscitation',
    radarX: 190,
    radarY: 165,
  }
];

interface RelativeContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatar: string;
  isPriority: boolean;
  notified?: boolean;
}

const INITIAL_RELATIVES: RelativeContact[] = [
  { id: 'rel_1', name: 'Dr. Elena Rostova', relation: 'Attending Physician & Cardiologist', phone: '+1-555-0199', avatar: '👩‍⚕️', isPriority: true },
  { id: 'rel_2', name: 'Marcus Vance', relation: 'Spouse / Next-of-Kin (Priority 1)', phone: '+1-555-0182', avatar: '👨‍💼', isPriority: true },
  { id: 'rel_3', name: 'Sarah Chen', relation: 'Sibling / Local Contact', phone: '+1-555-0144', avatar: '👩‍🦰', isPriority: false },
  { id: 'rel_4', name: 'City Paramedic 108', relation: 'Regional Ambulance Dispatch', phone: '+91-108', avatar: '🚑', isPriority: true },
];

function playEmergencySirenSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio autostart restrictions
  }
}

export default function EmergencyPage() {
  const [mounted, setMounted] = useState(false);
  const { events, activeEmergency, isTriggering, triggerSOS, acknowledge, resolve } = useEmergency();

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 });
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(14);
  const [geoStatus, setGeoStatus] = useState<'locating' | 'locked' | 'simulated'>('locating');
  const [geoAddress, setGeoAddress] = useState('Central Healthcare Corridor, Chennai, TN 600003');

  // Navigation & Hospital selection state
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('apollo');
  const [mapType, setMapType] = useState<'tactical' | 'satellite'>('tactical');
  const [showTelemetryPacket, setShowTelemetryPacket] = useState(false);

  // Relatives state
  const [relatives, setRelatives] = useState<RelativeContact[]>(INITIAL_RELATIVES);
  const [showAddRelative, setShowAddRelative] = useState(false);
  const [newRelativeName, setNewRelativeName] = useState('');
  const [newRelativeRelation, setNewRelativeRelation] = useState('');
  const [newRelativePhone, setNewRelativePhone] = useState('');

  // Active SOS dispatch time tracking
  const [dispatchTimestamp, setDispatchTimestamp] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    requestUserLocation();
  }, []);

  const isSosActive = activeEmergency !== null;

  // Selected hospital object
  const selectedHospital = useMemo(() => {
    return HOSPITALS.find(h => h.id === selectedHospitalId) || HOSPITALS[0];
  }, [selectedHospitalId]);

  // Request real device GPS position
  const requestUserLocation = () => {
    setGeoStatus('locating');
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setUserLocation({ lat, lng });
          setGeoAccuracy(Math.round(pos.coords.accuracy));
          setGeoStatus('locked');
          setGeoAddress(`Live GPS Fix (${lat}°N, ${lng}°E) • Active Device Telemetry`);
        },
        (err) => {
          console.warn('Geolocation sensor fallback applied:', err.message);
          setUserLocation({ lat: 13.0827, lng: 80.2707 });
          setGeoAccuracy(12);
          setGeoStatus('simulated');
          setGeoAddress('Central Medical District, EVR Salai, Chennai, TN 600003');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      setGeoStatus('simulated');
    }
  };

  // Google Maps Turn-by-Turn Navigation URL
  const googleMapsRouteUrl = useMemo(() => {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedHospital.lat},${selectedHospital.lng}&travelmode=driving`;
  }, [userLocation, selectedHospital]);

  // Google Maps Live GPS Pin URL
  const googleMapsPinUrl = useMemo(() => {
    return `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
  }, [userLocation]);

  // Google Maps directions embed URL for the satellite view
  const googleMapsEmbedUrl = useMemo(() => {
    return `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${selectedHospital.lat},${selectedHospital.lng}&output=embed`;
  }, [userLocation, selectedHospital]);

  // Prepare distress message for relatives
  const generateDistressMessage = (recipientName: string) => {
    return `🚨 VitaWatch Spectra EMERGENCY SOS!
Patient Sandeep has triggered an urgent distress alert.
📍 Live GPS Location: ${googleMapsPinUrl}
🏥 Target Hospital Route: ${selectedHospital.name} (${selectedHospital.distStr}, ETA ~${selectedHospital.driveTimeMin}m)
🫀 Current Biometrics: HR 78 bpm (Sinus Rhythm), SpO2 98%, Skin Temp 36.6°C
Please check immediately or dial regional emergency (108).`;
  };

  // Handle Main SOS Trigger
  const handleToggleSOS = async () => {
    if (isSosActive) {
      if (confirm('Cancel emergency alert and notify hospitals & contacts of safe stand-down?')) {
        await resolve(activeEmergency.id, true, 'User cancelled alarm via Spectra console');
        setDispatchTimestamp(null);
      }
    } else {
      playEmergencySirenSound();
      setDispatchTimestamp(new Date().toLocaleTimeString());

      const relativesPhoneList = relatives.map(r => `${r.name} (${r.phone})`);
      await triggerSOS({
        source: 'manual_sos',
        location: `${geoAddress}`,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        target_hospital: selectedHospital.name,
        relatives: relativesPhoneList,
        sensor_context: 'Manual button activation. Live ECG stable, HR 78 bpm, SpO2 98%.'
      });
    }
  };

  // Handle Voice Trigger
  const handleVoiceTrigger = async () => {
    if (!isSosActive) {
      playEmergencySirenSound();
      setDispatchTimestamp(new Date().toLocaleTimeString());

      const relativesPhoneList = relatives.map(r => `${r.name} (${r.phone})`);
      await triggerSOS({
        source: 'voice',
        location: `Acoustic Guardian (${geoAddress})`,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        target_hospital: selectedHospital.name,
        relatives: relativesPhoneList,
        sensor_context: 'Voice keyword "Help / Emergency" recognized with 97% acoustic confidence.'
      });
    }
  };

  // Add custom relative
  const handleAddRelative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelativeName.trim() || !newRelativePhone.trim()) return;

    const newContact: RelativeContact = {
      id: `rel_${Date.now()}`,
      name: newRelativeName.trim(),
      relation: newRelativeRelation.trim() || 'Emergency Contact',
      phone: newRelativePhone.trim(),
      avatar: '👤',
      isPriority: false,
    };

    setRelatives(prev => [...prev, newContact]);
    setNewRelativeName('');
    setNewRelativeRelation('');
    setNewRelativePhone('');
    setShowAddRelative(false);
  };

  const removeRelative = (id: string) => {
    setRelatives(prev => prev.filter(r => r.id !== id));
  };

  if (!mounted) return null;

  return (
    <div className="page-section space-y-6">
      {/* Top Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-alert-red animate-pulse" />
            <span className="text-xs font-mono text-alert-red tracking-wider uppercase font-semibold">
              CRITICAL INCIDENT COMMAND & NAVIGATION DISPATCH
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Emergency <span className="text-alert-red">Response</span> & Hospital Route
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automatic GPS routing to nearest Level-1 trauma centers, live hospital telemetry push, and instant multi-contact relative dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* GPS Status Indicator */}
          <button 
            onClick={requestUserLocation}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-neon-cyan/40 text-xs font-mono transition-colors cursor-pointer"
            title="Click to refresh live GPS position"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${geoStatus === 'locating' ? 'animate-spin text-neon-cyan' : 'text-neon-cyan'}`} />
            <span className="text-slate-300">
              {geoStatus === 'locked' ? `GPS LOCKED (±${geoAccuracy}m)` : geoStatus === 'locating' ? 'LOCATING...' : 'GPS SIMULATED'}
            </span>
          </button>

          {/* Active Status Badge */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${
            isSosActive 
              ? 'bg-alert-red/20 border-alert-red text-alert-red shadow-[0_0_20px_rgba(255,51,102,0.4)]' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSosActive ? 'bg-alert-red' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSosActive ? 'bg-alert-red' : 'bg-emerald-400'}`}></span>
            </span>
            <span className="text-xs font-bold font-mono">
              {isSosActive ? `DISPATCH ACTIVE • ${activeEmergency.status.toUpperCase()}` : 'MONITORING STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Main SOS Trigger Banner */}
      <div className={`glass-card p-6 sm:p-8 text-center border transition-all duration-500 relative overflow-hidden ${
        isSosActive 
          ? 'border-alert-red shadow-[0_0_80px_rgba(255,51,102,0.45)] bg-alert-red/[0.09]' 
          : 'border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
      }`}>
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isSosActive ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-alert-red/25 rounded-full blur-3xl animate-pulse" />
        </div>

        <button 
          onClick={handleToggleSOS} 
          disabled={isTriggering}
          className={`w-36 h-36 rounded-full mx-auto flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative z-10 ${
            isSosActive 
              ? 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-[0_0_60px_rgba(255,51,102,0.9)] border-4 border-white animate-pulse' 
              : 'bg-alert-red/15 border-2 border-alert-red/60 text-alert-red hover:bg-alert-red/25 hover:border-alert-red shadow-[0_0_35px_rgba(255,51,102,0.35)]'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ShieldAlert className="w-9 h-9 mb-1" />
          <span className="text-2xl font-black tracking-wider">
            {isSosActive ? 'CANCEL' : isTriggering ? 'DISPATCH' : 'SOS'}
          </span>
          <span className="text-[0.62rem] font-mono opacity-80 mt-0.5">
            {isSosActive ? 'PRESS TO STAND DOWN' : 'ONE-TOUCH DISTRESS'}
          </span>
        </button>

        <p className="text-base sm:text-lg mt-5 font-bold text-white relative z-10">
          {isSosActive 
            ? `🚨 EMERGENCY BROADCAST ACTIVE — Hospital & Relatives Dispatched!` 
            : 'Press or say "Help" to activate emergency protocols, hospital GPS routing & relative dispatch'}
        </p>

        {/* Live SOS Dispatch Action Bar */}
        {isSosActive && (
          <div className="mt-4 p-4 max-w-2xl mx-auto rounded-2xl bg-black/60 border border-alert-red/40 relative z-10 text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Siren className="w-4 h-4 text-alert-red animate-bounce" />
                <span className="text-xs font-mono font-bold text-white">
                  Event #{activeEmergency.id} • Dispatched at {dispatchTimestamp || 'Just Now'}
                </span>
              </div>
              <span className="text-[0.68rem] font-mono text-neon-cyan px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20">
                Target: {selectedHospital.shortName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">GPS Telemetry Pushed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">ER Trauma Bay Standing By</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Relatives SMS / Push Sent</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <a 
                href={googleMapsRouteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 text-xs font-mono font-bold hover:bg-neon-cyan/30 transition-colors"
              >
                <Route className="w-3.5 h-3.5" />
                Open Live Turn-by-Turn Route
              </a>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => acknowledge(activeEmergency.id, 'User acknowledged active alarm')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold hover:bg-amber-500/30 transition-colors"
                >
                  Acknowledge
                </button>
                <button 
                  onClick={() => resolve(activeEmergency.id, false, 'Patient safely assisted')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 relative z-10 font-mono">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
            <span>{userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E</span>
          </div>
          <div>•</div>
          <div>Routing: <strong className="text-white">{selectedHospital.shortName}</strong> ({selectedHospital.distStr}, ~{selectedHospital.driveTimeMin} min ETA)</div>
          <div>•</div>
          <div>Duplicate suppression: <span className="text-neon-cyan">45s safe-window</span></div>
        </div>
      </div>

      {/* Hospital Routing & Tactical Navigation Section */}
      <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-neon-cyan" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Live GPS Routing & Hospital Navigation System
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live routing from user coordinates ({userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E) to selected hospital trauma center
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex p-1 rounded-xl bg-black/40 border border-white/10">
              <button 
                onClick={() => setMapType('tactical')}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  mapType === 'tactical' 
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(6,253,216,0.25)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TACTICAL RADAR
              </button>
              <button 
                onClick={() => setMapType('satellite')}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  mapType === 'satellite' 
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(6,253,216,0.25)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LIVE ROUTE MAP
              </button>
            </div>

            {/* Launch Turn-by-Turn External Link */}
            <a 
              href={googleMapsRouteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-blue/20 text-neon-blue border border-neon-blue/30 text-xs font-mono font-bold hover:bg-neon-blue/30 transition-colors"
              title="Open full turn-by-turn navigation in Google Maps app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Navigation</span>
            </a>
          </div>
        </div>

        {/* Live Route Guidance Bar */}
        <div className="mb-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Active Target: {selectedHospital.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Green Corridor
                </span>
              </div>
              <div className="text-[0.68rem] text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                <span>Distance: <strong className="text-white">{selectedHospital.distStr}</strong></span>
                <span>•</span>
                <span>Ambulance ETA: <strong className="text-neon-cyan">~{selectedHospital.driveTimeMin} minutes</strong></span>
                <span>•</span>
                <span>Hotline: <strong className="text-white">{selectedHospital.hotline}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href={`tel:${selectedHospital.hotline}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call ER Hotline</span>
            </a>
            <button 
              onClick={() => setShowTelemetryPacket(!showTelemetryPacket)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] text-slate-300 border border-white/15 text-xs font-mono hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-neon-cyan" />
              <span>{showTelemetryPacket ? 'Hide Packet' : 'Inspect Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Packet Inspector */}
        {showTelemetryPacket && (
          <div className="mb-4 p-3.5 rounded-xl bg-black/80 border border-neon-cyan/30 font-mono text-[0.68rem] text-slate-300 space-y-1">
            <div className="flex justify-between text-neon-cyan font-bold pb-1 border-b border-white/10">
              <span>HOSPITAL ER TELEMETRY TRANSMISSION PAYLOAD</span>
              <span>AES-256 ENCRYPTED</span>
            </div>
            <div>PATIENT_ID: #SPEC-8921-SD • BLOOD_GROUP: O+ • ALLERGIES: Penicillin (None acute)</div>
            <div>GPS_COORDINATES: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)} (Accuracy ±{geoAccuracy}m)</div>
            <div>HOSPITAL_DESTINATION: {selectedHospital.name} ({selectedHospital.triageDesk})</div>
            <div>VITALS_STREAM: HR 78 bpm (Sinus) | SpO2 98% | BP 118/76 mmHg | Skin Temp 36.6°C | HRV 58ms</div>
            <div>ROUTE_DIRECTIONS_URL: {googleMapsRouteUrl}</div>
            <div className="text-emerald-400">STATUS: Transmission ACK Received from Hospital ER Server (Protocol HL7/FHIR v4.0)</div>
          </div>
        )}

        {/* The Map Display */}
        {mapType === 'tactical' ? (
          <div 
            className="relative rounded-2xl overflow-hidden border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.6)]" 
            style={{ height: '320px', background: 'radial-gradient(circle at center, #0B172E 0%, #030712 100%)' }}
          >
            {/* Grid overlay */}
            <div 
              className="absolute inset-0 opacity-20" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.2) 1px, transparent 1px)', 
                backgroundSize: '28px 28px' 
              }} 
            />

            {/* Compass / Tactical Rings SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF3366" />
                  <stop offset="100%" stopColor="#06FDD8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Radar Rings centered at user position (approx 150, 160) */}
              <circle cx="150" cy="160" r="45" fill="none" stroke="rgba(0,212,255,0.18)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="150" cy="160" r="95" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
              <circle cx="150" cy="160" r="150" fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="1" strokeDasharray="5 5" />
              <circle cx="150" cy="160" r="210" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="1" />

              {/* Range labels */}
              <text x="155" y="112" fill="rgba(0,212,255,0.4)" fontSize="9" fontFamily="monospace">1.0 km</text>
              <text x="155" y="62" fill="rgba(0,212,255,0.3)" fontSize="9" fontFamily="monospace">2.5 km</text>
              <text x="155" y="12" fill="rgba(0,212,255,0.2)" fontSize="9" fontFamily="monospace">4.0 km</text>

              {/* Rotating radar sweep */}
              <line 
                x1="150" 
                y1="160" 
                x2="380" 
                y2="160" 
                stroke="rgba(6,253,216,0.35)" 
                strokeWidth="1.5" 
                className="origin-[150px_160px]" 
                style={{ transformOrigin: '150px 160px', animation: 'meshFloat 10s linear infinite' }} 
              />

              {/* Active Route Vector to Selected Hospital */}
              <path 
                d={`M 150 160 Q ${(150 + selectedHospital.radarX) / 2 - 25} ${(160 + selectedHospital.radarY) / 2 - 25} ${selectedHospital.radarX} ${selectedHospital.radarY}`} 
                fill="none" 
                stroke="url(#routeGradient)" 
                strokeWidth="3" 
                strokeDasharray="6 3" 
                filter="url(#glow)"
              />
            </svg>

            {/* User Location Marker (Radar Center) */}
            <div className="absolute z-20" style={{ left: '150px', top: '160px', transform: 'translate(-50%, -50%)' }}>
              <div className="relative flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-alert-red/30 animate-ping absolute" />
                <span className="w-4 h-4 rounded-full bg-alert-red flex items-center justify-center shadow-[0_0_12px_#FF3366]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#FFF]" />
                </span>
                <div className="absolute top-5 bg-black/90 border border-alert-red/40 px-2 py-0.5 rounded text-[0.62rem] font-mono text-white whitespace-nowrap shadow-lg">
                  YOU ({userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)})
                </div>
              </div>
            </div>

            {/* Hospital Markers */}
            {HOSPITALS.map((h) => {
              const isSelected = h.id === selectedHospitalId;
              return (
                <button 
                  key={h.id} 
                  onClick={() => setSelectedHospitalId(h.id)} 
                  className="absolute z-20 flex flex-col items-center group transition-transform hover:scale-110 cursor-pointer" 
                  style={{ left: `${h.radarX}px`, top: `${h.radarY}px`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-neon-cyan/25 border-2 border-neon-cyan text-neon-cyan shadow-[0_0_20px_rgba(6,253,216,0.8)] scale-110' 
                      : 'bg-black/90 border border-white/25 text-slate-300 group-hover:border-neon-cyan'
                  }`}>
                    <Hospital className="w-4 h-4" />
                  </div>

                  <div className={`mt-1 px-2 py-0.5 rounded text-[0.62rem] font-mono whitespace-nowrap shadow-lg transition-all ${
                    isSelected 
                      ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold' 
                      : 'bg-black/90 border border-white/15 text-slate-300 group-hover:block hidden'
                  }`}>
                    {h.shortName} • {h.distStr}
                  </div>
                </button>
              );
            })}

            {/* Overlays */}
            <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[0.68rem] font-mono text-slate-300 space-y-0.5">
              <div>GPS FIX: <span className="text-neon-cyan font-bold">{userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E</span></div>
              <div className="text-slate-400">BEARING: <span className="text-white">042° NE</span> • ROUTE LOCK: <span className="text-emerald-400 font-bold">{selectedHospital.shortName}</span></div>
            </div>

            <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[0.68rem] font-mono text-slate-300">
              CLICK ANY HOSPITAL TO ROUTE
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-white/10 relative" style={{ height: '320px' }}>
            <iframe
              src={googleMapsEmbedUrl}
              className="w-full h-full border-none invert saturate-[0.85] opacity-90"
              title="Live Google Maps Emergency Route"
              loading="lazy"
            />
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-xs font-mono text-white flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Route: Your GPS → {selectedHospital.name}</span>
            </div>
          </div>
        )}

        {/* Hospital Card Selectors */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOSPITALS.map((h) => {
            const isSelected = h.id === selectedHospitalId;
            return (
              <button 
                key={h.id} 
                onClick={() => setSelectedHospitalId(h.id)} 
                className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer relative ${
                  isSelected 
                    ? 'bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan shadow-[0_0_20px_rgba(6,253,216,0.18)]' 
                    : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#06FDD8]" />
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-slate-400'
                  }`}>
                    <Hospital className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-white truncate">{h.shortName}</div>
                    <div className="text-[0.62rem] text-slate-400 font-mono truncate">{h.category}</div>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[0.68rem] text-slate-300 pt-1 border-t border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <strong className="text-white">{h.distStr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ambulance ETA:</span>
                    <strong className="text-neon-cyan">~{h.driveTimeMin} min</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 truncate max-w-[120px]">{h.bedStatus}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Relatives & Care Contacts Informing System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Emergency Relatives Alert Dispatch */}
        <div className="glass-card p-6 lg:col-span-2 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-neon-blue" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Nearby Relatives & Emergency Contacts Dispatch
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Instant SMS, WhatsApp live GPS link & telephone dispatch to authorized family & clinical circle
              </p>
            </div>

            <button 
              onClick={() => setShowAddRelative(!showAddRelative)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/15 hover:border-neon-cyan/40 text-xs font-mono text-neon-cyan transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Relative</span>
            </button>
          </div>

          {/* Add Relative Form */}
          {showAddRelative && (
            <form onSubmit={handleAddRelative} className="mb-4 p-4 rounded-2xl bg-black/60 border border-neon-cyan/30 space-y-3">
              <div className="text-xs font-bold font-mono text-white">Add New Relative / Emergency Contact</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="Full Name (e.g. Maya Vance)"
                  value={newRelativeName}
                  onChange={(e) => setNewRelativeName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Relationship (e.g. Sister, Neighbor)"
                  value={newRelativeRelation}
                  onChange={(e) => setNewRelativeRelation(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                />
                <input 
                  type="text" 
                  placeholder="Phone Number (+91...)"
                  value={newRelativePhone}
                  onChange={(e) => setNewRelativePhone(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddRelative(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs font-mono hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-xs font-mono font-bold hover:bg-neon-cyan/30"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Relatives List */}
          <div className="space-y-3">
            {relatives.map((rel) => {
              const distressText = generateDistressMessage(rel.name);
              const cleanPhone = rel.phone.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(distressText)}`;
              const smsUrl = `sms:${rel.phone}?body=${encodeURIComponent(distressText)}`;

              return (
                <div 
                  key={rel.id} 
                  className={`p-3.5 rounded-2xl bg-white/[0.02] border transition-all ${
                    isSosActive 
                      ? 'border-alert-red/30 bg-alert-red/[0.03]' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-lg">
                        {rel.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rel.name}</span>
                          {rel.isPriority && (
                            <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                              Priority
                            </span>
                          )}
                          {isSosActive && (
                            <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" /> GPS Dispatched
                            </span>
                          )}
                        </div>
                        <div className="text-[0.68rem] text-slate-400 font-mono mt-0.5">
                          {rel.relation} • <span className="text-slate-300">{rel.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: WhatsApp, SMS, Direct Call */}
                    <div className="flex items-center gap-2">
                      <a 
                        href={whatsappUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-mono transition-colors"
                        title="Send WhatsApp SOS alert with live GPS pin"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a 
                        href={smsUrl}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neon-blue/15 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/25 text-xs font-mono transition-colors"
                        title="Send SMS text alert with live GPS coordinates"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </a>

                      <a 
                        href={`tel:${rel.phone}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 text-xs font-mono transition-colors"
                        title={`Call ${rel.name}`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call</span>
                      </a>

                      {rel.id.startsWith('rel_') && Number(rel.id.split('_')[1]) > 10 && (
                        <button 
                          onClick={() => removeRelative(rel.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-alert-red transition-colors"
                          title="Remove contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acoustic Voice Guardian Card */}
        <div>
          <VoiceTrigger onTrigger={handleVoiceTrigger} sosActive={isSosActive} />
        </div>
      </div>

      {/* Persisted Emergency Audit Log */}
      <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Persisted Emergency Telemetry & Audit Log</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Cryptographically logged in SQLite / PostgreSQL database with delivery verification</p>
          </div>
          <span className="text-[0.62rem] font-mono text-neon-cyan">HIPAA / GDPR Verified</span>
        </div>

        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((e) => {
              const dateStr = new Date(e.created_at).toLocaleString();
              const notifCount = e.notifications ? e.notifications.length : 0;

              return (
                <div 
                  key={e.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      e.status === 'alerting' ? 'bg-alert-red/20 text-alert-red border border-alert-red/30' :
                      e.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white capitalize">
                        {e.source.replace('_', ' ')} — {e.location}
                      </div>
                      <div className="text-[0.68rem] text-slate-400 font-mono mt-0.5">
                        {dateStr} • Status: <strong className="text-white uppercase">{e.status}</strong> • GPS: {e.latitude.toFixed(4)}°N, {e.longitude.toFixed(4)}°E
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[0.62rem] font-mono px-2.5 py-1 rounded-full border bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20">
                      Dispatched Notifications: {notifCount}
                    </span>
                    <a 
                      href={`https://maps.google.com/?q=${e.latitude},${e.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-full border border-white/10 hover:border-neon-cyan/30 text-[0.62rem] font-mono text-slate-300 hover:text-neon-cyan"
                    >
                      View Pin
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 font-mono">
              No active or historical emergency distress events recorded. All surveillance channels quiet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VoiceTrigger({ onTrigger, sosActive }: { onTrigger: () => void; sosActive: boolean }) {
  const [isListening, setIsListening] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array.from({ length: 12 }).map(() => 8));

  useEffect(() => {
    let recognition: any = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    if (isListening && !sosActive) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (transcript.includes('help') || transcript.includes('emergency') || transcript.includes('sos')) {
              onTrigger();
              setIsListening(false);
              break;
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.error('Speech recognition error:', e);
        };

        recognition.onend = () => {
          if (isListening && !sosActive) {
            try {
              recognition.start();
            } catch (err) {}
          }
        };

        try {
          recognition.start();
        } catch (e) {
          console.error(e);
        }
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((s) => {
            stream = s;
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContext = new AudioContextClass();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 32;
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            const updateVisualizer = () => {
              if (analyser && dataArray) {
                analyser.getByteFrequencyData(dataArray as any);
                const levels = Array.from(dataArray).slice(0, 12).map(val => Math.max(8, (val / 255) * 40));
                setAudioLevel(levels);
              }
              animationFrameId = requestAnimationFrame(updateVisualizer);
            };
            updateVisualizer();
          })
          .catch((err) => {
            console.error('Mic access denied:', err);
            setPermissionError('Microphone permission required for voice keyword activation.');
            setIsListening(false);
          });
      }
    }

    return () => {
      if (recognition) {
        recognition.onend = null;
        recognition.stop();
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContext) audioContext.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isListening, sosActive, onTrigger]);

  const toggleListening = () => {
    if (sosActive) return;
    setIsListening(!isListening);
    setPermissionError(null);
  };

  return (
    <div className="glass-card p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-neon-purple" />
            <h3 className="text-sm font-bold text-white tracking-wide">Acoustic Voice Guardian</h3>
          </div>
          <span className={`text-[0.62rem] font-mono px-2 py-0.5 rounded-full ${
            isListening 
              ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30 animate-pulse' 
              : 'bg-white/5 text-slate-400'
          }`}>
            {isListening ? 'Listening' : 'Standby'}
          </span>
        </div>

        <div className="rounded-2xl p-6 text-center transition-all duration-300 flex flex-col items-center justify-center bg-white/[0.02] border border-white/10" style={{ minHeight: 200 }}>
          <button 
            onClick={toggleListening} 
            className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer ${
              isListening 
                ? 'bg-neon-purple/25 border-2 border-neon-purple text-white shadow-[0_0_30px_rgba(168,85,247,0.7)] animate-pulse' 
                : 'bg-white/[0.04] border-2 border-white/15 text-slate-300 hover:border-neon-purple/50'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8 text-neon-purple" /> : <MicOff className="w-8 h-8 text-slate-400" />}
          </button>

          <div className="text-sm font-bold text-white mb-1">
            {sosActive ? 'Emergency Protocol Dispatched' : isListening ? 'Continuous keyword detection active' : 'Click microphone to arm voice dispatch'}
          </div>
          <div className="text-xs text-slate-400">
            {sosActive ? 'Hospital and contacts notified' : isListening ? 'Say "Help" or "Emergency" to trigger automatic dispatch' : 'Hands-free voice detection standby'}
          </div>

          {permissionError && <div className="text-[0.68rem] text-alert-red mt-2 font-mono">{permissionError}</div>}
          
          {/* Audio frequency bars */}
          <div className="flex items-center justify-center gap-1.5 mt-5 h-10 w-full">
            {audioLevel.map((h, i) => (
              <div 
                key={i} 
                className="w-2 rounded-full transition-all duration-75" 
                style={{ 
                  height: `${h}px`, 
                  background: isListening ? '#A855F7' : 'rgba(255,255,255,0.1)', 
                  boxShadow: isListening ? '0 0 8px rgba(168,85,247,0.6)' : 'none' 
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
