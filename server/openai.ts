import OpenAI from "openai";

export async function generateAudio(text: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AUDIO_SERVICE_UNAVAILABLE"
    );
  }

  const openai = new OpenAI({ apiKey });

  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "nova",
    input: text,
  });

  return Buffer.from(await mp3.arrayBuffer());
}
