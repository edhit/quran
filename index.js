require("dotenv").config();

const { Telegraf, Markup, session } = require("telegraf");
const { message } = require("telegraf/filters");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

try {
  // GENERAL
  const bot = new Telegraf(process.env.BOT_TOKEN);
  mongoose.connect("mongodb://127.0.0.1:27017/quran");

  // DB MODEL
  const model = new Schema({
    surah: Number,
    ayat: Number,
    photo: {
      file_id: String,
    },
    audio: {
      file_id: String,
    },
  });

  const user = new Schema({
    telegram: Number,
    username: String,
  });

  // DATA FOR KEYBOARDS
  const reader = ["husary", "muaiqly", "afasy"];
  const lang = ["ar", "en", "ru", "fr"];

  // JSONS
  const text = require("./source/lang.json");
  const listSurah = require("./source/surah.json");
  const listReader = require("./source/reader.json");

  // KEYBOARDS
  const keyboard_reader = Markup.keyboard([reader]).resize();
  const keyboard_lang = Markup.keyboard([lang]).resize();

  // USER
  bot.telegram.setMyCommands([
    {
      command: 'start',
      description: 'Main page',
    },
    {
      command: 'lang',
      description: 'Language page',
    }
  ]);
  bot.use(
    session({ defaultSession: () => ({ reader: "husary", lang: "en" }) }),
  );
  bot.start(async (ctx) => {
    const DB = mongoose.model("user", user);

    await DB.findOneAndUpdate(
      {
        telegram: ctx.chat.id,
      },
      {
        telegram: ctx.from.id,
        username: ctx.from.username,
      },
      {
        new: true,
        upsert: true,
      },
    );

    await ctx.reply(`${text[ctx.session.lang].start}`, keyboard_reader);
  });

  bot.command("lang", async (ctx) => {
    await ctx.reply(`${text[ctx.session.lang].lang}`, keyboard_lang);
  });

  bot.on(message("text"), async (ctx) => {
    const data = ctx.message.text;

    if (reader.includes(data)) {
      ctx.session.reader = data;
      await ctx.reply("👍");
      return;
    }

    if (lang.includes(data)) {
      ctx.session.lang = data;
      await ctx.reply("👍");
      return;
    }

    if (data.indexOf(":") === -1) {
      await ctx.reply(text[ctx.session.lang].format);
      return;
    }

    const DB = mongoose.model(ctx.session.reader, model);

    const surah = data.split(":")[0];
    const ayats = data.split(":")[1];

    const ayat = ayats.split(",");

    for (let index = 0; index < ayat.length; index++) {
      if (Number(ayat[index]) && Number(surah)) {
        let bbb;
        let aaa;

        if (surah.length === 1) bbb = `00${surah}`;
        else if (surah.length === 2) bbb = `0${surah}`;
        else bbb = `${surah}`;

        if (ayat[index].length === 1) aaa = `00${ayat[index]}`;
        else if (ayat[index].length === 2) aaa = `0${ayat[index]}`;
        else aaa = `${ayat[index]}`;

        let post = await DB.findOne({ surah: surah, ayat: ayat[index] });
        let icon = listSurah[surah].place === "Mecca" ? "🕋" : "🕌";
        if (post) {
          await ctx.replyWithPhoto(post.photo.file_id);
          await ctx.replyWithAudio(post.audio.file_id, {
            caption: `${icon} Surah ${surah} «${listSurah[surah].title}», Ayat ${ayat[index]} - ${listReader[ctx.session.reader]}`,
          });
        } else {
          try {
            const photo = await ctx.replyWithPhoto(
              `https://cdn.islamic.network/quran/images/high-resolution/${surah}_${ayat[index]}.png`,
            );
            const audio = await ctx.replyWithAudio(
              `https://tanzil.net/res/audio/${ctx.session.reader}/${bbb}${aaa}.mp3`,
              {
                caption: `${icon} Surah ${surah} «${listSurah[surah].title}», Ayat ${ayat[index]} - ${listReader[ctx.session.reader]}`,
              },
            );

            post = new DB({
              surah: surah,
              ayat: ayat[index],
              photo: { file_id: photo.photo[photo.photo.length - 1].file_id },
              audio: { file_id: audio.audio.file_id },
            });

            await post.save();
          } catch (error) {
            console.log(error);
            await ctx.reply(
              `${text[ctx.session.lang].not_found}: ${ayat[index]}. ${text[ctx.session.lang].check}`,
            );
            return;
          }
        }
      } else {
        await ctx.reply(
          `${text[ctx.session.lang].not_found}: ${ayat[index]}. ${text[ctx.session.lang].check}`,
        );
        return;
      }
    }
  });

  // START BOT
  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
} catch (error) {
  console.log(error);
}
