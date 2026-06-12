import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  express.static(path.join(__dirname, "public"), {
    dotfiles: "allow",
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/tos", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tos.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "privacy.html"));
});

app.get("/invite", (req, res) => {
  const invite = process.env.INVITE_LINK;
  if (!invite) {
    return res.status(404).send("no invite here");
  }
  res.redirect(invite);
});

app.get("/github", (req, res) => {
  res.redirect("https://github.com/paritojr/doggo-the-helper");
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

if (!process.argv.includes("--no-web-server")) {
  app.listen(PORT, () => {
    console.log("web server running");
  });
}