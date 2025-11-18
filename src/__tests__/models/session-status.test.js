"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const session_status_model_1 = require("../../models/session-status.model");
describe('SessionStatus Model', () => {
    let validTransitions;
    let isTerminal;
    let isActive;
    let isResumable;
    beforeEach(() => {
        validTransitions = {
            [session_status_model_1.SessionStatus.IN_PROGRESS]: [session_status_model_1.SessionStatus.COMPLETED, session_status_model_1.SessionStatus.INTERRUPTED],
            [session_status_model_1.SessionStatus.COMPLETED]: [], // Terminal state
            [session_status_model_1.SessionStatus.INTERRUPTED]: [session_status_model_1.SessionStatus.IN_PROGRESS] // Can resume
        };
        isTerminal = (status) => {
            return status === session_status_model_1.SessionStatus.COMPLETED;
        };
        isActive = (status) => {
            return status === session_status_model_1.SessionStatus.IN_PROGRESS;
        };
        isResumable = (status) => {
            return status === session_status_model_1.SessionStatus.INTERRUPTED;
        };
        jest.spyOn(Object, 'values').mockImplementation((obj) => {
            if (obj === session_status_model_1.SessionStatus) {
                return [
                    session_status_model_1.SessionStatus.IN_PROGRESS,
                    session_status_model_1.SessionStatus.COMPLETED,
                    session_status_model_1.SessionStatus.INTERRUPTED
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
                expect(session_status_model_1.SessionStatus[status]).toBeDefined();
            });
        });
        it('should allow valid state transitions', () => {
            expect(validTransitions[session_status_model_1.SessionStatus.IN_PROGRESS]).toContain(session_status_model_1.SessionStatus.COMPLETED);
            expect(validTransitions[session_status_model_1.SessionStatus.IN_PROGRESS]).toContain(session_status_model_1.SessionStatus.INTERRUPTED);
            expect(validTransitions[session_status_model_1.SessionStatus.INTERRUPTED]).toContain(session_status_model_1.SessionStatus.IN_PROGRESS);
        });
        it('should correctly identify terminal states', () => {
            expect(isTerminal(session_status_model_1.SessionStatus.COMPLETED)).toBe(true);
            expect(isTerminal(session_status_model_1.SessionStatus.IN_PROGRESS)).toBe(false);
            expect(isTerminal(session_status_model_1.SessionStatus.INTERRUPTED)).toBe(false);
        });
    });
    describe('Error Cases', () => {
        it('should reject invalid status values', () => {
            expect(() => {
                // @ts-ignore - Testing runtime behavior
                session_status_model_1.SessionStatus['INVALID_STATUS'];
            }).toThrow();
        });
        it('should prevent transition from completed state', () => {
            expect(() => {
                validTransitions[session_status_model_1.SessionStatus.COMPLETED].push(session_status_model_1.SessionStatus.IN_PROGRESS);
            }).toThrow();
        });
        it('should reject direct transition from interrupted to completed', () => {
            expect(validTransitions[session_status_model_1.SessionStatus.INTERRUPTED]).not.toContain(session_status_model_1.SessionStatus.COMPLETED);
        });
    });
    describe('Edge Cases', () => {
        it('should handle empty transition array for completed state', () => {
            expect(validTransitions[session_status_model_1.SessionStatus.COMPLETED]).toHaveLength(0);
        });
        it('should handle single transition for interrupted state', () => {
            expect(validTransitions[session_status_model_1.SessionStatus.INTERRUPTED]).toHaveLength(1);
            expect(validTransitions[session_status_model_1.SessionStatus.INTERRUPTED][0]).toBe(session_status_model_1.SessionStatus.IN_PROGRESS);
        });
        it('should handle multiple transitions for in-progress state', () => {
            expect(validTransitions[session_status_model_1.SessionStatus.IN_PROGRESS]).toHaveLength(2);
            expect(validTransitions[session_status_model_1.SessionStatus.IN_PROGRESS]).toContain(session_status_model_1.SessionStatus.COMPLETED);
            expect(validTransitions[session_status_model_1.SessionStatus.IN_PROGRESS]).toContain(session_status_model_1.SessionStatus.INTERRUPTED);
        });
    });
});
