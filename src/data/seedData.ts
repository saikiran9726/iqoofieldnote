import type {
  Report,
  Finding,
  Action,
  Evidence,
  Asset,
  Site,
  Transcript,
  Template,
  GlossaryEntry,
  AppSettings,
} from '../shared/types';
import { GENESIS_HASH, createEditHistoryEntry } from '../lib/hashChain';

export const SEED_SITES: Site[] = [
  {
    id: 'site-kukatpally',
    code: 'HYD-METRO-KPT',
    name: 'Kukatpally Metro Site',
    location: 'Metro Pillar 742, Kukatpally, Hyderabad, Telangana',
    activeAuditsCount: 5,
  },
  {
    id: 'site-miyapur',
    code: 'HYD-DEPOT-MYP',
    name: 'Miyapur Depot & Substation',
    location: 'Rolling Stock Maintenance Depot, Miyapur, Hyderabad',
    activeAuditsCount: 3,
  },
  {
    id: 'site-gachibowli',
    code: 'HYD-TECH-GCB',
    name: 'Gachibowli Substation Hub',
    location: 'Financial District Sector 3, Gachibowli, Hyderabad',
    activeAuditsCount: 4,
  },
];

export const SEED_ASSETS: Asset[] = [
  {
    id: 'asset-panel-204',
    tagId: 'PANEL-204',
    name: 'Main Substation Distribution Panel 204',
    category: 'Electrical Switchgear',
    siteId: 'site-kukatpally',
    siteName: 'Kukatpally Metro Site',
    lastInspected: '2026-09-18T11:42:00.000Z',
    status: 'critical',
    issueHistory: [
      {
        issue: 'Loose terminal block lugs B-phase',
        date: '2026-09-18T11:42:00.000Z',
        reportId: 'rep-hero-001',
        severity: 'high',
      },
      {
        issue: 'Thermal hot spot detected on terminal block B',
        date: '2026-09-15T09:15:00.000Z',
        reportId: 'rep-002',
        severity: 'medium',
      },
      {
        issue: 'Vibration loosening on feeder terminal lugs',
        date: '2026-09-13T14:30:00.000Z',
        reportId: 'rep-003',
        severity: 'medium',
      },
    ],
  },
  {
    id: 'asset-trans-01',
    tagId: 'TR-101-MIY',
    name: '33kV/415V Step-Down Transformer',
    category: 'Power Transformers',
    siteId: 'site-miyapur',
    siteName: 'Miyapur Depot & Substation',
    lastInspected: '2026-09-17T16:00:00.000Z',
    status: 'operational',
    issueHistory: [],
  },
  {
    id: 'asset-pump-042',
    tagId: 'PUMP-HYD-042',
    name: 'High-Pressure Hydraulic Sump Pump',
    category: 'Hydraulics',
    siteId: 'site-gachibowli',
    siteName: 'Gachibowli Substation Hub',
    lastInspected: '2026-09-16T10:20:00.000Z',
    status: 'maintenance_required',
    issueHistory: [
      {
        issue: 'Minor oil seal weeping',
        date: '2026-09-16T10:20:00.000Z',
        reportId: 'rep-005',
        severity: 'low',
      },
    ],
  },
];

export const SEED_TEMPLATES: Template[] = [
  {
    id: 'tpl-electrical',
    name: 'Substation Electrical Audit',
    category: 'Electrical',
    fields: [
      { name: 'panelId', type: 'text', required: true, defaultConfidenceThreshold: 0.85 },
      { name: 'voltage', type: 'number', required: true },
      { name: 'thermalCondition', type: 'select', required: true },
    ],
  },
  {
    id: 'tpl-civil',
    name: 'Structural Concrete & Pillar Audit',
    category: 'Civil',
    fields: [
      { name: 'pillarNumber', type: 'text', required: true },
      { name: 'crackWidthMm', type: 'number', required: false },
    ],
  },
];

