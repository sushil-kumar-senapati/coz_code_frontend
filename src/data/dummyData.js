// PIN code directory lookup (dummy)
export const PIN_CODES = {
  '751001': { postalName: 'GPO Bhubaneswar', locality: 'Rajmahal Square', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751002': { postalName: 'Secretariat', locality: 'Sachivalaya Marg', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751003': { postalName: 'Unit II', locality: 'Unit II', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751004': { postalName: 'Ashok Nagar', locality: 'Ashok Nagar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751005': { postalName: 'Vani Vihar', locality: 'University Area', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751006': { postalName: 'Saheed Nagar', locality: 'Saheed Nagar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751007': { postalName: 'Jaydev Vihar', locality: 'Jaydev Vihar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751009': { postalName: 'IRC Village', locality: 'Nayapalli', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751010': { postalName: 'VSS Nagar', locality: 'VSS Nagar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751012': { postalName: 'Khandagiri', locality: 'Khandagiri', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751014': { postalName: 'Mancheswar IE', locality: 'Mancheswar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751017': { postalName: 'Chandrasekharpur', locality: 'CSpur', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751019': { postalName: 'Niladri Vihar', locality: 'Niladri Vihar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751024': { postalName: 'Patia', locality: 'Patia Township', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
  '751030': { postalName: 'Infocity', locality: 'Infocity Area', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', constituency: 'Bhubaneswar' },
};

// Citizen's submissions (dummy)
export const CITIZEN_SUBMISSIONS = [
  { id: 'sub-001', trackingId: 'PP-2026-00001', inputType: 'text', rawText: 'The main road near Patia market has large potholes causing accidents', pinCode: '751024', status: 'approved', category: 'ROADS_PATHWAYS_BRIDGES', similarCount: 47, createdAt: '2026-05-15' },
  { id: 'sub-002', trackingId: 'PP-2026-00002', inputType: 'audio', rawText: 'Primary school in our area needs new classrooms', pinCode: '751024', status: 'pending_review', category: 'EDUCATION', similarCount: 23, createdAt: '2026-05-28' },
  { id: 'sub-003', trackingId: 'PP-2026-00003', inputType: 'image', rawText: 'No streetlights in Niladri Vihar sector 7', pinCode: '751019', status: 'processing', category: 'ELECTRICITY_SOLAR', similarCount: 12, createdAt: '2026-06-10' },
  { id: 'sub-004', trackingId: 'PP-2026-00004', inputType: 'text', rawText: 'Need drinking water pipeline in new colony area', pinCode: '751030', status: 'rejected_by_mp', category: 'DRINKING_WATER', similarCount: 8, mpReason: 'Water supply project already sanctioned under Jal Jeevan Mission for this area. MPLADS funds redirected to uncovered areas.', createdAt: '2026-06-15' },
  { id: 'sub-005', trackingId: 'PP-2026-00005', inputType: 'text_audio', rawText: 'Community hall needed near Unit II area for public gatherings', pinCode: '751003', status: 'clustered', category: 'SPORTS_COMMUNITY', similarCount: 31, createdAt: '2026-06-22' },
];

// MP Dashboard clusters (dummy)
export const MP_CLUSTERS = [
  { id: 'cl-001', rank: 1, summary: 'Road repair near Patia market — multiple potholes causing daily accidents and traffic congestion', sector: 'ROADS_PATHWAYS_BRIDGES', citizenCount: 47, uniqueUsers: 42, villages: ['Patia', 'CSpur', 'Niladri Vihar'], pinCodes: ['751024', '751017', '751019'], score: 92.5, estimatedCost: 1800000, status: 'pending_review', firstReported: '2026-03-12', lastReported: '2026-06-28' },
  { id: 'cl-002', rank: 2, summary: 'Community hall construction near Unit II for public gatherings and cultural events', sector: 'SPORTS_COMMUNITY', citizenCount: 31, uniqueUsers: 28, villages: ['Unit II', 'Ashok Nagar', 'Saheed Nagar'], pinCodes: ['751003', '751004', '751006'], score: 87.3, estimatedCost: 2500000, status: 'pending_review', firstReported: '2026-04-05', lastReported: '2026-06-25' },
  { id: 'cl-003', rank: 3, summary: 'Primary school expansion — need 4 additional classrooms to reduce overcrowding', sector: 'EDUCATION', citizenCount: 23, uniqueUsers: 21, villages: ['Patia', 'Infocity'], pinCodes: ['751024', '751030'], score: 85.1, estimatedCost: 3200000, status: 'pending_review', firstReported: '2026-04-18', lastReported: '2026-06-20' },
  { id: 'cl-004', rank: 4, summary: 'Streetlights installation in Niladri Vihar sectors 5-8 for safety', sector: 'ELECTRICITY_SOLAR', citizenCount: 19, uniqueUsers: 17, villages: ['Niladri Vihar'], pinCodes: ['751019'], score: 78.8, estimatedCost: 950000, status: 'pending_review', firstReported: '2026-05-01', lastReported: '2026-06-18' },
  { id: 'cl-005', rank: 5, summary: 'PHC needs additional doctor and medical equipment in Mancheswar area', sector: 'HEALTH_FAMILY_WELFARE', citizenCount: 15, uniqueUsers: 14, villages: ['Mancheswar', 'IRC Village'], pinCodes: ['751014', '751009'], score: 76.2, estimatedCost: 1500000, status: 'pending_review', firstReported: '2026-05-10', lastReported: '2026-06-15' },
  { id: 'cl-006', rank: 6, summary: 'Drainage and sanitation improvement near Khandagiri residential area', sector: 'SANITATION', citizenCount: 14, uniqueUsers: 12, villages: ['Khandagiri'], pinCodes: ['751012'], score: 73.5, estimatedCost: 1200000, status: 'approved', firstReported: '2026-04-22', lastReported: '2026-06-12', approvedAmount: 1200000, approvedDate: '2026-06-30' },
  { id: 'cl-007', rank: 7, summary: 'Drinking water pipeline extension to new colony in Infocity area', sector: 'DRINKING_WATER', citizenCount: 11, uniqueUsers: 10, villages: ['Infocity'], pinCodes: ['751030'], score: 70.1, estimatedCost: 800000, status: 'rejected_by_mp', firstReported: '2026-05-20', lastReported: '2026-06-10', mpReason: 'Water supply project already sanctioned under Jal Jeevan Mission for this area.' },
  { id: 'cl-008', rank: 8, summary: 'Railway level crossing safety barrier near Mancheswar station', sector: 'RAILWAY_SAFETY', citizenCount: 8, uniqueUsers: 7, villages: ['Mancheswar'], pinCodes: ['751014'], score: 65.4, estimatedCost: 600000, status: 'approved', firstReported: '2026-05-25', lastReported: '2026-06-08', approvedAmount: 600000, approvedDate: '2026-06-28' },
  { id: 'cl-009', rank: 9, summary: 'Solar-powered street lighting along Vani Vihar university road', sector: 'ELECTRICITY_SOLAR', citizenCount: 6, uniqueUsers: 6, villages: ['Vani Vihar'], pinCodes: ['751005'], score: 58.9, estimatedCost: 750000, status: 'pending_review', firstReported: '2026-06-01', lastReported: '2026-06-28' },
  { id: 'cl-010', rank: 10, summary: 'Tree plantation drive along NH connecting Jaydev Vihar to CSpur', sector: 'ENVIRONMENT', citizenCount: 5, uniqueUsers: 5, villages: ['Jaydev Vihar', 'CSpur'], pinCodes: ['751007', '751017'], score: 52.3, estimatedCost: 400000, status: 'pending_review', firstReported: '2026-06-05', lastReported: '2026-06-25' },
];

// Budget data (dummy)
export const BUDGET_DATA = {
  constituency: 'Bhubaneswar',
  financialYear: '2026-27',
  totalBudget: 50000000,
  totalAllocated: 18000000,
  totalSpent: 12500000,
  scStAllocated: 4500000,
  scStMinRequired: 11250000,
  projectsApproved: 12,
  projectsPending: 8,
  projectsRejected: 3,
  yearlyData: [
    { year: '2022-23', allocated: 42000000, spent: 38000000, approved: 18, rejected: 4 },
    { year: '2023-24', allocated: 45000000, spent: 41000000, approved: 21, rejected: 3 },
    { year: '2024-25', allocated: 38000000, spent: 35000000, approved: 16, rejected: 5 },
    { year: '2025-26', allocated: 47000000, spent: 44000000, approved: 22, rejected: 2 },
    { year: '2026-27', allocated: 18000000, spent: 12500000, approved: 12, rejected: 3 },
  ],
};

// Category distribution data (dummy)
export const CATEGORY_STATS = [
  { category: 'ROADS_PATHWAYS_BRIDGES', count: 47, color: '#f97316' },
  { category: 'EDUCATION', count: 23, color: '#3b82f6' },
  { category: 'SPORTS_COMMUNITY', count: 31, color: '#8b5cf6' },
  { category: 'ELECTRICITY_SOLAR', count: 25, color: '#eab308' },
  { category: 'HEALTH_FAMILY_WELFARE', count: 15, color: '#ef4444' },
  { category: 'SANITATION', count: 14, color: '#22c55e' },
  { category: 'DRINKING_WATER', count: 11, color: '#06b6d4' },
  { category: 'RAILWAY_SAFETY', count: 8, color: '#ec4899' },
  { category: 'ENVIRONMENT', count: 5, color: '#10b981' },
  { category: 'IRRIGATION_FLOOD_CONTROL', count: 3, color: '#6366f1' },
];

// Area-wise stats for citizen dashboard
export const AREA_STATS = {
  totalIssues: 182,
  approved: 42,
  pending: 28,
  rejected: 8,
  inProgress: 14,
  completed: 90,
};

// MP Recent decisions
export const MP_DECISIONS = [
  { id: 'dec-001', clusterSummary: 'Drainage improvement Khandagiri', decision: 'approved', amount: 1200000, reason: 'Critical infrastructure need affecting 12 families during monsoon', date: '2026-06-30' },
  { id: 'dec-002', clusterSummary: 'Railway crossing barrier Mancheswar', decision: 'approved', amount: 600000, reason: 'Safety issue — 3 accidents reported in last 6 months', date: '2026-06-28' },
  { id: 'dec-003', clusterSummary: 'Drinking water pipeline Infocity', decision: 'rejected', amount: null, reason: 'Water supply project already sanctioned under Jal Jeevan Mission for this area. MPLADS funds redirected to uncovered areas.', date: '2026-06-25' },
];
