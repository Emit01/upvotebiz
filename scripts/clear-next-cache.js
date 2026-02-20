const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('Successfully deleted .next directory');
} else {
  console.log('.next directory does not exist, nothing to delete');
}