export const SEED_GLOSSARY: GlossaryEntry[] = [
  {
    id: 'glo-1',
    term: 'MCB',
    definition: 'Miniature Circuit Breaker — automatic electrical switch used to protect low voltage circuits.',
    language: 'en',
    expansion: 'Miniature Circuit Breaker',
  },
  {
    id: 'glo-2',
    term: 'లూజ్ కనెక్షన్లు (Loose Connections)',
    transliteration: 'Loose connections',
    definition: 'Terminals or lugs with insufficient torque leading to arcing and thermal rise.',
    language: 'te',
  },
  {
    id: 'glo-3',
    term: 'కేబుల్ ఇన్సులేషన్ (Cable Insulation)',
    transliteration: 'Cable insulation',
    definition: 'Protective non-conductive dielectric sheath preventing short circuits.',
    language: 'te',
  },
];

export const SEED_SETTINGS: AppSettings = {
  id: 'current',
  engineKind: 'simulated',
  syncEnabled: false,
  theme: 'dark',
  preferredLanguage: 'en-US',
  volumeButtonTrigger: false,
  useOnlineSpeech: false,
};

// Hero transcript with code-mixed Telugu + English and exact offsets
const HERO_RAW_TRANSCRIPT =
  'Panel daggara loose connections unnaayi. Three loose connections observed at terminal block B, phase R cable insulation is damaged. Emi problem ledu immediate ga tighten cheyyali, repati morning shift lopala action complete kaavali.';

export const SEED_TRANSCRIPTS: Transcript[] = [
  {
    id: 'tr-hero-001',
    reportId: 'rep-hero-001',
    rawText: HERO_RAW_TRANSCRIPT,
    audioDurationMs: 15400,
    segments: [
      {
        text: 'Panel daggara loose connections unnaayi.',
        startMs: 0,
        endMs: 3800,
        startChar: 0,
        endChar: 40,
        language: 'te',
        confidence: 0.94,
      },
      {
        text: 'Three loose connections observed at terminal block B, phase R cable insulation is damaged.',
        startMs: 3800,
        endMs: 9800,
        startChar: 41,
        endChar: 131,
        language: 'en',
        confidence: 0.98,
      },
      {
        text: 'Emi problem ledu immediate ga tighten cheyyali, repati morning shift lopala action complete kaavali.',
        startMs: 9800,
        endMs: 15400,
        startChar: 132,
        endChar: 233,
        language: 'te',
        confidence: 0.92,
      },
    ],
  },
];

export const SEED_FINDINGS: Finding[] = [
  // Hero report findings
  {
    id: 'find-hero-01',
    reportId: 'rep-hero-001',
    text: '3 loose connections detected on Terminal Block B lugs with severe thermal discolouration.',
    category: 'Electrical Terminals',
    severity: 'high',
    confidence: 0.96,
    isVerified: true,
    assetId: 'asset-panel-204',
    occurrences: 3,
    locationDetails: 'Terminal Block B (Lugs 4, 5, 6)',
  },
  {
    id: 'find-hero-02',
    reportId: 'rep-hero-001',
    text: '1 damaged cable insulation sheath on incoming Phase R 16mm² feeder conductor.',
    category: 'Cable Integrity',
    severity: 'high',
    confidence: 0.91,
    isVerified: false,
    assetId: 'asset-panel-204',
    locationDetails: 'Phase R Incomer Conduit',
  },
  // Other reports findings
  {
    id: 'find-02-01',
    reportId: 'rep-002',
    text: 'Thermal hotspot signature (+18°C above ambient) on Terminal Block B contact surface.',
    category: 'Thermal Imaging',
    severity: 'medium',
    confidence: 0.89,
    isVerified: true,
    assetId: 'asset-panel-204',
    occurrences: 2,
  },
  {
    id: 'find-03-01',
    reportId: 'rep-003',
    text: 'Minor mechanical vibration causing initial torque loss on feeder terminal screws.',
    category: 'Mechanical Vibration',
    severity: 'medium',
    confidence: 0.84,
    isVerified: true,
    assetId: 'asset-panel-204',
    occurrences: 1,
  },
  {
    id: 'find-04-01',
    reportId: 'rep-004',
    text: 'Commissioning baseline established: all lugs torqued to 18 Nm with zero heat signature.',
    category: 'Commissioning Baseline',
    severity: 'low',
    confidence: 0.99,
    isVerified: true,
    assetId: 'asset-panel-204',
  },
  {
    id: 'find-05-01',
    reportId: 'rep-005',
    text: 'Sump pump discharge oil seal weeping under high head pressure (6.2 bar).',
    category: 'Hydraulics',
    severity: 'low',
    confidence: 0.88,
    isVerified: true,
    assetId: 'asset-pump-042',
  },
];

