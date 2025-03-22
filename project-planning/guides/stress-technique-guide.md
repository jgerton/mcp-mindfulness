# Stress Management Techniques Developer Guide

## Overview

This guide provides details on the Stress Management Techniques feature implemented during Sprint Four. It covers the model structure, API endpoints, integration with other components, and guidelines for adding new techniques.

## Feature Components

The Stress Management Techniques feature consists of:

1. **Model**: Data structure for stress management techniques
2. **Service**: Business logic for technique management and recommendations
3. **Controller**: Request handling and response formatting
4. **Routes**: API endpoint definitions
5. **Integration**: Connection with stress tracking and meditation features

## Stress Technique Model

```typescript
// Schema Definition
const StressTechniqueSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['breathing', 'physical', 'mental', 'social', 'lifestyle']
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 60,
    default: 5
  },
  steps: {
    type: [String],
    required: true,
    validate: [arrayMinLength(1), 'Technique must have at least one step']
  },
  benefits: {
    type: [String],
    required: true,
    validate: [arrayMinLength(1), 'Technique must have at least one benefit']
  },
  effectiveness: {
    type: {
      low: Number,
      medium: Number,
      high: Number
    },
    required: true,
    default: {
      low: 20,
      medium: 40,
      high: 70
    }
  },
  contraindications: {
    type: [String],
    default: []
  },
  evidenceBase: {
    type: String,
    enum: ['scientific', 'clinical', 'traditional', 'anecdotal'],
    default: 'anecdotal'
  },
  resources: {
    type: [{
      title: String,
      url: String
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

## API Endpoints

### Get All Techniques

```
GET /api/stress-techniques
```

Parameters:
- `page` (optional): Page number for pagination
- `limit` (optional): Results per page
- `category` (optional): Filter by category
- `duration` (optional): Filter by maximum duration
- `sort` (optional): Sort field (name, category, duration)

Response:
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "nextPage": 2
  },
  "data": [
    {
      "_id": "60d21b4967d0d8992e610c85",
      "name": "Deep Breathing",
      "description": "A simple technique to reduce stress through controlled breathing",
      "category": "breathing",
      "duration": 5,
      "steps": ["Sit comfortably", "Breathe in slowly through your nose for 4 counts"],
      "benefits": ["Reduces physical tension", "Calms racing thoughts"]
      // ... other fields
    }
    // ... more techniques
  ]
}
```

### Get Technique by ID

```
GET /api/stress-techniques/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4967d0d8992e610c85",
    "name": "Deep Breathing",
    // ... all technique fields
  }
}
```

### Get Recommended Techniques

```
GET /api/stress-techniques/recommendations
```

Parameters:
- `stressLevel` (optional): User's current stress level (low, medium, high)
- `duration` (optional): Maximum time available (minutes)
- `category` (optional): Preferred category
- `limit` (optional): Number of recommendations (default: 3)

Response:
```json
{
  "success": true,
  "stressLevel": "high",
  "data": [
    {
      "_id": "60d21b4967d0d8992e610c85",
      "name": "Deep Breathing",
      "description": "A simple technique to reduce stress through controlled breathing",
      "category": "breathing",
      "effectiveness": 70,
      // ... other fields
    }
    // ... more recommendations
  ]
}
```

### Create New Technique

```
POST /api/stress-techniques
```

Request Body:
```json
{
  "name": "Progressive Muscle Relaxation",
  "description": "A technique that involves tensing and relaxing muscle groups",
  "category": "physical",
  "duration": 15,
  "steps": [
    "Sit or lie down comfortably",
    "Tense the muscles in your toes for 5 seconds",
    "Release and relax for 10 seconds",
    "Repeat for each muscle group, working up through the body"
  ],
  "benefits": [
    "Reduces physical tension",
    "Increases awareness of muscle sensations",
    "Promotes physical and mental relaxation"
  ],
  "effectiveness": {
    "low": 30,
    "medium": 50,
    "high": 75
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4967d0d8992e610c86",
    "name": "Progressive Muscle Relaxation",
    // ... all technique fields
  }
}
```

### Update Technique

```
PUT /api/stress-techniques/:id
```

Request Body: (partial update supported)
```json
{
  "duration": 10,
  "benefits": [
    "Reduces physical tension",
    "Increases awareness of muscle sensations",
    "Promotes physical and mental relaxation",
    "Helps with insomnia"
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4967d0d8992e610c86",
    "name": "Progressive Muscle Relaxation",
    "duration": 10,
    "benefits": ["Reduces physical tension", "Increases awareness of muscle sensations", "Promotes physical and mental relaxation", "Helps with insomnia"],
    // ... other updated fields
  }
}
```

### Delete Technique

