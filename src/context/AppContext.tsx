import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Role,
  LanguageCode,
  DoseSchedule,
  Medication,
  RefillOrder,
  Prescription,
  VitalRecord,
  CareAlert,
  InventoryItem,
  AuditLog,
  UserProfile,
  PatientInfo,
  Appointment,
  ChatMessage,
  NotificationItem,
  OrderStatus,
  PharmacyAlert,
} from '../types';
import { translations, Translations } from '../i18n/translations';

interface AppContextType {
  // Authentication & Role
  activeRole: Role;
  currentUser: UserProfile;
  switchRole: (role: Role) => void;
  isLoggedIn: boolean;
  loginAs: (role: Role) => void;
  logout: () => void;

  // Language & i18n
  language: LanguageCode;
  changeLanguage: (lang: LanguageCode) => void;
  t: Translations;

  // Accessibility
  largeTextMode: boolean;
  setLargeTextMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  highContrastMode: boolean;
  setHighContrastMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Global Shared Data
  patient: PatientInfo;
  otherPatients: PatientInfo[];
  todaySchedule: DoseSchedule[];
  medications: Medication[];
  refillOrders: RefillOrder[];
  prescriptions: Prescription[];
  vitals: VitalRecord[];
  alerts: CareAlert[];
  pharmacyAlerts: PharmacyAlert[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  messages: ChatMessage[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  latestAiSummary: string | null;

  // Actions
  markDoseTaken: (doseId: string) => void;
  markDoseMissed: (doseId: string) => void;
  applyAdaptiveDelay: (doseId: string, delayMinutes: number) => void;
  createRefillOrder: (medicationId: string, priority?: 'routine' | 'urgent', deliveryMethod?: 'pickup' | 'home_delivery') => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  createPrescription: (prescriptionData: Partial<Prescription>) => void;
  updatePrescriptionPharmacyStatus: (id: string, status: 'approved' | 'review_required' | 'rejected' | 'dispensed') => void;
  addVital: (record: Omit<VitalRecord, 'id' | 'timestamp'>) => void;
  addPrescriptionFromScan: (extractedData: {
    medicationName: string;
    dosage: string;
    frequency: string;
    timing: string;
    foodInstruction: string;
    durationDays: number;
  }) => void;
  sendMessage: (receiverRole: Role, text: string) => void;
  triggerEmergencySos: (note?: string) => void;
  generateAiSummary: (patientId?: string) => string;
  markNotificationRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  markPharmacyAlertRead: (id: string) => void;
  deletePharmacyAlert: (id: string) => void;
  addNotification: (
    roleOrItem:
      | Role
      | 'all'
      | {
          role: Role | 'all';
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'alert';
          link?: string;
        },
    title?: string,
    message?: string,
    type?: 'info' | 'success' | 'warning' | 'alert',
    link?: string
  ) => void;
  acknowledgeAlert: (alertId: string) => void;
  updateRefillOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  reorderInventoryStock: (itemId: string, quantity: number) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  cancelAppointment: (id: string) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const DEFAULT_USERS: Record<Role, UserProfile> = {
  patient: {
    id: 'p-20481',
    name: 'Eleanor Vance',
    role: 'patient',
    identifier: 'MED-20481',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    title: 'Patient',
    facilityOrRelationship: 'Primary Care — St. Jude Medical',
    phone: '+1 (555) 392-1084',
    email: 'eleanor.vance@example.com',
    language: 'en',
  },
  caregiver: {
    id: 'c-10024',
    name: 'Daniel Vance',
    role: 'caregiver',
    identifier: 'DEP-REL-20481',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    title: 'Son & Primary Caregiver',
    facilityOrRelationship: 'Family Caregiver for Eleanor Vance',
    phone: '+1 (555) 831-2940',
    email: 'daniel.vance@example.com',
    language: 'en',
  },
  doctor: {
    id: 'd-48201',
    name: 'Dr. Maya Rao, MD',
    role: 'doctor',
    identifier: 'MED-LIC-89410',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    title: 'Attending Cardiologist',
    facilityOrRelationship: 'Metropolitan Heart & Vascular Institute',
    phone: '+1 (555) 912-4422',
    email: 'dr.rao@metrocardio.org',
    language: 'en',
  },
  pharmacy: {
    id: 'ph-77192',
    name: 'PharmD Marcus Chen',
    role: 'pharmacy',
    identifier: 'PHARM-LIC-5521',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    title: 'Supervising Clinical Pharmacist',
    facilityOrRelationship: 'MediCare Central Community Pharmacy',
    phone: '+1 (555) 720-3300',
    email: 'marcus.chen@medicarepharm.com',
    language: 'en',
  },
};

const INITIAL_PATIENT: PatientInfo = {
  id: 'p-20481',
  name: 'Eleanor Vance',
  age: 67,
  gender: 'Female',
  medicalId: 'MED-20481',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
  conditions: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia'],
  allergies: ['Penicillin (Mild Rash)', 'Sulfa Drugs'],
  adherenceRate: 92,
  streakDays: 14,
  lastDoseTime: '8:03 AM Today',
  riskLevel: 'Moderate',
  readmissionRiskPercent: 24,
  lastAppointment: '2 weeks ago (Routine)',
  primaryDoctor: 'Dr. Maya Rao, MD',
  caregiverName: 'Daniel Vance (Son)',
  caregiverPhone: '+1 (555) 831-2940',
  emergencyAddress: '742 Evergreen Terrace, Apt 3B, Springfield',
  emergencyCoords: { lat: 37.7749, lng: -122.4194 },
};

const SECONDARY_PATIENTS: PatientInfo[] = [
  {
    id: 'p-10392',
    name: 'Harold Smith',
    age: 72,
    gender: 'Male',
    medicalId: 'MED-10392',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
    conditions: ['Congestive Heart Failure', 'Stage 3 CKD'],
    allergies: ['Latex'],
    adherenceRate: 68,
    streakDays: 2,
    lastDoseTime: 'Yesterday 9:15 PM',
    riskLevel: 'High',
    readmissionRiskPercent: 68,
    lastAppointment: '1 month ago',
    primaryDoctor: 'Dr. Maya Rao, MD',
    caregiverName: 'Sarah Smith (Daughter)',
    caregiverPhone: '+1 (555) 431-8900',
    emergencyAddress: '124 Beacon Way, Boston, MA',
    emergencyCoords: { lat: 42.3601, lng: -71.0589 },
  },
  {
    id: 'p-38291',
    name: 'Maria Gonzalez',
    age: 58,
    gender: 'Female',
    medicalId: 'MED-38291',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    conditions: ['Post-Stent Placement', 'Hypertension'],
    allergies: ['None known'],
    adherenceRate: 96,
    streakDays: 28,
    lastDoseTime: 'Today 7:45 AM',
    riskLevel: 'Low',
    readmissionRiskPercent: 12,
    lastAppointment: '3 days ago',
    primaryDoctor: 'Dr. Maya Rao, MD',
    caregiverName: 'Carlos Gonzalez (Spouse)',
    caregiverPhone: '+1 (555) 670-2211',
    emergencyAddress: '550 Sunset Blvd, Miami, FL',
    emergencyCoords: { lat: 25.7617, lng: -80.1918 },
  },
  {
    id: 'p-49201',
    name: 'Arthur Dent',
    age: 64,
    gender: 'Male',
    medicalId: 'MED-49201',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    conditions: ['Arrhythmia', 'Elevated Lipids'],
    allergies: ['Aspirin (Asthma trigger)'],
    adherenceRate: 84,
    streakDays: 8,
    lastDoseTime: 'Today 8:30 AM',
    riskLevel: 'Moderate',
    readmissionRiskPercent: 32,
    lastAppointment: '2 months ago',
    primaryDoctor: 'Dr. Maya Rao, MD',
    caregiverName: 'Self-managed',
    caregiverPhone: '+1 (555) 909-1234',
    emergencyAddress: '42 Hitchhiker Way, Seattle, WA',
    emergencyCoords: { lat: 47.6062, lng: -122.3321 },
  },
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    dosage: '5 mg',
    frequency: 'Once daily',
    timing: 'Morning (8:00 AM)',
    foodInstruction: 'Can be taken with or without food',
    remainingDays: 3,
    totalDays: 30,
    pillsRemaining: 3,
    pillsTotal: 30,
    pillDetails: {
      shape: 'Round',
      color: 'White to off-white',
      imprint: 'AML 5',
      size: '8 mm',
      description: 'Round, biconvex white tablet debossed with AML 5 on one side',
    },
    warnings: [
      'Food Interaction: Check prescription before consuming grapefruit or grapefruit juice, which may alter blood levels.',
      'Rise slowly from sitting or lying position to prevent dizziness.',
    ],
    refillStatus: 'refill_recommended',
    prescribedBy: 'Dr. Maya Rao, MD',
    startDate: '2026-08-15',
  },
  {
    id: 'med-2',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen / Paracetamol',
    dosage: '500 mg',
    frequency: 'Twice daily',
    timing: 'After lunch (1:00 PM) & Evening (7:00 PM)',
    foodInstruction: 'Take with or after food with water',
    remainingDays: 4,
    totalDays: 30,
    pillsRemaining: 6,
    pillsTotal: 30,
    pillDetails: {
      shape: 'Caplet',
      color: 'White',
      imprint: 'PARA 500',
      size: '12 mm',
      description: 'White oblong caplet debossed with PARA 500',
    },
    warnings: [
      'Do not exceed maximum daily dosage of 4000 mg across all products.',
      'Avoid concurrent consumption with other acetaminophen-containing medications.',
    ],
    refillStatus: 'refill_recommended',
    prescribedBy: 'Dr. Maya Rao, MD',
    startDate: '2026-08-20',
  },
  {
    id: 'med-3',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    dosage: '500 mg',
    frequency: 'Twice daily',
    timing: 'After lunch (1:00 PM) & After dinner (8:00 PM)',
    foodInstruction: 'Take immediately with or directly after a meal',
    remainingDays: 14,
    totalDays: 60,
    pillsRemaining: 28,
    pillsTotal: 60,
    pillDetails: {
      shape: 'Oval / Oblong',
      color: 'White',
      imprint: 'MET 500',
      size: '14 mm',
      description: 'Oval film-coated white tablet debossed with MET 500',
    },
    warnings: [
      'Take with meals to minimize gastrointestinal discomfort.',
      'Stay well-hydrated throughout the day.',
    ],
    refillStatus: 'healthy',
    prescribedBy: 'Dr. Maya Rao, MD',
    startDate: '2026-07-10',
  },
  {
    id: 'med-4',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    dosage: '20 mg',
    frequency: 'Once daily',
    timing: 'Evening / Bedtime (8:00 PM)',
    foodInstruction: 'Take at evening with or without food',
    remainingDays: 22,
    totalDays: 30,
    pillsRemaining: 22,
    pillsTotal: 30,
    pillDetails: {
      shape: 'Elliptical',
      color: 'White',
      imprint: 'ATV 20',
      size: '10 mm',
      description: 'Elliptical film-coated white tablet debossed with ATV 20',
    },
    warnings: [
      'Report any unexplained muscle pain or tenderness immediately.',
      'Avoid excessive alcohol consumption while on statin therapy.',
    ],
    refillStatus: 'healthy',
    prescribedBy: 'Dr. Maya Rao, MD',
    startDate: '2026-08-01',
  },
  {
    id: 'med-5',
    name: 'Lisinopril 10mg',
    genericName: 'Lisinopril Dihydrate',
    dosage: '10 mg',
    frequency: 'Once daily',
    timing: 'Morning (09:00 AM)',
    foodInstruction: 'Take once daily in the morning with water',
    remainingDays: 25,
    totalDays: 30,
    pillsRemaining: 25,
    pillsTotal: 30,
    pillDetails: {
      shape: 'Round',
      color: 'Yellow',
      imprint: 'LIS 10',
      size: '7 mm',
      description: 'Round yellow tablet debossed with LIS 10',
    },
    warnings: [
      'Avoid potassium supplements unless advised by physician.',
      'Inform doctor if dry persistent cough develops.',
    ],
    refillStatus: 'healthy',
    prescribedBy: 'Dr. Maya Rao, MD',
    startDate: '2026-08-05',
  },
];

const INITIAL_SCHEDULE: DoseSchedule[] = [
  {
    id: 'dose-1',
    medicationId: 'med-1',
    medicationName: 'Amlodipine',
    dosage: '5 mg',
    scheduledTime: '08:00 AM',
    status: 'due',
    foodRule: 'before_food',
    notes: 'Blood pressure regulation. Drink a full glass of water.',
  },
  {
    id: 'dose-2',
    medicationId: 'med-2',
    medicationName: 'Paracetamol 500mg',
    dosage: '500 mg',
    scheduledTime: '01:00 PM',
    status: 'upcoming',
    foodRule: 'after_food',
    notes: 'Mild joint discomfort management. Take after meal.',
  },
  {
    id: 'dose-3',
    medicationId: 'med-3',
    medicationName: 'Metformin',
    dosage: '500 mg',
    scheduledTime: '01:30 PM',
    status: 'upcoming',
    foodRule: 'with_food',
    notes: 'Glycemic control. Take with lunch.',
  },
  {
    id: 'dose-4',
    medicationId: 'med-4',
    medicationName: 'Atorvastatin',
    dosage: '20 mg',
    scheduledTime: '08:00 PM',
    status: 'upcoming',
    foodRule: 'after_food',
    notes: 'Lipid control. Take after evening dinner.',
  },
];

const INITIAL_ORDERS: RefillOrder[] = [];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-9021',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    doctorId: 'd-48201',
    doctorName: 'Dr. Maya Rao, MD',
    doctorLicense: 'MED-LIC-89410',
    medicationName: 'Amlodipine Besylate',
    dosage: '5 mg',
    frequency: 'Once daily',
    timing: 'Morning',
    durationDays: 30,
    instructions: 'Take 1 tablet daily every morning for systemic arterial hypertension.',
    foodInstruction: 'With or without food. Avoid grapefruit juice.',
    refillsAllowed: 3,
    refillsRemaining: 2,
    issuedDate: '2026-08-15',
    status: 'active',
    pharmacyStatus: 'approved',
    ocrConfidence: 96,
  },
  {
    id: 'rx-9022',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    doctorId: 'd-48201',
    doctorName: 'Dr. Maya Rao, MD',
    doctorLicense: 'MED-LIC-89410',
    medicationName: 'Metformin HCl',
    dosage: '500 mg',
    frequency: 'Twice daily',
    timing: 'Lunch and Dinner',
    durationDays: 60,
    instructions: 'Take 1 tablet twice daily with meals for glycemic control.',
    foodInstruction: 'With food to minimize GI upset.',
    refillsAllowed: 4,
    refillsRemaining: 3,
    issuedDate: '2026-07-10',
    status: 'active',
    pharmacyStatus: 'approved',
    ocrConfidence: 94,
  },
  {
    id: 'rx-9023',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    doctorId: 'd-48201',
    doctorName: 'Dr. Maya Rao, MD',
    doctorLicense: 'MED-LIC-89410',
    medicationName: 'Atorvastatin Calcium',
    dosage: '20 mg',
    frequency: 'Once daily',
    timing: 'Bedtime',
    durationDays: 30,
    instructions: 'Take 1 tablet nightly for primary dyslipidemia management.',
    foodInstruction: 'With or without food.',
    refillsAllowed: 3,
    refillsRemaining: 3,
    issuedDate: '2026-08-01',
    status: 'active',
    pharmacyStatus: 'approved',
    ocrConfidence: 98,
  },
  {
    id: 'rx-9024',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    doctorId: 'd-48201',
    doctorName: 'Dr. Maya Rao, MD',
    doctorLicense: 'MED-LIC-89410',
    medicationName: 'Paracetamol',
    dosage: '500 mg',
    frequency: 'Twice daily as needed',
    timing: 'After lunch & evening',
    durationDays: 30,
    instructions: 'Take 1 tablet twice daily after meals for joint comfort. Do not exceed 4000mg/day.',
    foodInstruction: 'Take after meals with water.',
    refillsAllowed: 3,
    refillsRemaining: 2,
    issuedDate: '2026-08-20',
    status: 'active',
    pharmacyStatus: 'approved',
    ocrConfidence: 97,
  },
  {
    id: 'rx-9025',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    doctorId: 'd-48201',
    doctorName: 'Dr. Maya Rao, MD',
    doctorLicense: 'MED-LIC-89410',
    medicationName: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily',
    timing: 'Morning',
    durationDays: 30,
    instructions: 'Take 1 tablet every morning with water for cardiovascular support.',
    foodInstruction: 'With water.',
    refillsAllowed: 4,
    refillsRemaining: 4,
    issuedDate: '2026-08-05',
    status: 'active',
    pharmacyStatus: 'approved',
    ocrConfidence: 99,
  },
];

