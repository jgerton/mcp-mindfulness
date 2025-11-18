import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  friendIds?: Types.ObjectId[];
  blockedUserIds?: Types.ObjectId[];
  friends?: Types.ObjectId[];
  blockedUsers?: Types.ObjectId[];
  preferences?: {
    stressManagement?: {
      preferredCategories?: string[];
      preferredDuration?: number;
      difficultyLevel?: string;
    }
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  friendIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUserIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  preferences: {
    type: Object,
    default: {
      stressManagement: {
        preferredCategories: ['breathing', 'meditation'],
        preferredDuration: 10,
        difficultyLevel: 'beginner'
      }
    }
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for friends and blocked users
userSchema.virtual('friends').get(function(this: IUser) {
  return this.friendIds;
});

userSchema.virtual('blockedUsers').get(function(this: IUser) {
  return this.blockedUserIds;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', userSchema); 