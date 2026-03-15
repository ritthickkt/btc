// Shared map data/constants used by both native and web map screens.

export const UNSW_REGION = {
  latitude: -33.9175,
  longitude: 151.2313,
  latitudeDelta: 0.012,
  longitudeDelta: 0.010,
};

export const BUILDINGS = [
  {
    id: '1', name: 'Quadrangle', code: 'E15', type: 'Iconic',
    lat: -33.9175, lng: 151.2311,
    description: 'The sandstone heart of UNSW — home to the Great Hall and beautiful courtyards.',
  },
  {
    id: '2', name: 'John Niland Scientia', code: 'E8', type: 'Admin',
    lat: -33.9162, lng: 151.2305,
    description: 'UNSW\'s signature building, housing senior administration and function spaces.',
  },
  {
    id: '3', name: 'UNSW Library', code: 'F21', type: 'Library',
    lat: -33.9184, lng: 151.2302,
    description: 'The main campus library with study spaces, books, and digital research resources.',
  },
  {
    id: '4', name: 'Ainsworth Building', code: 'J17', type: 'Engineering',
    lat: -33.9170, lng: 151.2337,
    description: 'Home to Electrical Engineering & Telecommunications, with labs and lecture rooms.',
  },
  {
    id: '5', name: 'Electrical Engineering', code: 'G17', type: 'Engineering',
    lat: -33.9181, lng: 151.2327,
    description: 'Engineering labs and lecture theatres dedicated to EE students.',
  },
  {
    id: '6', name: 'Mathews Building', code: 'F23', type: 'Academic',
    lat: -33.9192, lng: 151.2291,
    description: 'High-capacity lecture theatres used across many faculties.',
  },
  {
    id: '7', name: 'Biological Sciences', code: 'E26', type: 'Science',
    lat: -33.9196, lng: 151.2319,
    description: 'Research and teaching labs for the School of Biotechnology & Biomolecular Sciences.',
  },
  {
    id: '8', name: 'Law Building', code: 'F8', type: 'Academic',
    lat: -33.9172, lng: 151.2286,
    description: 'Home to UNSW Law & Justice — one of Australia\'s top law schools.',
  },
  {
    id: '9', name: 'Physics Building', code: 'D17', type: 'Science',
    lat: -33.9190, lng: 151.2318,
    description: 'Home to the School of Physics, including world-class quantum research labs.',
  },
  {
    id: '10', name: 'Tyree Energy Technologies', code: 'H6', type: 'Engineering',
    lat: -33.9163, lng: 151.2330,
    description: 'State-of-the-art energy research facility.',
  },
  {
    id: '11', name: 'Central Lecture Block', code: 'F14', type: 'Academic',
    lat: -33.9186, lng: 151.2308,
    description: 'High-capacity theatres hosting large cohort lectures.',
  },
  {
    id: '12', name: 'Computer Science & Eng.', code: 'K17', type: 'Engineering',
    lat: -33.9196, lng: 151.2337,
    description: 'Home to the School of CSE — labs, offices, and collaborative hacker spaces.',
  },
  {
    id: '13', name: 'Roundhouse', code: 'E6', type: 'Social',
    lat: -33.9153, lng: 151.2313,
    description: 'UNSW\'s iconic entertainment venue for live events, gigs, and performances.',
  },
  {
    id: '14', name: 'Arc @ UNSW', code: 'C22', type: 'Social',
    lat: -33.9177, lng: 151.2324,
    description: 'Student union building — clubs, societies, food, and student services.',
  },
  {
    id: '15', name: 'Rupert Myers Building', code: 'E19', type: 'Academic',
    lat: -33.9172, lng: 151.2300,
    description: 'Graduate School of Management and Business School lecture rooms.',
  },
  {
    id: '16', name: 'Chemical Sciences', code: 'F10', type: 'Science',
    lat: -33.9194, lng: 151.2302,
    description: 'Teaching and research facilities for the School of Chemistry.',
  },
  {
    id: '17', name: 'Red Centre', code: 'E26', type: 'Academic',
    lat: -33.9179, lng: 151.2343,
    description: 'Home to Maths, Stats, and the School of Built Environment.',
  },
  {
    id: '18', name: 'Colombo Theatres', code: 'C', type: 'Academic',
    lat: -33.9168, lng: 151.2322,
    description: 'Large lecture theatres at the heart of campus.',
  },
];

export const TYPE_CONFIG = {
  Iconic:      { color: '#F5C518' },
  Admin:       { color: '#4dabf7' },
  Library:     { color: '#2f9e44' },
  Engineering: { color: '#f76707' },
  Science:     { color: '#7950f2' },
  Academic:    { color: '#1a1a1a' },
  Social:      { color: '#e64980' },
};

export const FILTERS = ['All', 'Academic', 'Engineering', 'Science', 'Social', 'Admin', 'Library'];

export const LOCATION_COORDS = {
  'Main Library':                        { latitude: -33.9184, longitude: 151.2302 },
  'Quadrangle (E15)':                    { latitude: -33.9175, longitude: 151.2311 },
  'Ainsworth Building (J17)':            { latitude: -33.9170, longitude: 151.2337 },
  'Electrical Engineering (G17)':        { latitude: -33.9181, longitude: 151.2327 },
  'Mathews Building (F23)':              { latitude: -33.9192, longitude: 151.2291 },
  'Law Building (F8)':                   { latitude: -33.9172, longitude: 151.2286 },
  'Biological Sciences (E26)':           { latitude: -33.9196, longitude: 151.2319 },
  'Physics Building (D17)':              { latitude: -33.9190, longitude: 151.2318 },
  'Computer Science & Eng. (K17)':       { latitude: -33.9196, longitude: 151.2337 },
  'Central Lecture Block (F14)':         { latitude: -33.9186, longitude: 151.2308 },
  'Tyree Energy Technologies (H6)':      { latitude: -33.9163, longitude: 151.2330 },
  'John Niland Scientia (E8)':           { latitude: -33.9162, longitude: 151.2305 },
  'Rupert Myers Building (E19)':         { latitude: -33.9172, longitude: 151.2300 },
  'Red Centre':                          { latitude: -33.9179, longitude: 151.2343 },
  'Arc @ UNSW (C22)':                    { latitude: -33.9177, longitude: 151.2324 },
  'Roundhouse (E6)':                     { latitude: -33.9153, longitude: 151.2313 },
  'ASB (Australian School of Business)': { latitude: -33.9167, longitude: 151.2296 },
  'Colombo Theatres (C)':                { latitude: -33.9168, longitude: 151.2322 },
  'Rex Vowels Building':                 { latitude: -33.9196, longitude: 151.2337 },
  'Chemical Sciences Building':          { latitude: -33.9194, longitude: 151.2302 },
};