const INITIAL_VITALS: VitalRecord[] = [
  { id: 'v-1', patientId: 'p-20481', timestamp: 'Sep 17', systolicBP: 132, diastolicBP: 84, heartRate: 76, weightKg: 68.4, mood: 'Good', notes: 'Normal morning reading' },
  { id: 'v-2', patientId: 'p-20481', timestamp: 'Sep 18', systolicBP: 128, diastolicBP: 82, heartRate: 74, weightKg: 68.2, mood: 'Good', notes: 'Post-walk reading' },
  { id: 'v-3', patientId: 'p-20481', timestamp: 'Sep 19', systolicBP: 130, diastolicBP: 83, heartRate: 75, weightKg: 68.3, mood: 'Fair', notes: 'Slight fatigue reported' },
  { id: 'v-4', patientId: 'p-20481', timestamp: 'Sep 20', systolicBP: 126, diastolicBP: 80, heartRate: 72, weightKg: 68.1, mood: 'Excellent', notes: 'Feeling energetic' },
  { id: 'v-5', patientId: 'p-20481', timestamp: 'Today (Sep 21)', systolicBP: 124, diastolicBP: 79, heartRate: 71, weightKg: 68.0, mood: 'Good', notes: 'Optimal pressure range' },
];

const INITIAL_ALERTS: CareAlert[] = [
  {
    id: 'alt-1',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    type: 'refill_needed',
    severity: 'medium',
    title: 'Amlodipine Supply Low (3 Days Remaining)',
    message: 'Amlodipine 5mg has reached the 3-day threshold. Automatic refill has been suggested to maintain therapy continuity.',
    timestamp: 'Today at 08:30 AM',
    read: false,
    acknowledged: false,
    actionRequired: 'Order refill via Pharmacy Engine',
  },
  {
    id: 'alt-2',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    type: 'interaction_warning',
    severity: 'low',
    title: 'Dietary Interaction Reminder',
    message: 'Check prescription instructions before consuming grapefruit or grapefruit juice while taking Amlodipine.',
    timestamp: 'Yesterday at 11:00 AM',
    read: true,
    acknowledged: true,
  },
];

