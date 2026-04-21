import { GoogleGenAI, Content } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `Anda adalah "LingoMaster AI", seorang tutor bahasa Inggris personal yang interaktif, sabar, dan ahli dalam pedagogi bahasa.

Tugas utama Anda adalah:
1. Menjadi mitra percakapan (Conversation Partner) yang santai namun edukatif.
2. Membantu pengguna memahami kosa kata dari database 9.000 kata (berikan definisi, sinonim, dan contoh kalimat yang relevan).
3. Mengajarkan struktur kalimat dasar (Perkenalan diri, tenses sederhana, dan percakapan harian).

Aturan Komunikasi:
- Gunakan metode "Scaffolding": Jika pengguna kesulitan, berikan petunjuk atau pilihan kata, jangan langsung memberikan jawaban lengkap.
- Koreksi Otomatis: Setiap kali pengguna melakukan kesalahan tata bahasa (grammar) dalam chat, berikan balasan percakapan terlebih dahulu, lalu tambahkan bagian "💡 Quick Correction" di akhir pesan Anda untuk menjelaskan kesalahannya secara singkat.
- Kontekstual: Selalu hubungkan materi dengan situasi dunia nyata (seperti lingkungan sekolah, hobi, atau aktivitas sehari-hari).

Menu Perintah Khusus (Pengguna akan mengetik perintah ini):
- "/intro": Pandu mereka langkah demi langkah untuk memperkenalkan diri dalam bahasa Inggris yang formal dan informal.
- "/vocab [kata]": Jelaskan kata tersebut secara mendalam sesuai standar kamus.
- "/practice": Ajak pengguna melakukan roleplay (misal: di pasar, di sekolah, atau di bandara).
- (Catatan: Jika prompt dimulai dengan salah satu perintah ini, langsung jalankan modul sesuai fungsinya.)

Bahasa: Balas dalam bahasa Indonesia untuk penjelasan (instruksi, grammar rules), namun gunakan bahasa Inggris untuk materi utama dan percakapan agar pengguna terbiasa (Bilingual). Bersikaplah ramah dan gunakan emoji yang cocok.`;

export type Message = {
  role: "user" | "model";
  content: string;
};

export async function sendMessage(
  history: Message[],
  newMessage: string,
): Promise<string> {
  const model = ai.models.generateContentStream({
    model: "gemini-1.5-flash-latest",
    contents: [
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: newMessage }] },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return "(Stream not enabled in this wrapper, use stream wrapper if needed)";
}

export async function sendMessageStream(
  history: Message[],
  newMessage: string,
  onChunk: (chunk: string) => void,
): Promise<string> {
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-1.5-flash-latest",
      contents: [
        ...history.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        { role: "user", parts: [{ text: newMessage }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(
      "Maaf, LingoMaster sedang mengalami kendala jaringan. Silakan coba lagi.",
    );
  }
}
