import crypto from 'crypto';
import { join } from 'path';
const archiver = require('archiver');
const { createWriteStream } = require('fs');

function getRandomSalt() {
  return Math.random().toString().slice(2, 5);
}

function cryptPwd(name, salt) {
  const saltName = `${name}:${salt}`;
  const md5 = crypto.createHash('md5');
  const result = md5.update(saltName).digest('hex');
  return result;
}

export default function zip(args, callback) {
  console.log('zip start');
  const baseDir = args.cwd;
  const pkg = require(join(args.cwd, 'package.json'));
  const pkgName = pkg.name;
  const random = cryptPwd(`${pkg.name}`, getRandomSalt());
  const zipName = `${pkgName}-${random}`;
  const zipOutputPath = `${join(baseDir, 'dist', zipName)}.zip`;
  const output = createWriteStream(zipOutputPath);
  const directoryLocalPath = join(baseDir, 'dist-local');
  const archive = archiver('zip');
  output.on('close', () => {
    console.log(archive.pointer(), ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    callback();
  });
  archive.on('error', (err) => {
    console.err(err);
    throw err;
  });
  archive.pipe(output);
  console.log('zipping path:', directoryLocalPath);
  // archive.directory(directoryPath, pkg.name);
  archive.glob('**', {
    cwd: directoryLocalPath,
    name: pkg.name
  });
  archive.finalize();
}
