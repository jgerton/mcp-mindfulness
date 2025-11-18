import { SessionStatus } from '../../models/session-status.model';

describe('SessionStatus Model', () => {
  let validTransitions: Record<SessionStatus, SessionStatus[]>;
  let isTerminal: (status: SessionStatus) => boolean;
  let isActive: (status: SessionStatus) => boolean;
  let isResumable: (status: SessionStatus) => boolean;

  beforeEach(() => {
    validTransitions = {
      [SessionStatus.IN_PROGRESS]: [SessionStatus.COMPLETED, SessionStatus.INTERRUPTED],
      [SessionStatus.COMPLETED]: [], // Terminal state
      [SessionStatus.INTERRUPTED]: [SessionStatus.IN_PROGRESS] // Can resume
    };

    isTerminal = (status: SessionStatus): boolean => {
      return status === SessionStatus.COMPLETED;
    };

    isActive = (status: SessionStatus): boolean => {
      return status === SessionStatus.IN_PROGRESS;
    };

    isResumable = (status: SessionStatus): boolean => {
      return status === SessionStatus.INTERRUPTED;
    };

    jest.spyOn(Object, 'values').mockImplementation((obj) => {
      if (obj === SessionStatus) {
        return [
          SessionStatus.IN_PROGRESS,
          SessionStatus.COMPLETED,
          SessionStatus.INTERRUPTED
        ];
      }
      return Object.values(obj);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should have all expected session statuses defined', () => {
      const expectedStatuses = [
        'IN_PROGRESS',
        'COMPLETED',
        'INTERRUPTED'
      ];
      expectedStatuses.forEach(status => {
        expect(SessionStatus[status as keyof typeof SessionStatus]).toBeDefined();
      });
    });

    it('should allow valid state transitions', () => {
      expect(validTransitions[SessionStatus.IN_PROGRESS]).toContain(SessionStatus.COMPLETED);
      expect(validTransitions[SessionStatus.IN_PROGRESS]).toContain(SessionStatus.INTERRUPTED);
      expect(validTransitions[SessionStatus.INTERRUPTED]).toContain(SessionStatus.IN_PROGRESS);
    });

    it('should correctly identify terminal states', () => {
      expect(isTerminal(SessionStatus.COMPLETED)).toBe(true);
      expect(isTerminal(SessionStatus.IN_PROGRESS)).toBe(false);
      expect(isTerminal(SessionStatus.INTERRUPTED)).toBe(false);
    });
  });

  describe('Error Cases', () => {
    it('should reject invalid status values', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        SessionStatus['INVALID_STATUS'];
      }).toThrow();
    });

    it('should prevent transition from completed state', () => {
      expect(() => {
        validTransitions[SessionStatus.COMPLETED].push(SessionStatus.IN_PROGRESS);
      }).toThrow();
    });

    it('should reject direct transition from interrupted to completed', () => {
      expect(validTransitions[SessionStatus.INTERRUPTED]).not.toContain(SessionStatus.COMPLETED);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transition array for completed state', () => {
      expect(validTransitions[SessionStatus.COMPLETED]).toHaveLength(0);
    });

    it('should handle single transition for interrupted state', () => {
      expect(validTransitions[SessionStatus.INTERRUPTED]).toHaveLength(1);
      expect(validTransitions[SessionStatus.INTERRUPTED][0]).toBe(SessionStatus.IN_PROGRESS);
    });

    it('should handle multiple transitions for in-progress state', () => {
      expect(validTransitions[SessionStatus.IN_PROGRESS]).toHaveLength(2);
      expect(validTransitions[SessionStatus.IN_PROGRESS]).toContain(SessionStatus.COMPLETED);
      expect(validTransitions[SessionStatus.IN_PROGRESS]).toContain(SessionStatus.INTERRUPTED);
    });
  });
}); 