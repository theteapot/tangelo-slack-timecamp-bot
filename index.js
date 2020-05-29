require("dotenv").config();
const { WebClient } = require("@slack/web-api");
const timecamp = require("./timecamp");
const slack = require("./slack");

const web = new WebClient(process.env.SLACK_TOKEN);

(async () => {
  try {
    let slackUsers = await slack.getUsersWithChannels();

    for (let slackUser of slackUsers.members) {
      try {
        let userReports = await timecamp.generateUserReport({
          fullName: slackUser.real_name,
        });
        for (let report of userReports) {
          await slack.sendMessage({
            message: slack.formatUserReport(report),
            channel: slackUser.imChannel.id,
          });
        }
      } catch (error) {
        console.log(
          `Could not generate user report for ${slackUser.real_name}, error: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
