export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  challenges: EventChallengeTemplate[];
  bonus_multiplier: number;
  duration_days: number;
  category: 'weekly' | 'monthly' | 'seasonal' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_participants: number;
}

export interface EventChallengeTemplate {
  id: string;
  challenge_code: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  requirements?: string[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'weekly-challenge',
    name: 'Weekly Challenge',
    description: 'Tantangan mingguan untuk menjaga semangat belajar',
    icon: '📅',
    bonus_multiplier: 1.5,
    duration_days: 7,
    category: 'weekly',
    difficulty: 'medium',
    estimated_participants: 500,
    challenges: [
      {
        id: 'daily-login',
        challenge_code: 'LOGIN_DAILY',
        description: 'Login harian selama 7 hari berturut-turut',
        points: 100,
        difficulty: 'easy',
        icon: '🔑',
        requirements: ['7 hari berturut-turut']
      },
      {
        id: 'question-master',
        challenge_code: 'QUEST_50',
        description: 'Selesaikan 50 pertanyaan dalam seminggu',
        points: 200,
        difficulty: 'medium',
        icon: '🧠',
        requirements: ['50 pertanyaan benar']
      },
      {
        id: 'streak-7',
        challenge_code: 'STREAK_WEEK',
        description: 'Pertahankan streak 7 hari',
        points: 300,
        difficulty: 'medium',
        icon: '🔥',
        requirements: ['7 hari streak']
      }
    ]
  },
  {
    id: 'math-master',
    name: 'Math Master Challenge',
    description: 'Fokus pada kemampuan matematika',
    icon: '🧮',
    bonus_multiplier: 2.0,
    duration_days: 14,
    category: 'monthly',
    difficulty: 'hard',
    estimated_participants: 300,
    challenges: [
      {
        id: 'math-100',
        challenge_code: 'MATH_100',
        description: 'Selesaikan 100 soal matematika',
        points: 500,
        difficulty: 'hard',
        icon: '📊',
        requirements: ['100 soal benar dari kategori Matematika']
      },
      {
        id: 'algebra-expert',
        challenge_code: 'ALGEBRA_50',
        description: 'Kuasai 50 soal aljabar',
        points: 300,
        difficulty: 'hard',
        icon: '🔢',
        requirements: ['50 soal aljabar benar']
      },
      {
        id: 'geometry-pro',
        challenge_code: 'GEOMETRY_30',
        description: 'Selesaikan 30 soal geometri',
        points: 250,
        difficulty: 'medium',
        icon: '📐',
        requirements: ['30 soal geometri benar']
      }
    ]
  },
  {
    id: 'english-pro',
    name: 'English Pro Challenge',
    description: 'Tantangan untuk meningkatkan kemampuan bahasa Inggris',
    icon: '🇺🇸',
    bonus_multiplier: 1.8,
    duration_days: 10,
    category: 'weekly',
    difficulty: 'medium',
    estimated_participants: 400,
    challenges: [
      {
        id: 'vocab-master',
        challenge_code: 'VOCAB_200',
        description: 'Pelajari 200 kata vocab baru',
        points: 200,
        difficulty: 'medium',
        icon: '📚',
        requirements: ['200 kata vocab dipelajari']
      },
      {
        id: 'grammar-king',
        challenge_code: 'GRAMMAR_50',
        description: 'Kuasai 50 soal grammar',
        points: 250,
        difficulty: 'medium',
        icon: '📝',
        requirements: ['50 soal grammar benar']
      },
      {
        id: 'reading-champ',
        challenge_code: 'READING_20',
        description: 'Baca 20 artikel bahasa Inggris',
        points: 300,
        difficulty: 'hard',
        icon: '📖',
        requirements: ['20 artikel dibaca']
      }
    ]
  },
  {
    id: 'seasonal-christmas',
    name: 'Christmas Special Challenge',
    description: 'Event spesial Natal dengan hadiah menarik',
    icon: '🎄',
    bonus_multiplier: 3.0,
    duration_days: 21,
    category: 'seasonal',
    difficulty: 'medium',
    estimated_participants: 1000,
    challenges: [
      {
        id: 'holiday-streak',
        challenge_code: 'HOLIDAY_STREAK',
        description: 'Pertahankan streak selama liburan Natal',
        points: 400,
        difficulty: 'medium',
        icon: '🎅',
        requirements: ['21 hari streak']
      },
      {
        id: 'gift-giver',
        challenge_code: 'GIFT_10',
        description: 'Bagikan 10 hadiah virtual ke teman',
        points: 150,
        difficulty: 'easy',
        icon: '🎁',
        requirements: ['10 hadiah dibagikan']
      },
      {
        id: 'christmas-quiz',
        challenge_code: 'XMAS_QUIZ',
        description: 'Selesaikan quiz spesial Natal',
        points: 250,
        difficulty: 'medium',
        icon: '🎄',
        requirements: ['Quiz Natal selesai']
      }
    ]
  },
  {
    id: 'new-year-marathon',
    name: 'New Year Marathon',
    description: 'Marathon belajar untuk menyambut tahun baru',
    icon: '🎊',
    bonus_multiplier: 2.5,
    duration_days: 31,
    category: 'special',
    difficulty: 'hard',
    estimated_participants: 800,
    challenges: [
      {
        id: 'jan-streak',
        challenge_code: 'JAN_STREAK',
        description: 'Login setiap hari di bulan Januari',
        points: 500,
        difficulty: 'hard',
        icon: '📆',
        requirements: ['31 hari berturut-turut']
      },
      {
        id: 'resolution-master',
        challenge_code: 'RESOLUTION_100',
        description: 'Selesaikan 100 soal dengan resolusi baru',
        points: 600,
        difficulty: 'hard',
        icon: '🎯',
        requirements: ['100 soal benar']
      },
      {
        id: 'team-spirit',
        challenge_code: 'TEAM_SPIRIT',
        description: 'Bantu 10 teman selesaikan tantangan',
        points: 300,
        difficulty: 'medium',
        icon: '🤝',
        requirements: ['10 teman dibantu']
      }
    ]
  }
];

export function getEventTemplateById(id: string): EventTemplate | undefined {
  return EVENT_TEMPLATES.find(template => template.id === id);
}

export function getEventTemplatesByCategory(category: 'weekly' | 'monthly' | 'seasonal' | 'special'): EventTemplate[] {
  return EVENT_TEMPLATES.filter(template => template.category === category);
}

export function getEventTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): EventTemplate[] {
  return EVENT_TEMPLATES.filter(template => template.difficulty === difficulty);
}