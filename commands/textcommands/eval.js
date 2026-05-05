export default {
  name: "eval",
  description: "runs code on da bot",
  ownerOnly: true,
  async execute(message, args) {
    const code = args.join(" ");
    if (!code) return;
    try {
      eval(code);
      message.delete();
    } catch (err) {
      console.error("fucking error:", err);
    }
  }
};