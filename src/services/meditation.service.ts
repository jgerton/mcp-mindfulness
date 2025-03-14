import { Meditation } from '../models/meditation.model';

export class MeditationService {
  static async getAllMeditations() {
    return Meditation.find({ isActive: true });
  }

  static async getMeditationById(id: string) {
    return Meditation.findById(id);
  }

  static async createMeditation(meditationData: any) {
    const meditation = new Meditation(meditationData);
    return meditation.save();
  }

  static async updateMeditation(id: string, updateData: any) {
    return Meditation.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteMeditation(id: string) {
    return Meditation.findByIdAndDelete(id);
  }
} 