// config/recommendation.config.js
module.exports = {
  // Recommendation types
  types: {
    event: {
      weight: 1.0,
      minScore: 0.5,
      maxResults: 10,
    },
    organizer: {
      weight: 0.8,
      minScore: 0.6,
      maxResults: 5,
    },
    category: {
      weight: 0.7,
      minScore: 0.4,
      maxResults: 5,
    },
  },

  // Factors and weights
  factors: {
    categoryMatch: 0.3,
    locationMatch: 0.2,
    pastAttendance: 0.25,
    savedEvents: 0.15,
    popularity: 0.1,
  },

  // Interaction weights
  interactions: {
    view: 0.1,
    bookmark: 0.3,
    purchase: 0.5,
    rating: 0.4,
    share: 0.2,
  },

  // Freshness decay
  freshness: {
    enabled: true,
    halfLifeDays: 30, // Events lose half their score after this many days
    maxAgeDays: 90, // Events older than this are not recommended
  },

  // Diversity settings
  diversity: {
    enabled: true,
    categoryPenalty: 0.2, // Penalty for recommending multiple events in the same category
    organizerPenalty: 0.3, // Penalty for recommending multiple events from the same organizer
  },

  // Cache settings
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 6 * 60 * 60 * 1000, // 6 hours
  },
}
