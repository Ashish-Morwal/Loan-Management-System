import { Borrower, IBorrower, IBorrowerDocument } from '../models/Borrower';
import { AppError } from '../utils/appError';

export class BorrowerService {
  /**
   * Create a borrower profile for a user.
   */
  public static async createProfile(
    userId: string,
    profileData: Partial<IBorrower>
  ): Promise<IBorrowerDocument> {
    const { fullName, pan, dob, monthlySalary, employmentMode } = profileData;

    if (!fullName || !pan || !dob || monthlySalary === undefined || !employmentMode) {
      throw new AppError('fullName, pan, dob, monthlySalary, and employmentMode are required', 400);
    }

    // 1. Check if user already has a borrower profile
    const existingProfile = await Borrower.findOne({ user: userId });
    if (existingProfile) {
      throw new AppError('Borrower profile already exists for this user', 400);
    }

    // 2. Check if PAN is already registered
    const normalizedPan = pan.toUpperCase();
    const existingPan = await Borrower.findOne({ pan: normalizedPan });
    if (existingPan) {
      throw new AppError('PAN number is already registered', 400);
    }

    // 3. Create borrower profile
    const newProfile = await Borrower.create({
      user: userId,
      fullName,
      pan: normalizedPan,
      dob,
      monthlySalary,
      employmentMode,
    });

    return newProfile;
  }

  /**
   * Get borrower profile for a specific user ID.
   */
  public static async getProfileByUserId(userId: string): Promise<IBorrowerDocument> {
    const profile = await Borrower.findOne({ user: userId }).populate('user', 'name email role');
    if (!profile) {
      throw new AppError('Borrower profile not found for this user', 404);
    }
    return profile;
  }

  /**
   * Get borrower profile by profile ID.
   */
  public static async getProfileById(profileId: string): Promise<IBorrowerDocument> {
    const profile = await Borrower.findById(profileId).populate('user', 'name email role');
    if (!profile) {
      throw new AppError('Borrower profile not found', 404);
    }
    return profile;
  }

  /**
   * Update borrower profile for the logged-in user.
   */
  public static async updateProfile(
    userId: string,
    updateData: Partial<IBorrower>
  ): Promise<IBorrowerDocument> {
    // 1. Retrieve the existing profile
    const profile = await Borrower.findOne({ user: userId });
    if (!profile) {
      throw new AppError('Borrower profile not found for this user', 404);
    }

    // 2. If PAN is modified, check for duplicates
    if (updateData.pan) {
      const normalizedPan = updateData.pan.toUpperCase();
      if (normalizedPan !== profile.pan) {
        const existingPan = await Borrower.findOne({ pan: normalizedPan });
        if (existingPan) {
          throw new AppError('PAN number is already registered by another user', 400);
        }
        profile.pan = normalizedPan;
      }
    }

    // 3. Update fields
    if (updateData.fullName) profile.fullName = updateData.fullName;
    if (updateData.dob) profile.dob = updateData.dob;
    if (updateData.monthlySalary !== undefined) profile.monthlySalary = updateData.monthlySalary;
    if (updateData.employmentMode) profile.employmentMode = updateData.employmentMode;

    // 4. Save and return updated profile
    const updatedProfile = await profile.save();
    return updatedProfile.populate('user', 'name email role');
  }

  /**
   * List all borrower profiles (e.g. for administrative verification).
   */
  public static async listAllBorrowers(): Promise<IBorrowerDocument[]> {
    return await Borrower.find().populate('user', 'name email role');
  }
}
