// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnEmpty: true,
  leaveOnFinish: false,
  leaveOnStop: false,
  plugins: [
    new YtDlpPlugin({
      update: true,
      cookies: "youtube-cookies.txt"
    }),
    new SpotifyPlugin(),
    new SoundCloudPlugin()
  ]
});

client.once('ready', () => {
  console.log(`🎵 Logged in as ${client.user.tag}!`);
});

const prefix = '!';

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot || !message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel && ['play', 'skip', 'stop', 'pause', 'resume', 'volume', 'nowplaying', 'np'].includes(cmd)) {
    return message.reply('You must be in a voice channel to use music commands.');
  }

  switch (cmd) {
    case 'play':
      client.distube.play(voiceChannel, args.join(' '), {
        member: message.member,
        textChannel: message.channel,
        message
      });
      break;

    case 'skip':
      client.distube.skip(message);
      break;

    case 'stop':
      client.distube.stop(message);
      break;

    case 'pause':
      client.distube.pause(message);
      break;

    case 'resume':
      client.distube.resume(message);
      break;

    case 'volume':
      if (!args[0]) return message.reply('Please specify a volume value.');
      client.distube.setVolume(message, Number(args[0]));
      message.reply(`🔊 Volume set to ${args[0]}%`);
      break;

    case 'np':
    case 'nowplaying':
      const queue = client.distube.getQueue(message);
      if (!queue) return message.reply('No music is currently playing.');
      message.reply(`🎶 Now playing: ${queue.songs[0].name}`);
      break;

    case 'intro':
      const embed = new EmbedBuilder()
        .setTitle('🎵 Escanorlive Music Bot')
        .setDescription('High quality 24/7 music bot powered by DisTube, created and managed by <@YOUR_USER_ID>')
        .setColor('Random');
      message.channel.send({ embeds: [embed] });
      break;

    case 'help':
      message.channel.send(`📘 **Available Commands:**
\`\`\`
!play <song name or URL> - Plays a song
!skip - Skips the current song
!stop - Stops playback
!pause - Pauses the current song
!resume - Resumes the paused song
!volume <value> - Sets volume
!np or !nowplaying - Shows current playing song
!intro - Displays bot intro and credits
!help - Shows this help menu
\`\`\``);
      break;

    default:
      message.reply('❌ Unknown command. Use `!help` to view all available commands.');
  }
});

client.login(process.env.TOKEN);

