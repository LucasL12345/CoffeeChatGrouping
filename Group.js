
function groupAttendees(attendeesThisWeek, pairHistory, maxGroupSize) {
  // Handle empty attendee lists.
  if (!attendeesThisWeek || attendeesThisWeek.length === 0) {
    return [];
  }

  // Initialize pair history if it's not provided.
  if (!pairHistory) {
    pairHistory = {};
  }

  const numAttendees = attendeesThisWeek.length;

  //Calculates the score of groups based on previous pairings.
  function calculatePairingScore(group) {
    let score = 0;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        // Create a sorted pair string to ensure consistent keying.
        const pair = [group[i], group[j]].sort().join('-');
        score += pairHistory[pair] || 0; // Add pairing count from history.
      }
    }
    return score;
  }

  /**
   * Calculates a score based on how evenly distributed the group sizes are.
   * Lower scores indicate more even distributions.
   *
   * @param {string[][]} groups - Array of groups (arrays of attendee names).
   * @returns {number} - The evenness score.
   */
  function calculateEvennessScore(groups) {
    const groupSizes = groups.map((group) => group.length);
    const averageSize = numAttendees / groups.length;
    let evennessScore = 0;

    for (const size of groupSizes) {
      evennessScore += Math.abs(size - averageSize); // Sum the differences from the average.
    }

    return evennessScore;
  }

  /**
   * Recursively generates all possible group combinations.
   *
   * @param {string[]} remainingAttendees - Attendees yet to be assigned.
   * @param {string[][]} currentGroups - Current group assignments.
   * @returns {string[][][]} - Array of all possible group arrangements.
   */
  function createGroups(remainingAttendees, currentGroups) {
    if (remainingAttendees.length === 0) {
      return [currentGroups]; // Base case: all attendees assigned.
    }

    const attendee = remainingAttendees[0];
    const results = [];

    // Try adding the attendee to existing groups.
    for (let i = 0; i < currentGroups.length; i++) {
      if (currentGroups[i].length < maxGroupSize) {
        const newGroups = currentGroups.map((group, index) =>
          index === i ? [...group, attendee] : group
        );
        results.push(
          ...createGroups(remainingAttendees.slice(1), newGroups)
        );
      }
    }

    // Try creating a new group for the attendee.
    if (currentGroups.length < Math.ceil(numAttendees / maxGroupSize)) {
      results.push(
        ...createGroups(remainingAttendees.slice(1), [...currentGroups, [attendee]])
      );
    }

    return results;
  }

  // Generate all possible group combinations.
  const allPossibleGroups = createGroups(attendeesThisWeek, []);

  let bestGroups = null;
  let bestScore = Infinity;

  // Find the group combination with the lowest total score.
  for (const possibleGroups of allPossibleGroups) {
    const pairingScore = possibleGroups.reduce(
      (acc, group) => acc + calculatePairingScore(group),
      0
    );
    const evennessScore = calculateEvennessScore(possibleGroups);
    const totalScore = pairingScore + evennessScore * 10; // Prioritize evenness.

    if (totalScore < bestScore) {
      bestScore = totalScore;
      bestGroups = possibleGroups;
    }
  }

  // Update pair history with the chosen group arrangement.
  for (const group of bestGroups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const pair = [group[i], group[j]].sort().join('-');
        pairHistory[pair] = (pairHistory[pair] || 0) + 1;
      }
    }
  }

  // Format the output.
  const output = [];
  for (let i = 0; i < bestGroups.length; i++) {
    for (const attendee of bestGroups[i]) {
      output.push({ name: attendee, group: i + 1 });
    }
  }

  return output;
}

// Example use cases:
const attendeesThisWeek3 = ["Liam", "Mia", "Noah", "Olivia", "lucas", "james", "sarah"];
let pairHistory = {};

const grouped3 = groupAttendees(attendeesThisWeek3, pairHistory, 3);
console.log(grouped3);
console.log(pairHistory);

const attendeesThisWeek8 = ["Liam", "Mia", "Noah", "Olivia", "1", "2", "3", "4", "5"];
const grouped8 = groupAttendees(attendeesThisWeek8, pairHistory, 3);
console.log(grouped8);
console.log(pairHistory);
