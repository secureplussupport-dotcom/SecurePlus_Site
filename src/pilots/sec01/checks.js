export function gradePilotCheck(check, choice) {
  if (!Number.isInteger(choice) || choice < 0 || choice >= check.options.length) {
    throw new RangeError('Choose one of the available answers.');
  }
  return choice === check.correct_index;
}
