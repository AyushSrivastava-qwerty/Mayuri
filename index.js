require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

const distube = new DisTube(client, {
  plugins: [
    new SpotifyPlugin(),
    new YtDlpPlugin()
  ]
});

client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  const prefix = "!"; // change if needed
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "play") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("❌ Join a voice channel first.");
    if (!args[0]) return message.reply("❌ Please provide a song name or URL.");

    distube.play(voiceChannel, args.join(" "), {
      textChannel: message.channel,
      member: message.member,
    });
  }

  if (command === "stop") {
    distube.stop(message);
    message.channel.send("⏹️ Stopped the music.");
  }

  if (command === "skip") {
    distube.skip(message);
    message.channel.send("⏭️ Skipped.");
  }

  if (command === "volume") {
    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 0 || vol > 100) return message.reply("❌ Volume must be between 0 and 100.");
    distube.setVolume(message, vol);
    message.channel.send(`🔊 Volume set to ${vol}%`);
  }

  if (command === "nowplaying" || command === "np") {
    const queue = distube.getQueue(message);
    if (!queue) return message.reply("❌ Nothing is playing right now.");
    message.channel.send(`🎶 Now playing: \`${queue.songs[0].name}\``);
  }

  if (command === "queue") {
    const queue = distube.getQueue(message);
    if (!queue) return message.reply("❌ The queue is empty.");
    message.channel.send(
      `📜 Current queue:\n${queue.songs
        .map((song, i) => `${i === 0 ? "▶️" : `${i + 1}.`} ${song.name}`)
        .join("\n")}`
    );
  }
});

client.login(process.env.TOKEN);


