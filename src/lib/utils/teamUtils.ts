/**
 * Team utility functions for the EGC Conference app
 */

/**
 * Maps birth months to teams
 * - Jan, Feb, Mar -> Team Bethel
 * - Apr, May, Jun -> Team Judah
 * - Jul, Aug, Sep -> Team Salem
 * - Oct, Nov, Dec -> Team Shiloh
 * 
 * @param month Birth month (1-12)
 * @returns Team name
 */
export function getTeamFromBirthMonth(month: number): string {
  // Ensure month is between 1-12
  const safeMonth = Math.max(1, Math.min(12, month));
  
  // Map months to teams (3 months per team)
  if (safeMonth <= 3) {
    return 'Bethel';
  } else if (safeMonth <= 6) {
    return 'Judah';
  } else if (safeMonth <= 9) {
    return 'Salem';
  } else {
    return 'Shiloh';
  }
}

/**
 * Get team color based on team name
 * @param teamName Team name
 * @returns Hex color code
 */
export function getTeamColor(teamName: string): string {
  switch (teamName.toLowerCase()) {
    case 'bethel':
      return '#2563eb'; // Blue
    case 'judah':
      return '#e11d48'; // Red
    case 'salem':
      return '#16a34a'; // Green
    case 'shiloh':
      return '#eab308'; // Yellow
    default:
      return '#6d28d9'; // Purple (default)
  }
}

/**
 * Get team gradient based on team name
 * @param teamName Team name
 * @returns CSS gradient string
 */
export function getTeamGradient(teamName: string): string {
  switch (teamName.toLowerCase()) {
    case 'bethel':
      return 'background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);'; // Blue gradient
    case 'judah':
      return 'background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);'; // Red gradient
    case 'salem':
      return 'background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);'; // Green gradient
    case 'shiloh':
      return 'background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);'; // Yellow gradient
    default:
      return 'background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);'; // Purple gradient (default)
  }
}
