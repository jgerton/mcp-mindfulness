import mongoose from 'mongoose';

export interface IParticipantSessionData {
  durationCompleted: number;
  startTime: Date;
  endTime?: Date;
}

export interface IParticipant {
  userId: mongoose.Types.ObjectId;
  status: 'joined' | 'left' | 'completed';
  duration: number;
  joinedAt: Date;
  leftAt?: Date;
  sessionData?: IParticipantSessionData;
}

export interface IGroupSession {
  hostId: mongoose.Types.ObjectId;
  meditationId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  scheduledTime: Date;
  duration: number;
  maxParticipants: number;
  participants: IParticipant[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  isPrivate: boolean;
  allowedParticipants?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isFull(): boolean;
  canUserJoin(userId: mongoose.Types.ObjectId): boolean;
}

const participantSchema = new mongoose.Schema<IParticipant>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['joined', 'left', 'completed'], default: 'joined' },
  duration: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
  sessionData: {
    durationCompleted: { type: Number, default: 0 },
    startTime: { type: Date },
    endTime: { type: Date }
  }
});

const groupSessionSchema = new mongoose.Schema<IGroupSession>({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meditationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meditation', required: true },
  title: { type: String, required: true },
  description: { type: String },
  scheduledTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  participants: [participantSchema],
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isPrivate: { type: Boolean, default: false },
  allowedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

groupSessionSchema.methods.isFull = function(): boolean {
  const activeParticipants = this.participants.filter((p: IParticipant) => p.status === 'joined').length;
  return activeParticipants >= this.maxParticipants;
};

groupSessionSchema.methods.canUserJoin = function(userId: mongoose.Types.ObjectId): boolean {
  if (this.status !== 'scheduled' && this.status !== 'in_progress') return false;
  if (this.participants.some((p: IParticipant) => p.userId.equals(userId) && p.status === 'joined')) return false;
  if (this.isPrivate && !this.allowedParticipants?.some((id: mongoose.Types.ObjectId) => id.equals(userId))) return false;
  const activeParticipants = this.participants.filter((p: IParticipant) => p.status === 'joined').length;
  return activeParticipants < this.maxParticipants;
};

export const GroupSession = mongoose.model<IGroupSession>('GroupSession', groupSessionSchema); 