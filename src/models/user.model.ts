import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  username: string;
  email: string;
  password: string;
  friendIds: mongoose.Types.ObjectId[];
  blockedUserIds: mongoose.Types.ObjectId[];
  friends?: mongoose.Types.ObjectId[];
  blockedUsers?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
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
      required: true,
      minlength: 6
    },
    friendIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    blockedUserIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    lastLogin: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

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

export const User = mongoose.model<IUser>('User', userSchema); 