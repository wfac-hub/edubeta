

/**
 * This file contains shared utility functions used across multiple components in the application.
 * Centralizing them here helps to avoid code duplication and improves maintainability.
 */

import { AcademyProfile, Role } from "../types";

/**
 * Generates a deterministic background color from a string (e.g., initials).
 * @param str - The input string.
 * @returns A Tailwind CSS background color class name.
 */
export const getRandomColor = (str: string): string => {
    if (!str) return 'bg-gray-500';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

/**
 * Calculates the age based on a birth date string.
 * @param birthDate - The birth date in 'YYYY-MM-DD' format.
 * @returns The calculated age in years, or 0 if the date is invalid.
 */
export const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

/**
 * Checks if a date string corresponds to today (ignoring the year).
 * @param dateString - The date string (e.g. birth date)
 * @returns true if day and month match today
 */
export const isSameDayMonth = (dateString?: string): boolean => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    
    // Check for valid date
    if (isNaN(d.getTime())) return false;

    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
};

/**
 * Determines if the birthday module visuals should be shown for the current user.
 */
export const checkBirthdayVisibility = (userRole: Role | undefined, profile: AcademyProfile): boolean => {
    if (!profile.studentBirthdayModule) return false;
    if (!userRole) return false;

    if (userRole === Role.ADMIN || userRole === Role.COORDINATOR || userRole === Role.FINANCIAL_MANAGER) {
        return true;
    }
    if (userRole === Role.TEACHER) {
        return profile.notifyTeachersBirthdays;
    }
    return false;
};

/**
 * Formats a date string into a user-friendly locale string.
 * @param dateString - The date string to format (e.g., ISO string).
 * @returns A formatted date string (e.g., 'dd/mm/yyyy'), or '--' if the date is invalid.
 */
export const formatDate = (dateString?: string): string => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('es-ES');
};

/**
 * Formats a date string into a full date and time string.
 * @param dateString - The date string to format (e.g., ISO string).
 * @returns A formatted date and time string (e.g., 'dd/mm/yyyy HH:MM'), or '--' if the date is invalid.
 */
export const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).replace(',', '');
};

/**
 * Validates a Spanish NIF/NIE/CIF number.
 * @param nif - The NIF/NIE/CIF string to validate.
 * @returns `true` if valid, `false` otherwise.
 */
export const validateNif = (nif: string): boolean => {
    if (!nif || typeof nif !== 'string') return false;
    
    const value = nif.toUpperCase().replace(/\s/g, '');

    // DNI (8 digits + 1 letter)
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    if (dniRegex.test(value)) {
        const dni = value.substring(0, 8);
        const letter = value.substring(8, 9);
        const validLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
        return validLetters.charAt(parseInt(dni, 10) % 23) === letter;
    }

    // NIE (X, Y, or Z + 7 digits + 1 letter)
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
    if (nieRegex.test(value)) {
        let numPart = value.substring(1, 8);
        const prefix = value.charAt(0);
        if (prefix === 'X') numPart = '0' + numPart;
        if (prefix === 'Y') numPart = '1' + numPart;
        if (prefix === 'Z') numPart = '2' + numPart;
        
        const letter = value.substring(8, 9);
        const validLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
        return validLetters.charAt(parseInt(numPart, 10) % 23) === letter;
    }

    // CIF (1 letter + 7 digits + 1 control character)
    const cifRegex = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
    if (cifRegex.test(value)) {
        const digits = value.substring(1, 8);
        let evenSum = 0;
        let oddSum = 0;

        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits[i], 10);
            if (i % 2 === 0) { // Odd positions (1st, 3rd, 5th, 7th)
                let double = digit * 2;
                oddSum += (double < 10) ? double : (Math.floor(double / 10) + (double % 10));
            } else { // Even positions (2nd, 4th, 6th)
                evenSum += digit;
            }
        }
        
        const totalSum = evenSum + oddSum;
        const lastDigit = totalSum % 10;
        const controlValue = lastDigit === 0 ? 0 : 10 - lastDigit;
        const controlChar = value.charAt(8);
        const firstLetter = value.charAt(0);

        if (/[ABEH]/.test(firstLetter)) { // Number control
            return controlValue.toString() === controlChar;
        } else if (/[NPQRSW]/.test(firstLetter)) { // Letter control
            return "JABCDEFGHI"[controlValue] === controlChar;
        } else { // Either
            return controlValue.toString() === controlChar || "JABCDEFGHI"[controlValue] === controlChar;
        }
    }

    return false;
};

/**
 * Sanitizes an HTML string to prevent XSS attacks by removing scripts and dangerous attributes.
 * @param html - The potentially unsafe HTML string.
 * @returns A sanitized HTML string.
 */
export const sanitizeHTML = (html: string): string => {
    if (!html) return '';
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove scripts
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Remove dangerous attributes from all elements
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
            const attributes = el.attributes;
            for (let i = attributes.length - 1; i >= 0; i--) {
                const attrName = attributes[i].name;
                const attrValue = attributes[i].value;
                if (
                    attrName.startsWith('on') || 
                    attrValue.trim().toLowerCase().startsWith('javascript:') ||
                    (attrValue.trim().toLowerCase().startsWith('data:') && !attrValue.trim().toLowerCase().startsWith('data:image'))
                ) {
                    el.removeAttribute(attrName);
                }
            }
        });

        return doc.body.innerHTML;
    } catch (e) {
        console.error("Error sanitizing HTML", e);
        return ""; // Fail safe
    }
};
