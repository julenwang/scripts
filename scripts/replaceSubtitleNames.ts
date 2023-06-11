import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readdir, rename } from "fs/promises";
import { groupBy, mapValues, sampleSize } from "lodash-es";

const { argv } = yargs(hideBin(process.argv));

const videoSuffixes = ["mkv", "mp4"];
const subtitleSuffixes = ["ass", "srt"];

function getSuffix(name: string) {
  return name
    .split(".")
    .slice(1)
    .filter((s) => s.length < 4)
    .join(".");
}
function getRandomChars() {
  const start = "A".charCodeAt(0);
  const list = Array.from(new Array(26), (_v, index) => {
    return String.fromCharCode(start + index);
  });
  return sampleSize(list, 4).join("");
}

async function main() {
  const { _ } = await argv;
  const folder = `${_[0]}`;
  const files = await readdir(folder);

  const videos = files
    .filter((value) => {
      return videoSuffixes.some((suffix) => {
        return value.endsWith(suffix);
      });
    })
    .sort();
  const subtitles = files.filter((value) => {
    return subtitleSuffixes.some((suffix) => {
      return value.endsWith(suffix);
    });
  });
  const subtitleGroups = mapValues(
    groupBy(subtitles, (value) => {
      return getSuffix(value);
    }),
    (value) => value.sort()
  );
  if (
    Object.values(subtitleGroups).some((group) => {
      return group.length !== videos.length;
    })
  ) {
    throw new Error("videos length and subtitles length not match");
  }

  Object.values(subtitleGroups).forEach((group) => {
    const randomChars = getRandomChars();
    group.forEach((old, index) => {
      const suffix = `.${getSuffix(old)}`;
      rename(
        `${folder}/${old}`,
        `${folder}/${videos[index]
          .split(".")
          .slice(0, -1)
          .join(".")
          .replace(suffix, "")}_${randomChars}${suffix}`
      );
    });
  });

  console.log("OK!");
}

main();
