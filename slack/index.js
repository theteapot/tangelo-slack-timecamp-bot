const { WebClient } = require("@slack/web-api");
const web = new WebClient(process.env.SLACK_TOKEN);

async function getUsersWithChannels() {
  let imConversations = await web.conversations.list({ types: "im" });
  let slackUsers = await web.users.list();

  slackUsers.members = slackUsers.members.map((slackUser) => {
    let imChannel = imConversations.channels.find(
      ({ user }) => user === slackUser.id
    );
    return { ...slackUser, imChannel };
  });

  return slackUsers;
}

async function sendMessage({ message, channel }) {
  await web.chat.postMessage({
    channel: channel,
    text: message,
  });
}

function formatUserReport({ entry, message }) {
  return `
There is a problem with one of your timecamp entries:
${entry}
${message}
`;
}

module.exports = {
  getUsersWithChannels,
  sendMessage,
  formatUserReport,
};
