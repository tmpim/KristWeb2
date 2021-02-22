import packageJson from "../../package.json";

export function getAuthorInfo(): { authorName: string; authorURL: string; gitURL: string } {
  const authorName = packageJson.author || "Lemmmy";
  const authorURL = `https://github.com/${authorName}`;
  const gitURL = packageJson.repository.url.replace(/\.git$/, "");

  return { authorName, authorURL, gitURL };
}
