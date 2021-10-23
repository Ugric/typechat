import readlines from "readline";

const readline = readlines.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("Which accountID? ", (accountID) => {
  readline.question("What Badge? ", (badge) => {
    readline.question("Expires in (ms) ", (badge) => {});
  });
});
