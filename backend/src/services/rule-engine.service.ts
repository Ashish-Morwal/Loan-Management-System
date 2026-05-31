import { IBorrower } from '../models/Borrower';

export interface EvaluationResult {
  approved: boolean;
  reasons: string[];
}

export class RuleEngineService {
  /**
   * Evaluates if a borrower profile satisfies eligibility business rules.
   * Checks age, salary, employment mode, and PAN card formatting constraints.
   */
  public static evaluateBorrower(borrowerData: Partial<IBorrower>): EvaluationResult {
    const reasons: string[] = [];
    const { dob, monthlySalary, employmentMode, pan } = borrowerData;

    // 1. Validate Age (Between 23 and 50 inclusive)
    if (!dob) {
      reasons.push('Date of birth is required for evaluation');
    } else {
      const age = this.calculateAge(new Date(dob));
      if (age < 23 || age > 50) {
        reasons.push(`Borrower age must be between 23 and 50 years. Current calculated age is ${age}`);
      }
    }

    // 2. Validate Monthly Salary (>= 25000)
    if (monthlySalary === undefined) {
      reasons.push('Monthly salary is required for evaluation');
    } else if (monthlySalary < 25000) {
      reasons.push(`Monthly salary must be at least 25,000. Current salary is ${monthlySalary}`);
    }

    // 3. Validate Employment Mode (Must not be Unemployed)
    if (!employmentMode) {
      reasons.push('Employment mode is required for evaluation');
    } else if (employmentMode === 'Unemployed') {
      reasons.push('Unemployed borrowers are not eligible for loans');
    }

    // 4. Validate PAN Structure
    if (!pan) {
      reasons.push('PAN card number is required for evaluation');
    } else {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan.toUpperCase())) {
        reasons.push('PAN card number must match the standard format (e.g., ABCDE1234F)');
      }
    }

    return {
      approved: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Helper to calculate age in years from Date of Birth.
   */
  private static calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }
}
