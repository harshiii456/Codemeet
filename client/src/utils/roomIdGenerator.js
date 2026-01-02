/**
 * Generates a formatted room ID in the format: room-xxx-1234
 * Example: room-abc-5678
 */
export const generateRoomId = () => {
  // Generate random 3-letter code
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const randomLetters = Array.from({ length: 3 }, () => 
    letters[Math.floor(Math.random() * letters.length)]
  ).join('');

  // Generate random 4-digit number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  // Combine into formatted room ID
  return `room-${randomLetters}-${randomNumber}`;
};

/**
 * Validates if a room ID matches the expected format
 * @param {string} roomId - The room ID to validate
 * @returns {boolean} - True if valid format
 */
export const isValidRoomIdFormat = (roomId) => {
  const pattern = /^room-[a-z]{3}-\d{4}$/;
  return pattern.test(roomId);
};