```
DELETE /api/stress-techniques/:id
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

## Recommendation Algorithm

The stress technique recommendation algorithm considers:

1. User's current stress level
2. Technique effectiveness at that stress level
3. Time available (technique duration)
4. User preferences (category)
5. Past user feedback on techniques

The algorithm implementation is in `src/services/stressTechniqueService.ts`:

```typescript
async function getRecommendedTechniques(
  stressLevel = 'medium',
  duration = 30,
  category = null,
  limit = 3
) {
  // Query building logic based on parameters
  const query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (duration) {
    query.duration = { $lte: duration };
  }
  
  // Get effectiveness field matching stress level
  const effectivenessField = `effectiveness.${stressLevel}`;
  
  // Find techniques matching criteria and sort by effectiveness
  const techniques = await StressTechnique.find(query)
    .sort({ [effectivenessField]: -1 })
    .limit(limit);
  
  return techniques.map(technique => ({
    ...technique.toObject(),
    effectiveness: technique.effectiveness[stressLevel]
  }));
}
```

## Integration with Other Components

### Stress Management Integration

The Stress Techniques feature integrates with the Stress Management component to:

1. Receive user stress level data
2. Track technique usage effectiveness
3. Improve personalized recommendations

```typescript
// Sample integration in stress tracking service
async function logStressWithTechnique(userId, stressData, techniqueId) {
  // Log stress data
  const stressEntry = await StressEntry.create({
    userId,
    level: stressData.level,
    symptoms: stressData.symptoms,
    triggers: stressData.triggers
  });
  
  // Log technique usage
  if (techniqueId) {
    await TechniqueUsage.create({
      userId,
      techniqueId,
      stressEntryId: stressEntry._id,
      effectivenessRating: stressData.techniqueEffectiveness,
      notes: stressData.techniqueNotes
    });
    
    // Update technique effectiveness data (if rated)
    if (stressData.techniqueEffectiveness) {
      await updateTechniqueEffectivenessData(
        techniqueId,
        stressData.level,
        stressData.techniqueEffectiveness
      );
    }
  }
  
  return stressEntry;
}
```

### Meditation Integration

Stress Techniques integrate with the Meditation component by:

1. Offering breathing techniques that can be used in meditation
2. Providing guided sessions that incorporate stress reduction
3. Tracking technique effectiveness after meditation sessions

## Adding New Techniques

Follow these steps when adding new stress management techniques:

1. **Research**: Gather evidence-based information about the technique
2. **Categorize**: Assign an appropriate category
3. **Structure**: Break down the technique into clear steps
4. **Evaluate**: Determine effectiveness ratings based on evidence
5. **Resources**: Include references to supporting resources

### Example Implementation

```typescript
// Example implementation in a database seed file
const newTechnique = {
  name: "5-4-3-2-1 Grounding Technique",
  description: "A sensory awareness technique to reduce anxiety and stress by focusing on the present moment",
  category: "mental",
  duration: 5,
  steps: [
    "Look around and name 5 things you can see",
    "Name 4 things you can touch or feel",
    "Name 3 things you can hear",
    "Name 2 things you can smell",
    "Name 1 thing you can taste"
  ],
  benefits: [
    "Redirects focus from stressful thoughts",
    "Grounds you in the present moment",
    "Reduces symptoms of anxiety and panic",
    "Easy to practice anywhere"
  ],
  effectiveness: {
    low: 40,
    medium: 65,
    high: 55
  },
  contraindications: [],
  evidenceBase: "clinical",
  resources: [
    {
      title: "Grounding Techniques for Anxiety",
      url: "https://www.example.com/grounding-techniques"
    }
  ]
};

await StressTechnique.create(newTechnique);
```

## Testing Guidelines

When testing stress management techniques:

1. **Model Validation**: Test schema validation rules
2. **API Endpoints**: Test all CRUD operations
3. **Recommendation Algorithm**: Test with various parameters
4. **Integration**: Test with stress tracking and meditation features

### Example Test

```typescript
describe('Stress Technique Recommendation', () => {
  it('should recommend techniques based on stress level', async () => {
    // Setup test data with known effectiveness values
    await StressTechnique.create([
      {
        name: "Technique A",
        description: "Test",
        category: "breathing",
        duration: 5,
        steps: ["Step 1"],
        benefits: ["Benefit 1"],
        effectiveness: { low: 20, medium: 30, high: 80 }
      },
      {
        name: "Technique B",
        description: "Test",
        category: "physical",
        duration: 10,
        steps: ["Step 1"],
        benefits: ["Benefit 1"],
        effectiveness: { low: 50, medium: 70, high: 40 }
      }
    ]);
    
    // Get recommendations for high stress
    const highStressRecommendations = await stressTechniqueService.getRecommendedTechniques('high', 30, null, 2);
    
    // Expect Technique A to be first (higher effectiveness for high stress)
    expect(highStressRecommendations[0].name).toBe("Technique A");
    expect(highStressRecommendations[0].effectiveness).toBe(80);
    
    // Get recommendations for low stress
    const lowStressRecommendations = await stressTechniqueService.getRecommendedTechniques('low', 30, null, 2);
    
    // Expect Technique B to be first (higher effectiveness for low stress)
    expect(lowStressRecommendations[0].name).toBe("Technique B");
    expect(lowStressRecommendations[0].effectiveness).toBe(50);
  });
});
```

## Mobile Optimization

The Stress Techniques API includes mobile optimizations:

1. **Payload Optimization**: Optional field selection for smaller responses
2. **Response Time**: Sub-150ms target for recommendations
3. **Offline Support**: Cacheable responses with appropriate headers
4. **Bandwidth Usage**: Pagination and result limiting

## Schema Dependencies

The Stress Technique feature has the following schema dependencies:

- **User**: For technique usage tracking and personalization
- **Stress Entry**: For correlating techniques with stress measurements
- **Technique Usage**: For tracking effectiveness of techniques
- **Meditation Session**: For integration with meditation feature

## Related Documentation

- [Swagger API Documentation](./swagger-documentation-guide.md)
- [Mobile Integration Guide](./mobile-integration-guide.md)
- [Data Export API Guide](./data-export-guide.md)
- [Sprint Four Implementation](../sprints/sprint-four-tasks/implement-remaining-features.md) 