export const SEED_ACTIONS: Action[] = [
  // Hero report actions (Deadline 19 Sep 2026 morning)
  {
    id: 'act-hero-01',
    reportId: 'rep-hero-001',
    title: 'Tighten all 3 terminal lugs with calibrated torque wrench (18 Nm) before morning shift',
    description: 'Ensure breaker is isolated, apply anti-oxidation paste, and re-torque to 18 Nm spec.',
    assignee: 'K. Rao (Electrical Team Lead)',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-09-19T08:00:00.000Z',
    isCompleted: false,
  },
  {
    id: 'act-hero-02',
    reportId: 'rep-hero-001',
    title: 'Replace damaged 16mm² heat-resistant cable sleeve on Phase R',
    description: 'Install double-wall heat shrink tubing rated for 125°C continuous operation.',
    assignee: 'S. Reddy (Field Technician)',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-09-19T10:00:00.000Z',
    isCompleted: false,
  },
  // Additional tasks
  {
    id: 'act-02-01',
    reportId: 'rep-002',
    title: 'Schedule infrared thermography follow-up on Panel 204',
    assignee: 'Thermal Audit Unit',
    priority: 'medium',
    status: 'done',
    dueDate: '2026-09-16T17:00:00.000Z',
    isCompleted: true,
  },
  {
    id: 'act-05-01',
    reportId: 'rep-005',
    title: 'Replace hydraulic pump seal kit B-42 during weekend downtime',
    assignee: 'Mechanical Maintenance Team',
    priority: 'low',
    status: 'todo',
    dueDate: '2026-09-22T12:00:00.000Z',
    isCompleted: false,
  },
];

export const SEED_EVIDENCE: Evidence[] = [
  {
    id: 'evi-hero-01',
    reportId: 'rep-hero-001',
    type: 'photo',
    caption: 'Thermal discoloration and loose terminal lug on Phase B',
    timestamp: '2026-09-18T11:43:10.000Z',
    geo: { latitude: 17.4875, longitude: 78.3953, accuracy: 3.2 },
  },
  {
    id: 'evi-hero-02',
    reportId: 'rep-hero-001',
    type: 'photo',
    caption: 'Phase R damaged insulation exposing copper core',
    timestamp: '2026-09-18T11:44:05.000Z',
    geo: { latitude: 17.4875, longitude: 78.3953, accuracy: 3.2 },
  },
];

