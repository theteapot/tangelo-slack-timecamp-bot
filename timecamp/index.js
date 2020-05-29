const api = require("./api");

async function generateUserReport({ fullName }) {
  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 2);

  let user = await api.getUser({ fullName });

  if (!user.user_id) throw new Error("Expected user to have user_id property");

  let entries = await api.getTimeEntries({
    userId: user.user_id,
    from: `${yesterday.getFullYear()}-${
      yesterday.getMonth() + 1
    }-${yesterday.getDate()}`,
    to: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
  });

  let timesheetAlerts = await checkEntries(entries);
  return timesheetAlerts;
}

async function checkEntries(entries) {
  let sentenceLength = 7;
  let timeInterval = 15;
  let timesheetAlerts = [];

  // Flag entries that have no task
  // Flag entries that are billable
  // Flag entries that do not have enough text relative to the time spent
  // (1 sentence - 15 words - per 15 minutes)

  for (let entry of entries) {
    let sentences = parseFloat(
      entry.description.split(" ").length / sentenceLength
    ).toFixed(2);
    let mins = parseFloat(
      (new Date(`${entry.date} ${entry.end_time}`) -
        new Date(`${entry.date} ${entry.start_time}`)) /
        1000 /
        60
    ).toFixed(2);

    if (entry.entry === "0") {
      timesheetAlerts.push({
        entry: formatEntry(entry),
        message: "entry found without task",
      });
    }

    if (entry.billable === 1) {
      timesheetAlerts.push({
        entry: formatEntry(entry),
        message: "entry found that was billable",
      });
    }

    if (sentences < mins / timeInterval) {
      timesheetAlerts.push({
        entry: formatEntry(entry),
        message: `description too short, expected ${parseFloat(
          mins / timeInterval
        ).toFixed(
          2
        )} sentences for a ${mins} minute task, but got ${sentences}`,
      });
    }
  }

  return timesheetAlerts;
}

function formatEntry(entry) {
  return `
Name: ${entry.name}
User Name: ${entry.user_name}
Time: ${entry.date} ${entry.start_time} - ${entry.end_time}
${entry.billable === 1 ? "Billable" : "Not billable"}
Description: ${entry.description}

    `;
}

module.exports = { generateUserReport };
