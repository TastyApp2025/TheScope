import OpenAI from "openai";

export async function generateAudio(text: string): Promise<Buffer> {
  const apiKey = process.env.OpenAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OpenAI_API_KEY is not set. Set the environment variable to enable audio generation."
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
