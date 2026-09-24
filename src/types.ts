export type Role = 'patient' | 'caregiver' | 'doctor' | 'pharmacy';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'kn'
  | 'ta'
  | 'te'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'es'
  | 'fr'
  | 'zh';

export type DoseStatus = 'taken' | 'upcoming' | 'due' | 'late' | 'missed';

export interface DoseSchedule {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // "08:00 AM"
  status: DoseStatus;
  takenAt?: string;
  foodRule: 'before_food' | 'after_food' | 'with_food' | 'empty_stomach';
  notes?: string;
  isAdaptiveDelayed?: boolean;
  originalScheduledTime?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  timing: string; // e.g., "Morning (8:00 AM)"
  foodInstruction: string;
  remainingDays: number;
  totalDays: number;
  pillsRemaining: number;
  pillsTotal: number;
  pillDetails: {
    shape: string;
    color: string;
    imprint: string;
    size: string;
    description: string;
  };
  warnings: string[];
  refillStatus: 'healthy' | 'refill_recommended' | 'critical' | 'pending';
  prescribedBy: string;
  startDate: string;
}

export type OrderStatus = 'pending_preparation' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';

export interface RefillOrder {
  id: string;
  patientId: string;
  patientName: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  requestedAt: string;
  priority: 'routine' | 'urgent';
  status: OrderStatus;
  deliveryMethod: 'pickup' | 'home_delivery';
  deliveryAddress?: string;
  pharmacyId: string;
  pharmacyName: string;
  history: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  trackingCoordinates?: {
    lat: number;
    lng: number;
    etaMinutes: number;
    currentLocationName: string;
  };
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorLicense: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  timing: string;
  durationDays: number;
  instructions: string;
  foodInstruction: string;
  refillsAllowed: number;
  refillsRemaining: number;
  issuedDate: string;
  status: 'active' | 'pending_review' | 'dispensed' | 'expired';
  pharmacyStatus: 'approved' | 'review_required' | 'rejected' | 'dispensed';
  ocrSourceImage?: string;
  ocrConfidence?: number;
}

export interface VitalRecord {
  id: string;
  patientId: string;
  timestamp: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  weightKg: number;
  mood: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  notes?: string;
}

export interface CareAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'missed_dose' | 'refill_needed' | 'vital_spike' | 'interaction_warning' | 'sos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  acknowledged: boolean;
  actionRequired?: string;
}

export type PharmacyAlertType = 'STOCK' | 'ORDER' | 'PRESCRIPTION';

export interface PharmacyAlert {
  id: string;
  type: PharmacyAlertType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  relatedOrderId?: string;
  relatedPrescriptionId?: string;
  relatedMedicineId?: string;
}

export interface InventoryItem {
  id: string;
  medicationName: string;
  dosage: string;
  currentStock: number;
  dailyDemand: number;
  daysRemaining: number;
  expiryDate: string;
  status: 'healthy' | 'low_stock' | 'critical' | 'expiring';
  unit: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: Role;
  action: string;
  timestamp: string;
  entityType: 'dose' | 'refill' | 'prescription' | 'vital' | 'sos' | 'message';
  entityId: string;
  details: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  identifier: string; // Medical ID, Dependent ID, Doctor License, Pharmacy License
  avatar: string;
  title: string;
  facilityOrRelationship: string;
  phone: string;
  email: string;
  language: LanguageCode;
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  medicalId: string;
  avatar: string;
  conditions: string[];
  allergies: string[];
  adherenceRate: number;
  streakDays: number;
  lastDoseTime: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  readmissionRiskPercent: number;
  lastAppointment: string;
  primaryDoctor: string;
  caregiverName: string;
  caregiverPhone: string;
  emergencyAddress: string;
  emergencyCoords: { lat: number; lng: number };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  dateTime: string;
  type: 'In-person Clinic' | 'Telehealth Video' | 'Routine Follow-up' | 'Lab Work';
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  receiverId: string;
  receiverRole: Role;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: string;
  role: Role | 'all';
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  link?: string;
}
