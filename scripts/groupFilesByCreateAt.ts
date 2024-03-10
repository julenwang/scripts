import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readdir, rename, stat, mkdir } from "fs/promises";
import { basename, dirname, join } from "path";
import dayjs from "dayjs";

const { argv } = yargs(hideBin(process.argv));

async function main() {
  const { _ } = await argv;
  const pwd = `${_[0]}`;
  const files = await readdir(pwd);

  // 1. 获取文件的 YYYYMMDD
  // 2. 检查 folder 是否创建，没有则创建 folder，捕获 create error 防止竞争
  // 3. 移动文件到 folder

  for (const file of files) {
    const path = join(pwd, file);
    await (async () => {
      const stats = await stat(path);

      if (!(file.startsWith(".") || stats.isDirectory())) {
        // create time YYYYMMDD
        const createAt = dayjs(stats.birthtimeMs).format("YYYYMMDD");

        const folderPath = join(pwd, createAt);

        try {
          // no file or file no a dir
          const folderStats = await stat(folderPath);
          if (!folderStats.isDirectory()) {
            throw undefined;
          }
        } catch {
          // try to create folder
          try {
            await mkdir(folderPath);
          } catch {}
        }

        rename(path, join(dirname(path), createAt, basename(path)));
      }
    })();
  }
}

main();
