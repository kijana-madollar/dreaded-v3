
const { getGroupSettings, getSettings } = require('../Mongodb/Settingsdb');

module.exports = async (client, m) => {
  const userId = m.sender;
  const groupId = m.chat;
  const checkdev = userId.split('@')[0];  
  if (!groupId.endsWith("@g.us")) return;

  const groupMetadata = await client.groupMetadata(groupId);
  const groupAdmins = groupMetadata.participants
    .filter((participant) => participant.admin)
    .map((participant) => participant.id);

  const botId = client.decodeJid(client.user.id);

  if (!groupAdmins.includes(botId)) {
    
    return;
  }

  if (groupAdmins.includes(userId)) {
    
    return;
  }

  let settings = await getSettings();
  const currentDevs = settings.dev.split(',').map((num) => num.trim());

  if (currentDevs.includes(checkdev)) return;


  const groupSettings = await getGroupSettings(groupId);
  if (!groupSettings.antilink) {
    
    return;
  }

  var body =
    m.mtype === "conversation"
      ? m.message.conversation
      : m.mtype === "imageMessage"
      ? m.message.imageMessage.caption
      : m.mtype === "extendedTextMessage"
      ? m.message.extendedTextMessage.text
      : "";

  if (body && (body.includes('http://') || body.includes('https://'))) {
    

    await client.sendMessage(
      groupId,
      {
        text: `@${userId.split("@")[0]}, sending links is prohibited.\nAntilink is active!`,
        contextInfo: {
          mentionedJid: [userId],
        },
      },
      { quoted: m }
    );

await client.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: userId
            }
        });

    await client.groupParticipantsUpdate(groupId, [userId], "remove");

    
  }
}; 