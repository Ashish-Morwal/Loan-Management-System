"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngineService = void 0;
class RuleEngineService {
    /**
     * Evaluates if a borrower profile satisfies eligibility business rules.
     * Checks age, salary, employment mode, and PAN card formatting constraints.
     */
    static evaluateBorrower(borrowerData) {
        const reasons = [];
        const { dob, monthlySalary, employmentMode, pan } = borrowerData;
        // 1. Validate Age (Between 23 and 50 inclusive)
        if (!dob) {
            reasons.push('Date of birth is required for evaluation');
        }
        else {
            const age = this.calculateAge(new Date(dob));
            if (age < 23 || age > 50) {
                reasons.push(`Borrower age must be between 23 and 50 years. Current calculated age is ${age}`);
            }
        }
        // 2. Validate Monthly Salary (>= 25000)
        if (monthlySalary === undefined) {
            reasons.push('Monthly salary is required for evaluation');
        }
        else if (monthlySalary < 25000) {
            reasons.push(`Monthly salary must be at least 25,000. Current salary is ${monthlySalary}`);
        }
        // 3. Validate Employment Mode (Must not be Unemployed)
        if (!employmentMode) {
            reasons.push('Employment mode is required for evaluation');
        }
        else if (employmentMode === 'Unemployed') {
            reasons.push('Unemployed borrowers are not eligible for loans');
        }
        // 4. Validate PAN Structure
        if (!pan) {
            reasons.push('PAN card number is required for evaluation');
        }
        else {
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
    static calculateAge(dob) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    }
}
exports.RuleEngineService = RuleEngineService;