const INITIAL_PHARMACY_ALERTS: PharmacyAlert[] = [
  // STOCK REFILL ALERTS
  {
    id: 'palert-stock-1',
    type: 'STOCK',
    title: 'Paracetamol stock is running low.',
    message: 'Paracetamol 500mg stock is running low (45 bottles left, 4.5 days reserve remaining). Automated replenishment recommended.',
    priority: 'high',
    timestamp: 'Today at 08:15 AM',
    read: false,
    relatedMedicineId: 'inv-2',
  },
  {
    id: 'palert-stock-2',
    type: 'STOCK',
    title: 'Amoxicillin has reached minimum stock level.',
    message: 'Amoxicillin 500mg has reached critical threshold (2.2 days supply remaining). Safety stock replenishment needed.',
    priority: 'critical',
    timestamp: 'Today at 07:30 AM',
    read: false,
    relatedMedicineId: 'inv-6',
  },
  {
    id: 'palert-stock-3',
    type: 'STOCK',
    title: '12 medicines require inventory replenishment.',
    message: 'Weekly inventory assessment shows 12 wholesale stock items require replenishment.',
    priority: 'medium',
    timestamp: 'Yesterday at 05:00 PM',
    read: false,
  },
  // ORDER ALERTS
  {
    id: 'palert-order-1',
    type: 'ORDER',
    title: 'New medicine order received.',
    message: 'Order #MS1024 is awaiting processing for Eleanor Vance (Amlodipine 5mg).',
    priority: 'high',
    timestamp: 'Today at 09:15 AM',
    read: false,
    relatedOrderId: 'ord-8812',
  },
  {
    id: 'palert-order-2',
    type: 'ORDER',
    title: 'Order #MS1024 is awaiting processing.',
    message: 'Prescription verification complete. Order #MS1024 queued for pharmacist batch dispensing.',
    priority: 'high',
    timestamp: 'Today at 09:18 AM',
    read: false,
    relatedOrderId: 'ord-8812',
  },
  {
    id: 'palert-order-3',
    type: 'ORDER',
    title: 'Order #MS1025 has been successfully dispatched.',
    message: 'Order #MS1025 for Metformin 500mg has been dispatched via MediSync Express Courier.',
    priority: 'low',
    timestamp: 'Today at 08:45 AM',
    read: true,
  },
  // PRESCRIPTION ALERTS
  {
    id: 'palert-rx-1',
    type: 'PRESCRIPTION',
    title: 'New prescription received for verification.',
    message: 'New prescription #rx-9021 for Amlodipine Besylate received from Dr. Maya Rao, MD.',
    priority: 'high',
    timestamp: 'Today at 08:30 AM',
    read: false,
    relatedPrescriptionId: 'rx-9021',
  },
  {
    id: 'palert-rx-2',
    type: 'PRESCRIPTION',
    title: 'Prescription requires pharmacist review.',
    message: 'Prescription #rx-9024 for Paracetamol 500mg requires pharmacist review & approval.',
    priority: 'medium',
    timestamp: 'Today at 08:00 AM',
    read: false,
    relatedPrescriptionId: 'rx-9024',
  },
  {
    id: 'palert-rx-3',
    type: 'PRESCRIPTION',
    title: 'Prescription verification completed.',
    message: 'Prescription verification completed for #rx-9022 (Metformin HCl 500mg).',
    priority: 'low',
    timestamp: 'Yesterday at 04:30 PM',
    read: true,
    relatedPrescriptionId: 'rx-9022',
  },
  {
    id: 'palert-rx-4',
    type: 'PRESCRIPTION',
    title: 'Prescription has expired.',
    message: 'Prescription #rx-8710 for Ciprofloxacin 250mg has reached expiration date.',
    priority: 'medium',
    timestamp: 'Yesterday at 02:00 PM',
    read: true,
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', medicationName: 'Amlodipine', dosage: '5 mg', currentStock: 140, dailyDemand: 18, daysRemaining: 7.7, expiryDate: '2027-11-30', status: 'healthy', unit: 'bottles (30s)' },
  { id: 'inv-2', medicationName: 'Paracetamol 500mg', dosage: '500 mg', currentStock: 45, dailyDemand: 10, daysRemaining: 4.5, expiryDate: '2028-06-30', status: 'low_stock', unit: 'bottles (100s)' },
  { id: 'inv-3', medicationName: 'Paracetamol Syrup', dosage: '120 mg / 5 mL', currentStock: 12, dailyDemand: 3, daysRemaining: 4.0, expiryDate: '2027-12-15', status: 'low_stock', unit: 'bottles (100mL)' },
  { id: 'inv-4', medicationName: 'Metformin', dosage: '500 mg', currentStock: 450, dailyDemand: 35, daysRemaining: 12.8, expiryDate: '2028-04-15', status: 'healthy', unit: 'bottles (60s)' },
  { id: 'inv-5', medicationName: 'Atorvastatin', dosage: '20 mg', currentStock: 90, dailyDemand: 25, daysRemaining: 3.6, expiryDate: '2027-09-20', status: 'low_stock', unit: 'bottles (30s)' },
  { id: 'inv-6', medicationName: 'Amoxicillin', dosage: '500 mg', currentStock: 45, dailyDemand: 20, daysRemaining: 2.2, expiryDate: '2027-03-10', status: 'critical', unit: 'bottles (20s)' },
  { id: 'inv-7', medicationName: 'Lisinopril', dosage: '10 mg', currentStock: 310, dailyDemand: 15, daysRemaining: 20.6, expiryDate: '2028-01-20', status: 'healthy', unit: 'bottles (30s)' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    doctorId: 'd-48201',
    doctorName: 'Dr. Maya Rao, MD',
    department: 'Cardiology Clinic',
    dateTime: 'Thursday, Sep 24 • 10:30 AM',
    type: 'In-person Clinic',
    status: 'upcoming',
    location: 'Suite 400, St. Jude Medical Pavilion',
  },
  {
    id: 'apt-2',
    patientId: 'p-20481',
    patientName: 'Eleanor Vance',
    doctorId: 'd-48201',
    doctorName: 'Dr. Maya Rao, MD',
    department: 'Metabolic & Lipid Labs',
    dateTime: 'Monday, Sep 28 • 09:00 AM',
    type: 'Lab Work',
    status: 'upcoming',
    location: 'Outpatient Diagnostics Lab B',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'c-10024',
    senderName: 'Daniel Vance (Caregiver)',
    senderRole: 'caregiver',
    receiverId: 'd-48201',
    receiverRole: 'doctor',
    text: 'Hello Dr. Rao, Eleanor took her morning pills on time today. Her BP was 124/79, which is very stable.',
    timestamp: 'Today at 08:15 AM',
    isRead: true,
  },
  {
    id: 'msg-2',
    senderId: 'd-48201',
    senderName: 'Dr. Maya Rao, MD',
    senderRole: 'doctor',
    receiverId: 'c-10024',
    receiverRole: 'caregiver',
    text: 'Wonderful update, Daniel. Her adherence streak is showing great results in her arterial tension. Keep monitoring.',
    timestamp: 'Today at 08:35 AM',
    isRead: true,
  },
  {
    id: 'msg-3',
    senderId: 'p-20481',
    senderName: 'Eleanor Vance (Patient)',
    senderRole: 'patient',
    receiverId: 'ph-77192',
    receiverRole: 'pharmacy',
    text: 'Hi Marcus, I just placed a refill request for Amlodipine 5mg. Please deliver to my home address as usual.',
    timestamp: 'Today at 09:16 AM',
    isRead: true,
  },
  {
    id: 'msg-4',
    senderId: 'ph-77192',
    senderName: 'PharmD Marcus Chen',
    senderRole: 'pharmacy',
    receiverId: 'p-20481',
    receiverRole: 'patient',
    text: 'Good morning Eleanor! We received your refill request and our team has started preparing your order right now.',
    timestamp: 'Today at 09:31 AM',
    isRead: true,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actor: 'Dr. Maya Rao, MD',
    actorRole: 'doctor',
    action: 'Issued prescription for Amlodipine 5mg (30 days, 3 refills)',
    timestamp: '2026-08-15 10:21 AM',
    entityType: 'prescription',
    entityId: 'rx-9021',
    details: 'Initial cardiology evaluation and antihypertensive regimen initiation',
  },
  {
    id: 'aud-2',
    actor: 'Eleanor Vance',
    actorRole: 'patient',
    action: 'Logged morning Amlodipine 5mg as TAKEN on schedule',
    timestamp: 'Yesterday 08:03 AM',
    entityType: 'dose',
    entityId: 'dose-1',
    details: 'Verified with water, taken without distress. Caregiver notified.',
  },
  {
    id: 'aud-3',
    actor: 'Eleanor Vance',
    actorRole: 'patient',
    action: 'Initiated 30-day Smart Refill order for Amlodipine 5mg',
    timestamp: 'Today 09:15 AM',
    entityType: 'refill',
    entityId: 'ord-8812',
    details: 'Triggered by 7-day low inventory threshold. Routed to MediCare Central Pharmacy.',
  },
  {
    id: 'aud-4',
    actor: 'PharmD Marcus Chen',
    actorRole: 'pharmacy',
    action: 'Changed refill order #ord-8812 status to PREPARING',
    timestamp: 'Today 09:30 AM',
    entityType: 'refill',
    entityId: 'ord-8812',
    details: 'Verified active Rx #rx-9021 (2 refills remaining). Batch allocation complete.',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    role: 'all',
    title: 'MediSync Network Synchronized',
    message: 'Encrypted multi-node care bridge established between patient, caregiver, physician, and pharmacy.',
    timestamp: 'Just now',
    type: 'info',
    read: false,
    link: 'dashboard',
  },
  {
    id: 'notif-2',
    role: 'patient',
    title: 'Morning Dose Reminder',
    message: 'Time to take Amlodipine 5mg with a full glass of water. Current adherence streak: 14 days.',
    timestamp: '08:00 AM',
    type: 'info',
    read: false,
    link: 'medications',
  },
  {
    id: 'notif-3',
    role: 'patient',
    title: 'Refill #ord-8812 Preparing',
    message: 'MediCare Central Pharmacy has verified prescription and begun bottling your 30-day supply.',
    timestamp: '09:30 AM',
    type: 'success',
    read: false,
    link: 'refills',
  },
  {
    id: 'notif-4',
    role: 'patient',
    title: 'Upcoming Clinic Appointment',
    message: 'Cardiology consultation with Dr. Maya Rao, MD scheduled for Thursday, Sep 24 at 10:30 AM.',
    timestamp: 'Yesterday',
    type: 'info',
    read: true,
    link: 'appointments',
  },
  {
    id: 'notif-5',
    role: 'caregiver',
    title: 'Dose Confirmed: Eleanor Vance',
    message: 'Eleanor verified taking Amlodipine 5mg on time. Arterial BP logged in optimal range (124/79).',
    timestamp: '08:05 AM',
    type: 'success',
    read: false,
    link: 'medications',
  },
  {
    id: 'notif-6',
    role: 'caregiver',
    title: 'Prescription Supply Alert',
    message: 'Amlodipine supply reached 7-day reserve threshold. Auto-refill dispatch is in progress.',
    timestamp: '08:30 AM',
    type: 'warning',
    read: false,
    link: 'refills',
  },
  {
    id: 'notif-7',
    role: 'doctor',
    title: 'Patient Adherence Benchmark',
    message: 'Eleanor Vance reached 94% 30-day adherence compliance. Hemodynamic stability maintained.',
    timestamp: '08:45 AM',
    type: 'success',
    read: false,
    link: 'reports',
  },
  {
    id: 'notif-8',
    role: 'doctor',
    title: 'Refill Authorization Update',
    message: 'Amlodipine 5mg refill requested by Eleanor Vance. 2 authorized refills remain on Rx #rx-9021.',
    timestamp: '09:15 AM',
    type: 'info',
    read: false,
    link: 'prescriptions',
  },
  {
    id: 'notif-9',
    role: 'pharmacy',
    title: 'Refill Order #ord-8812 Received',
    message: 'Eleanor Vance requested 30-day refill of Amlodipine 5mg with home delivery dispatch.',
    timestamp: '09:15 AM',
    type: 'warning',
    read: false,
    link: 'refills',
  },
  {
    id: 'notif-10',
    role: 'pharmacy',
    title: 'Critical Inventory Alert: Amoxicillin',
    message: 'Amoxicillin 500mg stock is critical with only 2.2 days of supply remaining.',
    timestamp: '07:30 AM',
    type: 'alert',
    read: false,
    link: 'medications',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'medisync_state_v3';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or default
  const savedState = useMemo(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) return JSON.parse(item);
    } catch {
      // fallback
    }
    return null;
  }, []);

  const [activeRole, setActiveRole] = useState<Role>(savedState?.activeRole || 'patient');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(savedState?.isLoggedIn !== undefined ? savedState.isLoggedIn : true);
  const [language, setLanguage] = useState<LanguageCode>(savedState?.language || 'en');

  // Accessibility
  const [largeTextMode, setLargeTextMode] = useState<boolean>(savedState?.largeTextMode || false);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(savedState?.highContrastMode || false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(savedState?.reducedMotion || false);

  // Core Shared State
  const [patient, setPatient] = useState<PatientInfo>(savedState?.patient || INITIAL_PATIENT);
  const [otherPatients] = useState<PatientInfo[]>(INITIAL_PATIENTS_LIST(savedState));
  const [todaySchedule, setTodaySchedule] = useState<DoseSchedule[]>(savedState?.todaySchedule || INITIAL_SCHEDULE);
  const [medications, setMedications] = useState<Medication[]>(savedState?.medications || INITIAL_MEDICATIONS);
  const [refillOrders, setRefillOrders] = useState<RefillOrder[]>(savedState?.refillOrders || INITIAL_ORDERS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(savedState?.prescriptions || INITIAL_PRESCRIPTIONS);
  const [vitals, setVitals] = useState<VitalRecord[]>(savedState?.vitals || INITIAL_VITALS);
  const [alerts, setAlerts] = useState<CareAlert[]>(savedState?.alerts || INITIAL_ALERTS);
  const [pharmacyAlerts, setPharmacyAlerts] = useState<PharmacyAlert[]>(savedState?.pharmacyAlerts || INITIAL_PHARMACY_ALERTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(savedState?.inventory || INITIAL_INVENTORY);
  const [appointments, setAppointments] = useState<Appointment[]>(savedState?.appointments || INITIAL_APPOINTMENTS);
  const [messages, setMessages] = useState<ChatMessage[]>(savedState?.messages || INITIAL_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(savedState?.auditLogs || INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(savedState?.notifications || INITIAL_NOTIFICATIONS);
  const [latestAiSummary, setLatestAiSummary] = useState<string | null>(savedState?.latestAiSummary || null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  function INITIAL_PATIENTS_LIST(state: any) {
    if (state?.otherPatients) return state.otherPatients;
    return SECONDARY_PATIENTS;
  }

  // Persist key state
  useEffect(() => {
    try {
      const stateToSave = {
        activeRole,
        isLoggedIn,
        language,
        largeTextMode,
        highContrastMode,
        reducedMotion,
        patient,
        todaySchedule,
        medications,
        refillOrders,
        prescriptions,
        vitals,
        alerts,
        pharmacyAlerts,
        inventory,
        appointments,
        messages,
        auditLogs,
        notifications,
        latestAiSummary,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // quota or private mode
    }
  }, [
    activeRole,
    isLoggedIn,
    language,
    largeTextMode,
    highContrastMode,
    reducedMotion,
    patient,
    todaySchedule,
    medications,
    refillOrders,
    prescriptions,
    vitals,
    alerts,
    pharmacyAlerts,
    inventory,
    appointments,
    messages,
    auditLogs,
    notifications,
    latestAiSummary,
  ]);

  const t = useMemo(() => translations[language] || translations.en, [language]);

  const currentUser = useMemo(() => DEFAULT_USERS[activeRole], [activeRole]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (
    actor: string,
    actorRole: Role,
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = new Date().toISOString().split('T')[0];
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actor,
      actorRole,
      action,
      timestamp: `${dateStr} ${timeStr}`,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (
    roleOrItem:
      | Role
      | 'all'
      | {
          role: Role | 'all';
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'alert';
          link?: string;
        },
    titleArg?: string,
    messageArg?: string,
    typeArg?: 'info' | 'success' | 'warning' | 'alert',
    linkArg?: string
  ) => {
    let role: Role | 'all';
    let title: string;
    let message: string;
    let type: 'info' | 'success' | 'warning' | 'alert' = 'info';
    let link: string | undefined = undefined;

    if (typeof roleOrItem === 'object') {
      role = roleOrItem.role;
      title = roleOrItem.title;
      message = roleOrItem.message;
      type = roleOrItem.type || 'info';
      link = roleOrItem.link;
    } else {
      role = roleOrItem;
      title = titleArg || 'Notification';
      message = messageArg || '';
      type = typeArg || 'info';
      link = linkArg;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role,
      title,
      message,
      timestamp: timeStr,
      type,
      read: false,
      link,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const switchRole = (newRole: Role) => {
    setActiveRole(newRole);
    addToast(`Switched view to ${newRole.toUpperCase()} console (shared state preserved)`, 'info');
  };

  const loginAs = (role: Role) => {
    setActiveRole(role);
    setIsLoggedIn(true);
    addToast(`Logged into ${role.toUpperCase()} Workspace`, 'success');
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    addToast(`Language updated to ${lang.toUpperCase()}`, 'info');
  };

  // MARK DOSE TAKEN
  const markDoseTaken = (doseId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    let medName = 'Medication';
    setTodaySchedule((prev) =>
      prev.map((d) => {
        if (d.id === doseId) {
          medName = d.medicationName;
          return {
            ...d,
            status: 'taken',
            takenAt: nowTime,
          };
        }
        return d;
      })
    );

    // Update patient adherence & streak
    setPatient((prev) => {
      const newStreak = prev.streakDays + 1;
      const newRate = Math.min(100, prev.adherenceRate + 1);
      const newRisk = Math.max(10, prev.readmissionRiskPercent - 3);
      return {
        ...prev,
        adherenceRate: newRate,
        streakDays: newStreak,
        lastDoseTime: `${nowTime} Today`,
        readmissionRiskPercent: newRisk,
        riskLevel: newRisk > 50 ? 'High' : newRisk > 25 ? 'Moderate' : 'Low',
      };
    });

    // Decrement pill count for matching medication
    setMedications((prev) =>
      prev.map((m) => {
        if (m.name.toLowerCase().includes(medName.toLowerCase()) || medName.toLowerCase().includes(m.name.toLowerCase())) {
          const newRemaining = Math.max(0, m.pillsRemaining - 1);
          const daysLeft = Math.ceil(newRemaining / (m.frequency.toLowerCase().includes('twice') ? 2 : 1));
          return {
            ...m,
            pillsRemaining: newRemaining,
            remainingDays: daysLeft,
            refillStatus: daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'refill_recommended' : 'healthy',
          };
        }
        return m;
      })
    );

    // Caregiver alert update / notification
    addNotification(
      'caregiver',
      `Dose Recorded: ${medName}`,
      `Eleanor Vance marked ${medName} as taken at ${nowTime}. Schedule is synchronized.`
    );
    addNotification(
      'doctor',
      `Adherence Progress: Eleanor Vance`,
      `Patient recorded ${medName} on time (${nowTime}). 14-day streak maintained.`
    );

    addAuditLog(
      'Eleanor Vance (Patient)',
      'patient',
      `Marked ${medName} as TAKEN`,
      'dose',
      doseId,
      `Recorded at ${nowTime}. Adherence streak increased.`
    );

    addToast(`✓ Marked ${medName} as Taken! Caregiver & Doctor notified.`, 'success');
  };

  // MARK DOSE MISSED
  const markDoseMissed = (doseId: string) => {
    let medName = 'Medication';
    setTodaySchedule((prev) =>
      prev.map((d) => {
        if (d.id === doseId) {
          medName = d.medicationName;
          return { ...d, status: 'missed' };
        }
        return d;
      })
    );

    // Lower adherence & increase clinical risk
    setPatient((prev) => {
      const newRate = Math.max(50, prev.adherenceRate - 6);
      const newRisk = Math.min(95, prev.readmissionRiskPercent + 14);
      return {
        ...prev,
        adherenceRate: newRate,
        streakDays: 0,
        readmissionRiskPercent: newRisk,
        riskLevel: newRisk > 50 ? 'High' : newRisk > 25 ? 'Moderate' : 'Low',
      };
    });

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // High priority alert for Caregiver & Doctor
    const newAlert: CareAlert = {
      id: `alt-missed-${Date.now()}`,
      patientId: 'p-20481',
      patientName: 'Eleanor Vance',
      type: 'missed_dose',
      severity: 'high',
      title: `Missed Dose Alert: ${medName}`,
      message: `Eleanor Vance has recorded a missed dose for ${medName}. Prompt caregiver follow-up is recommended.`,
      timestamp: `Today at ${nowTime}`,
      read: false,
      acknowledged: false,
      actionRequired: 'Contact Eleanor to verify safety or reschedule window',
    };
    setAlerts((prev) => [newAlert, ...prev]);

    addNotification(
      'caregiver',
      `⚠️ Missed Dose: ${medName}`,
      `Eleanor Vance missed her scheduled dose of ${medName}. Check in with her.`,
      'alert'
    );
    addNotification(
      'doctor',
      `Adherence Warning: Eleanor Vance`,
      `Missed dose recorded for ${medName}. Readmission risk recalculated.`,
      'warning'
    );

    addAuditLog(
      'Eleanor Vance (Patient)',
      'patient',
      `Recorded MISSED dose for ${medName}`,
      'dose',
      doseId,
      'Risk model adjusted; instant alert dispatched to Daniel Vance (Caregiver).'
    );

    addToast(`Recorded missed dose for ${medName}. Caregiver has been alerted.`, 'warning');
  };

  // ADAPTIVE SCHEDULE DELAY
  const applyAdaptiveDelay = (doseId: string, delayHours: number) => {
    setTodaySchedule((prev) =>
      prev.map((d) => {
        if (d.id === doseId) {
          return {
            ...d,
            isAdaptiveDelayed: true,
            originalScheduledTime: d.originalScheduledTime || d.scheduledTime,
            scheduledTime: `Delayed +${delayHours}h (Adaptive)`,
            status: 'upcoming',
          };
        }
        return d;
      })
    );

    addToast(`Adaptive Schedule: Adjusted subsequent doses by +${delayHours}h to prevent overdose window`, 'info');
    addAuditLog(
      'MediSync AI Engine',
      'patient',
      `Adaptive schedule recalculation (+${delayHours}h)`,
      'dose',
      doseId,
      'Recalculated subsequent medication intervals according to safe clinical clearance intervals.'
    );
  };

  // ORDER REFILL
  const createRefillOrder = (
    medicationId: string,
    priority: 'routine' | 'urgent' = 'routine',
    deliveryMethod: 'pickup' | 'home_delivery' = 'home_delivery'
  ) => {
    const med = medications.find((m) => m.id === medicationId) || medications[0];

    // Prevent duplicate refill orders if already pending
    if (med.refillStatus === 'pending') {
      addToast(`A refill order for ${med.name} is already currently pending with the pharmacy.`, 'warning');
      return;
    }

    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const newOrder: RefillOrder = {
      id: orderId,
      patientId: 'p-20481',
      patientName: 'Eleanor Vance',
      medicationId: med.id,
      medicationName: med.name,
      dosage: `${med.dosage} (${med.totalDays || 30}-day supply)`,
      quantity: med.pillsTotal || 30,
      requestedAt: `Today at ${nowTime}`,
      priority,
      status: 'pending_preparation',
      deliveryMethod,
      deliveryAddress: '742 Evergreen Terrace, Apt 3B',
      pharmacyId: 'ph-77192',
      pharmacyName: 'MediCare Central Community Pharmacy',
      history: [
        {
          status: 'pending_preparation',
          timestamp: nowTime,
          note: 'Order submitted via MediSync Smart Refill Engine',
        },
      ],
      trackingCoordinates: {
        lat: 37.7749,
        lng: -122.4194,
        etaMinutes: 45,
        currentLocationName: 'Pharmacy Fulfillment Center, Bay St.',
      },
    };

    setRefillOrders((prev) => [newOrder, ...prev]);

    // Update med refillStatus immediately to pending
    setMedications((prev) =>
      prev.map((m) => (m.id === med.id ? { ...m, refillStatus: 'pending' } : m))
    );

    // Also decrement prescription refill authorization
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (
          rx.medicationName.toLowerCase().includes(med.name.toLowerCase()) ||
          med.name.toLowerCase().includes(rx.medicationName.toLowerCase())
        ) {
          return {
            ...rx,
            refillsRemaining: Math.max(0, rx.refillsRemaining - 1),
          };
        }
        return rx;
      })
    );

    // Emit dedicated Pharmacy Alert
    const newPharmacyAlert: PharmacyAlert = {
      id: `palert-order-${Date.now()}`,
      type: 'ORDER',
      title: 'New medicine order received.',
      message: `Order #${orderId} is awaiting processing for Eleanor Vance (${med.name} ${med.dosage}).`,
      priority: priority === 'urgent' ? 'critical' : 'high',
      timestamp: `Today at ${nowTime}`,
      read: false,
      relatedOrderId: orderId,
      relatedMedicineId: med.id,
    };
    setPharmacyAlerts((prev) => [newPharmacyAlert, ...prev]);

    // Instant notification for Pharmacy & Patient
    addNotification(
      'pharmacy',
      `New Refill Request: #${orderId}`,
      `Eleanor Vance requested refill of ${med.name} ${med.dosage}. Priority: ${priority.toUpperCase()}`,
      'warning'
    );
    addNotification(
      'patient',
      `Refill Request Dispatched`,
      `Order #${orderId} for ${med.name} received by MediCare Central Pharmacy.`,
      'info'
    );

    addAuditLog(
      'Eleanor Vance (Patient)',
      'patient',
      `Placed Smart Refill order #${orderId} for ${med.name}`,
      'refill',
      orderId,
      `Requested via 1-click supply flow. Target Pharmacy: MediCare Central.`
    );

    addToast(`Refill request for ${med.name} transmitted directly to Pharmacy Queue!`, 'success');
  };

  // UPDATE ORDER STATUS (Pharmacy & Courier actions)
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    let medName = 'Medication';
    let patientName = 'Eleanor Vance';

    setRefillOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          medName = o.medicationName;
          patientName = o.patientName;
          const updatedHistory = [
            ...o.history,
            {
              status: newStatus,
              timestamp: nowTime,
              note:
                newStatus === 'preparing'
                  ? 'Pharmacist Marcus Chen began compounding & packaging'
                  : newStatus === 'ready'
                  ? 'Medication sealed and verified. Ready for courier pickup.'
                  : newStatus === 'out_for_delivery'
                  ? 'Courier en route with climate-controlled package'
                  : 'Delivered securely to doorstep. Verified by recipient.',
            },
          ];

          return {
            ...o,
            status: newStatus,
            history: updatedHistory,
            trackingCoordinates:
              newStatus === 'out_for_delivery'
                ? {
                    lat: 37.776,
                    lng: -122.418,
                    etaMinutes: 12,
                    currentLocationName: 'Arriving in 12 mins via Elm St',
                  }
                : o.trackingCoordinates,
          };
        }
        return o;
      })
    );

    // If delivered, restore medication supply!
    if (newStatus === 'delivered') {
      setMedications((prev) =>
        prev.map((m) => {
          if (m.name.toLowerCase().includes(medName.toLowerCase()) || medName.toLowerCase().includes(m.name.toLowerCase())) {
            return {
              ...m,
              pillsRemaining: m.pillsTotal,
              remainingDays: m.totalDays,
              refillStatus: 'healthy',
            };
          }
          return m;
        })
      );

      // Decrement inventory stock
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.medicationName.toLowerCase().includes(medName.toLowerCase())) {
            return {
              ...inv,
              currentStock: Math.max(0, inv.currentStock - 1),
            };
          }
          return inv;
        })
      );

      addNotification(
        'patient',
        `Medication Delivered!`,
        `Your refill of ${medName} has been delivered. Medication supply is refreshed to 30 days.`,
        'success'
      );
      addNotification(
        'caregiver',
        `Refill Delivered for Eleanor`,
        `${medName} 30-day supply delivered safely to Eleanor's home address.`,
        'info'
      );
    } else {
      addNotification(
        'patient',
        `Order Update: ${medName}`,
        `Status changed to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`
      );
    }

    addAuditLog(
      'PharmD Marcus Chen (Pharmacy)',
      'pharmacy',
      `Advanced order #${orderId} to ${newStatus.toUpperCase()}`,
      'refill',
      orderId,
      `Status updated by pharmacy console. Patient ${patientName} notified in real time.`
    );

    addToast(`Order #${orderId} updated to ${newStatus.replace(/_/g, ' ')}!`, 'info');
  };

  // CREATE PRESCRIPTION (Doctor creates, routes to patient & pharmacy)
  const createPrescription = (data: Partial<Prescription>) => {
    const rxId = `rx-${Math.floor(2000 + Math.random() * 8000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const todayDate = new Date().toISOString().split('T')[0];

    const newRx: Prescription = {
      id: rxId,
      patientId: data.patientId || 'p-20481',
      patientName: data.patientName || 'Eleanor Vance',
      doctorId: 'd-48201',
      doctorName: 'Dr. Maya Rao, MD',
      doctorLicense: 'MED-LIC-89410',
      medicationName: data.medicationName || 'Lisinopril',
      dosage: data.dosage || '10 mg',
      frequency: data.frequency || 'Once daily',
      timing: data.timing || 'Morning',
      durationDays: data.durationDays || 30,
      instructions: data.instructions || 'Take 1 tablet daily as prescribed by cardiologist.',
      foodInstruction: data.foodInstruction || 'With or without food.',
      refillsAllowed: data.refillsAllowed || 3,
      refillsRemaining: data.refillsAllowed || 3,
      issuedDate: todayDate,
      status: 'active',
      pharmacyStatus: 'approved',
      ocrConfidence: 99,
    };

    setPrescriptions((prev) => [newRx, ...prev]);

    // Add into patient's medication list if not already present
    const existingMed = medications.find((m) => m.name.toLowerCase() === newRx.medicationName.toLowerCase());
    if (!existingMed) {
      const newMed: Medication = {
        id: `med-${Date.now()}`,
        name: newRx.medicationName,
        genericName: newRx.medicationName,
        dosage: newRx.dosage,
        frequency: newRx.frequency,
        timing: newRx.timing,
        foodInstruction: newRx.foodInstruction,
        remainingDays: newRx.durationDays,
        totalDays: newRx.durationDays,
        pillsRemaining: newRx.durationDays,
        pillsTotal: newRx.durationDays,
        pillDetails: {
          shape: 'Round',
          color: 'Yellow',
          imprint: 'RX 10',
          size: '9 mm',
          description: 'Round scored tablet debossed with RX 10',
        },
        warnings: ['Monitor blood pressure routinely when starting this medication.'],
        refillStatus: 'healthy',
        prescribedBy: 'Dr. Maya Rao, MD',
        startDate: todayDate,
      };
      setMedications((prev) => [...prev, newMed]);

      // Add to today's schedule
      const newDose: DoseSchedule = {
        id: `dose-${Date.now()}`,
        medicationId: newMed.id,
        medicationName: newRx.medicationName,
        dosage: newRx.dosage,
        scheduledTime: '10:00 AM',
        status: 'upcoming',
        foodRule: 'after_food',
        notes: `Newly prescribed by ${newRx.doctorName}`,
      };
      setTodaySchedule((prev) => [...prev, newDose]);
    }

    addNotification(
      'patient',
      `New Prescription Issued`,
      `${newRx.doctorName} prescribed ${newRx.medicationName} ${newRx.dosage}. Added to your active schedule.`,
      'success'
    );
    addNotification(
      'pharmacy',
      `Electronic Rx Received: #${rxId}`,
      `New prescription from Dr. Rao for Eleanor Vance: ${newRx.medicationName} ${newRx.dosage}.`,
      'info'
    );
    addNotification(
      'caregiver',
      `Care Plan Updated`,
      `Dr. Rao added ${newRx.medicationName} ${newRx.dosage} to Eleanor's daily regimen.`,
      'info'
    );

    addAuditLog(
      'Dr. Maya Rao, MD (Doctor)',
      'doctor',
      `Issued new e-Prescription #${rxId} for ${newRx.medicationName}`,
      'prescription',
      rxId,
      `Directly synced to Eleanor's schedule and MediCare Central Pharmacy queue.`
    );

    addToast(`e-Prescription issued for ${newRx.medicationName}! Synchronized across Patient & Pharmacy.`, 'success');
  };

  // PHARMACY REVIEW STATUS
  const updatePrescriptionPharmacyStatus = (
    id: string,
    status: 'approved' | 'review_required' | 'rejected' | 'dispensed'
  ) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, pharmacyStatus: status } : rx))
    );
    addToast(`Prescription #${id} marked as ${status.replace(/_/g, ' ').toUpperCase()}`, 'info');
    addAuditLog(
      'PharmD Marcus Chen (Pharmacy)',
      'pharmacy',
      `Updated Rx #${id} verification status to ${status.toUpperCase()}`,
      'prescription',
      id,
      'Clinical pharmacist verification check performed.'
    );
  };

  // ADD VITAL
  const addVital = (record: Omit<VitalRecord, 'id' | 'timestamp'>) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = 'Today (' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    const newVital: VitalRecord = {
      id: `v-${Date.now()}`,
      timestamp: `${dateStr} ${timeStr}`,
      ...record,
    };
    setVitals((prev) => [...prev, newVital]);

    // Check for high BP
    if (record.systolicBP >= 140 || record.diastolicBP >= 90) {
      const alertItem: CareAlert = {
        id: `alt-bp-${Date.now()}`,
        patientId: 'p-20481',
        patientName: 'Eleanor Vance',
        type: 'vital_spike',
        severity: 'high',
        title: `Elevated Blood Pressure: ${record.systolicBP}/${record.diastolicBP} mmHg`,
        message: 'Elevated arterial reading logged. Caregiver & Doctor notified.',
        timestamp: `Today at ${timeStr}`,
        read: false,
        acknowledged: false,
        actionRequired: 'Recommend re-checking in 30 mins in seated position.',
      };
      setAlerts((prev) => [alertItem, ...prev]);
      addNotification('doctor', `Vital Spike Alert: Eleanor Vance`, `BP logged at ${record.systolicBP}/${record.diastolicBP} mmHg`, 'warning');
      addNotification('caregiver', `Vital Notice: Eleanor Vance`, `Elevated BP reading (${record.systolicBP}/${record.diastolicBP}) logged.`, 'warning');
    }

    addAuditLog(
      currentUser.name,
      activeRole,
      `Logged vitals: BP ${record.systolicBP}/${record.diastolicBP}, HR ${record.heartRate} bpm, Mood: ${record.mood}`,
      'vital',
      newVital.id,
      'Biometric metrics recorded into clinical timeline.'
    );

    addToast(`Vitals recorded successfully: ${record.systolicBP}/${record.diastolicBP} mmHg, ${record.heartRate} bpm!`, 'success');
  };

  // SCAN PRESCRIPTION OCR CONFIRMATION
  const addPrescriptionFromScan = (extracted: {
    medicationName: string;
    dosage: string;
    frequency: string;
    timing: string;
    foodInstruction: string;
    durationDays: number;
  }) => {
    createPrescription({
      medicationName: extracted.medicationName,
      dosage: extracted.dosage,
      frequency: extracted.frequency,
      timing: extracted.timing,
      foodInstruction: extracted.foodInstruction,
      durationDays: extracted.durationDays,
      instructions: `AI Extracted from paper prescription: Take ${extracted.dosage} ${extracted.frequency} (${extracted.timing}).`,
    });
  };

  // SEND MESSAGE
  const sendMessage = (receiverRole: Role, text: string) => {
    const receiver = DEFAULT_USERS[receiverRole];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: activeRole,
      receiverId: receiver.id,
      receiverRole,
      text,
      timestamp: `Today at ${nowTime}`,
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    addNotification(
      receiverRole,
      `New Message from ${currentUser.name}`,
      `"${text.length > 50 ? text.substring(0, 48) + '...' : text}"`,
      'info'
    );

    addAuditLog(
      currentUser.name,
      activeRole,
      `Sent secure medical message to ${receiver.name}`,
      'message',
      newMsg.id,
      'Encrypted clinical communications channel.'
    );

    addToast(`Message dispatched to ${receiver.name}!`, 'success');
  };

  // EMERGENCY SOS
  const triggerEmergencySos = (note?: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const sosAlert: CareAlert = {
      id: `alt-sos-${Date.now()}`,
      patientId: 'p-20481',
      patientName: 'Eleanor Vance',
      type: 'sos',
      severity: 'critical',
      title: '🚨 EMERGENCY SOS DISPATCH SIMULATED',
      message: `Emergency SOS initiated for Eleanor Vance. Current location: 37.7749° N, 122.4194° W (742 Evergreen Terrace). ${note || 'Immediate caregiver dispatch activated.'}`,
      timestamp: `Today at ${nowTime}`,
      read: false,
      acknowledged: false,
      actionRequired: 'Verify emergency contact response team dispatch',
    };

    setAlerts((prev) => [sosAlert, ...prev]);

    addNotification('caregiver', '🚨 CRITICAL EMERGENCY SOS', 'Eleanor Vance initiated Emergency SOS. Location & medical history transmitted.', 'alert');
    addNotification('doctor', '🚨 Emergency SOS Dispatched: Eleanor Vance', 'Emergency event recorded. Patient profile & active medication list sent to responders.', 'alert');

    addAuditLog(
      currentUser.name,
      activeRole,
      'DISPATCHED EMERGENCY SOS (SIMULATED)',
      'sos',
      sosAlert.id,
      'Live GPS coordinates (37.7749 N, 122.4194 W) and full medication chart transmitted to emergency services & family contacts.'
    );

    addToast('🚨 EMERGENCY SOS DISPATCH SIMULATED. Responders & Caregiver alerted!', 'error');
  };

  // AI PATIENT HEALTH DATA SUMMARY GENERATOR (Patient-specific, strictly grounded, zero fabrication)
  const generateAiSummary = (patientId: string = 'p-20481') => {
    const p = patientId === 'p-20481' ? patient : otherPatients.find((x) => x.id === patientId) || patient;

    if (medications.length === 0 && todaySchedule.length === 0 && appointments.length === 0) {
      const emptyMsg = t.insufficientDataSummary || "There isn't enough patient data available to generate a detailed health summary.";
      setLatestAiSummary(emptyMsg);
      return emptyMsg;
    }

    const medCount = medications.length;
    const dueTodayDoses = todaySchedule.filter((d) => d.status === 'due');
    const takenTodayDoses = todaySchedule.filter((d) => d.status === 'taken');
    const lowSupplyMeds = medications.filter((m) => m.remainingDays <= 7 && m.refillStatus !== 'pending');
    const pendingRefillOrders = refillOrders.filter((o) => o.status !== 'delivered');
    const nextAppointment = appointments.find((a) => a.status === 'upcoming');
    const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

    const medListStr = medications.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ');

    let summaryText = `You currently have ${medCount} active medication${medCount !== 1 ? 's' : ''}: ${medListStr}.\n\n`;

    if (todaySchedule.length > 0) {
      summaryText += `• Today's Schedule: ${dueTodayDoses.length} dose${dueTodayDoses.length !== 1 ? 's' : ''} currently due today (${dueTodayDoses.map((d) => `${d.medicationName} at ${d.scheduledTime}`).join(', ') || 'None'}), with ${takenTodayDoses.length} dose${takenTodayDoses.length !== 1 ? 's' : ''} already taken.\n`;
    }

    if (lowSupplyMeds.length > 0) {
      summaryText += `• Refill & Inventory Requirements: ${lowSupplyMeds.length} medication${lowSupplyMeds.length !== 1 ? 's are' : ' is'} running low and require refill (${lowSupplyMeds.map((m) => `${m.name} has ${m.remainingDays} days / ${m.pillsRemaining} pills remaining`).join(', ')}).\n`;
    } else {
      summaryText += `• Refill & Inventory Requirements: All medication supplies are currently sufficient with no pending low-stock warnings.\n`;
    }

    if (pendingRefillOrders.length > 0) {
      summaryText += `• Active Refill Orders: ${pendingRefillOrders.length} order in fulfillment pipeline (${pendingRefillOrders.map((o) => `Order #${o.id} for ${o.medicationName} - Status: ${o.status.replace(/_/g, ' ').toUpperCase()}`).join(', ')}).\n`;
    }

    summaryText += `• Medication Adherence: Recent compliance is ${p.adherenceRate}%, with an active streak of ${p.streakDays} consecutive day${p.streakDays !== 1 ? 's' : ''}.\n`;

    if (nextAppointment) {
      summaryText += `• Next Doctor Appointment: Scheduled with ${nextAppointment.doctorName} (${nextAppointment.department}) on ${nextAppointment.dateTime} at ${nextAppointment.location}.\n`;
    }

    if (latestVital) {
      summaryText += `• Recent Health Records: Arterial blood pressure logged at ${latestVital.systolicBP}/${latestVital.diastolicBP} mmHg with heart rate of ${latestVital.heartRate} BPM (Vitals recorded: ${latestVital.timestamp}).\n`;
    }

    summaryText += `\n[Informational Notice: This is an AI-generated informational health summary synthesized exclusively from your verified MediSync patient records. It does not constitute a medical diagnosis, clinical prognosis, or doctor prescription.]`;

    setLatestAiSummary(summaryText);

    addAuditLog(
      currentUser.name,
      activeRole,
      `Generated AI Healthcare Summary for ${p.name}`,
      'prescription',
      p.id,
      'Automated patient data synthesis of current medications, adherence, refill status, and vitals.'
    );

    addToast(`AI Health Summary synthesized for ${p.name}`, 'success');
    return summaryText;
  };

  const markPharmacyAlertRead = (id: string) => {
    setPharmacyAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const deletePharmacyAlert = (id: string) => {
    setPharmacyAlerts((prev) => prev.filter((a) => a.id !== id));
    addToast('Pharmacy alert dismissed', 'info');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.role === 'all' || n.role === activeRole ? { ...n, read: true } : n
      )
    );
    addToast('Marked all notifications as read', 'success');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    addToast('Notification removed', 'info');
  };

  const clearAllNotifications = () => {
    // Clear notifications belonging to active role or 'all'
    setNotifications((prev) =>
      prev.filter((n) => n.role !== 'all' && n.role !== activeRole)
    );
    addToast('All role notifications cleared', 'info');
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true, read: true } : a))
    );
    addToast('Alert acknowledged', 'info');
  };

  const reorderInventoryStock = (itemId: string, quantity: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentStock: item.currentStock + quantity,
              daysRemaining: Math.round((item.currentStock + quantity) / (item.dailyDemand || 1)),
              status: 'healthy',
            }
          : item
      )
    );
    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Triggered warehouse restock for inventory #${itemId} (+${quantity} units)`,
      'refill',
      itemId,
      'Automated replenishment order issued to wholesale distributor.'
    );
    addToast(`Restock order for +${quantity} units placed with supplier!`, 'success');
  };

  const addAppointment = (aptData: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
    };
    setAppointments((prev) => [newApt, ...prev]);
    addToast(`Booked appointment with ${newApt.doctorName} for ${newApt.dateTime}`, 'success');
    addAuditLog(
      currentUser.name,
      activeRole,
      `Booked appointment with ${newApt.doctorName}`,
      'appointment' as any,
      newApt.id,
      `${newApt.type} scheduled for ${newApt.dateTime} at ${newApt.location}`
    );
    addNotification({
      role: 'all',
      title: `New Appointment Scheduled`,
      message: `${newApt.patientName} scheduled ${newApt.type} with ${newApt.doctorName} on ${newApt.dateTime}.`,
      type: 'info',
      link: 'appointments',
    });
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );
    addToast('Appointment cancelled.', 'info');
  };

  const value = {
    activeRole,
    currentUser,
    switchRole,
    isLoggedIn,
    loginAs,
    logout,
    language,
    changeLanguage,
    t,
    largeTextMode,
    setLargeTextMode,
    highContrastMode,
    setHighContrastMode,
    reducedMotion,
    setReducedMotion,
    patient,
    otherPatients,
    todaySchedule,
    medications,
    refillOrders,
    prescriptions,
    vitals,
    alerts,
    pharmacyAlerts,
    inventory,
    appointments,
    messages,
    auditLogs,
    notifications,
    latestAiSummary,
    markDoseTaken,
    markDoseMissed,
    applyAdaptiveDelay,
    createRefillOrder,
    updateOrderStatus,
    updateRefillOrderStatus: updateOrderStatus,
    reorderInventoryStock,
    addAppointment,
    cancelAppointment,
    createPrescription,
    updatePrescriptionPharmacyStatus,
    addVital,
    addPrescriptionFromScan,
    sendMessage,
    triggerEmergencySos,
    generateAiSummary,
    markNotificationRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    deleteNotification,
    markPharmacyAlertRead,
    deletePharmacyAlert,
    addNotification,
    acknowledgeAlert,
    addToast,
    toasts,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