export async function generateSeedReports(): Promise<Report[]> {
  const heroEdit1 = await createEditHistoryEntry({
    id: 'edit-hero-001',
    entityId: 'rep-hero-001',
    entityType: 'report',
    field: 'summary',
    before: 'Draft field recording in progress...',
    after: 'Audited electrical switchgear. 3 loose connections found on Terminal Block B and damaged Phase R insulation.',
    prevHash: GENESIS_HASH,
    timestamp: '2026-09-18T11:42:30.000Z',
  });

  const heroEdit2 = await createEditHistoryEntry({
    id: 'edit-hero-002',
    entityId: 'rep-hero-001',
    entityType: 'report',
    field: 'priority',
    before: 'medium',
    after: 'high',
    prevHash: heroEdit1.hash,
    timestamp: '2026-09-18T11:43:00.000Z',
  });

  const heroReport: Report = {
    id: 'rep-hero-001',
    title: 'Electrical Inspection — Substation Panel Audit',
    category: 'ELECTRICAL INSPECTION',
    siteId: 'site-kukatpally',
    siteName: 'Kukatpally Metro Site',
    inspector: 'K. S. Rao (Field Eng #104)',
    createdAt: '2026-09-18T11:42:00.000Z',
    status: 'in_review',
    priority: 'high',
    priorityReason: 'Critical thermal load and loose terminals pose immediate fire hazard',
    deadline: '19 Sep 2026 morning',
    geo: {
      latitude: 17.4947,
      longitude: 78.3996,
      accuracy: 4.5,
      address: 'Metro Pillar 742, Kukatpally, Hyderabad, Telangana',
    },
    summary:
      '3 loose connections detected on Terminal Block B with severe thermal oxidation. Phase R feeder cable has chafed insulation exposing conductor. Immediate torquing and sleeve replacement mandated before morning shift.',
    findings: SEED_FINDINGS.filter((f) => f.reportId === 'rep-hero-001'),
    actions: SEED_ACTIONS.filter((a) => a.reportId === 'rep-hero-001'),
    evidenceIds: ['evi-hero-01', 'evi-hero-02'],
    editHistory: [heroEdit1, heroEdit2],
    isHero: true,
    panelId: undefined, // Initially missing per specification
    isPanelIdMissing: true, // Prompts QuestionCard
    overallConfidence: 0.94,
    confidenceBreakdown: {
      findings: 0.94,
      category: 0.97,
      deadline: 0.81,
      location: 0.99,
    },
  };

  const report2: Report = {
    id: 'rep-002',
    title: 'Routine Weekly Audit — PANEL-204 Thermal Check',
    siteId: 'site-kukatpally',
    siteName: 'Kukatpally Metro Site',
    inspector: 'K. S. Rao (Field Eng #104)',
    createdAt: '2026-09-15T09:15:00.000Z',
    status: 'verified',
    priority: 'medium',
    priorityReason: 'Thermal gradient rising above 60°C on Terminal Block B',
    summary: 'Infrared scan identified elevated temperature on distribution bus. Second occurrence of terminal warmth on this unit.',
    findings: SEED_FINDINGS.filter((f) => f.reportId === 'rep-002'),
    actions: SEED_ACTIONS.filter((a) => a.reportId === 'rep-002'),
    evidenceIds: [],
    editHistory: [],
    panelId: 'PANEL-204',
    overallConfidence: 0.91,
  };

  const report3: Report = {
    id: 'rep-003',
    title: 'Vibration & Torque Check — Distribution Rack',
    siteId: 'site-kukatpally',
    siteName: 'Kukatpally Metro Site',
    inspector: 'S. Reddy (Tech #088)',
    createdAt: '2026-09-13T14:30:00.000Z',
    status: 'verified',
    priority: 'medium',
    summary: 'Trackside train harmonic vibration causing gradual torque relaxation on switchgear lugs.',
    findings: SEED_FINDINGS.filter((f) => f.reportId === 'rep-003'),
    actions: [],
    evidenceIds: [],
    editHistory: [],
    panelId: 'PANEL-204',
    overallConfidence: 0.88,
  };

  const report4: Report = {
    id: 'rep-004',
    title: 'Commissioning Certification — PANEL-204 Baseline',
    siteId: 'site-kukatpally',
    siteName: 'Kukatpally Metro Site',
    inspector: 'Chief Inspector V. Murthy',
    createdAt: '2026-09-12T08:00:00.000Z',
    status: 'verified',
    priority: 'low',
    summary: 'Initial energisation sign-off for Main Substation Distribution Panel 204. Full torque specs verified.',
    findings: SEED_FINDINGS.filter((f) => f.reportId === 'rep-004'),
    actions: [],
    evidenceIds: [],
    editHistory: [],
    panelId: 'PANEL-204',
    overallConfidence: 0.99,
  };

  const report5: Report = {
    id: 'rep-005',
    title: 'Hydraulic Sump Pump Inspection — Pit 3',
    siteId: 'site-gachibowli',
    siteName: 'Gachibowli Substation Hub',
    inspector: 'Field Tech M. Farooq',
    createdAt: '2026-09-16T10:20:00.000Z',
    status: 'verified',
    priority: 'low',
    summary: 'Routine sump drainage inspection. Fluid seals showing minor seepage under maximum head.',
    findings: SEED_FINDINGS.filter((f) => f.reportId === 'rep-005'),
    actions: SEED_ACTIONS.filter((a) => a.reportId === 'rep-005'),
    evidenceIds: [],
    editHistory: [],
    overallConfidence: 0.92,
  };

  const report6: Report = {
    id: 'rep-006',
    title: '33kV Transformer Bushing Dielectric Test',
    siteId: 'site-miyapur',
    siteName: 'Miyapur Depot & Substation',
    inspector: 'Eng. P. Ananth',
    createdAt: '2026-09-17T16:00:00.000Z',
    status: 'verified',
    priority: 'low',
    summary: 'Dielectric loss angle (Tan Delta) test within IEEE acceptable limits for 33kV transformer unit.',
    findings: [],
    actions: [],
    evidenceIds: [],
    editHistory: [],
    overallConfidence: 0.97,
  };

  const report7: Report = {
    id: 'rep-007',
    title: 'Miyapur Track Feeder Protection Relay Audit',
    siteId: 'site-miyapur',
    siteName: 'Miyapur Depot & Substation',
    inspector: 'Eng. P. Ananth',
    createdAt: '2026-09-14T11:10:00.000Z',
    status: 'verified',
    priority: 'medium',
    summary: 'Overcurrent and earth fault trip curves verified on numeric protection relays.',
    findings: [],
    actions: [],
    evidenceIds: [],
    editHistory: [],
    overallConfidence: 0.95,
  };

  const report8: Report = {
    id: 'rep-008',
    title: 'Emergency Generator Battery Bank Assessment',
    siteId: 'site-gachibowli',
    siteName: 'Gachibowli Substation Hub',
    inspector: 'Field Tech M. Farooq',
    createdAt: '2026-09-13T09:00:00.000Z',
    status: 'verified',
    priority: 'low',
    summary: '110V DC station battery bank specific gravity and internal cell resistance test passed.',
    findings: [],
    actions: [],
    evidenceIds: [],
    editHistory: [],
    overallConfidence: 0.96,
  };

  const report9: Report = {
    id: 'rep-009',
    title: 'Fire Suppression & Gas Flooding Interlock Audit',
    siteId: 'site-kukatpally',
    siteName: 'Kukatpally Metro Site',
    inspector: 'Safety Officer N. Chari',
    createdAt: '2026-09-14T15:45:00.000Z',
    status: 'verified',
    priority: 'low',
    summary: 'Clean agent fire suppression actuators and smoke optical sensors tested 100% functional.',
    findings: [],
    actions: [],
    evidenceIds: [],
    editHistory: [],
    overallConfidence: 0.98,
  };

  const report10: Report = {
    id: 'rep-010',
    title: 'Gachibowli High-Mast Yard Lighting Survey',
    siteId: 'site-gachibowli',
    siteName: 'Gachibowli Substation Hub',
    inspector: 'Field Tech M. Farooq',
    createdAt: '2026-09-12T19:30:00.000Z',
    status: 'verified',
    priority: 'low',
    summary: 'Substation switchyard illumination levels meet Indian Standard IS-3646 specifications.',
    findings: [],
    actions: [],
    evidenceIds: [],
    editHistory: [],
    overallConfidence: 0.93,
  };

  const report11: Report = {
    id: 'rep-011',
    title: 'Underground Cable Trench Dewatering Audit',
    siteId: 'site-miyapur',
    siteName: 'Miyapur Depot & Substation',
    inspector: 'Eng. P. Ananth',
    createdAt: '2026-09-18T08:30:00.000Z',
    status: 'draft',
    priority: 'medium',
    summary: 'Post-monsoon rainwater buildup in cable duct #4. Auto-sump float switch operational.',
    findings: [],
    actions: [],
    evidenceIds: [],
    editHistory: [],
    overallConfidence: 0.89,
  };

  return [
    heroReport,
    report2,
    report3,
    report4,
    report5,
    report6,
    report7,
    report8,
    report9,
    report10,
    report11,
  ];
}
