const fs = require('fs');

const fixMap = {
  'functions/api/admin/rebuild-all.js': [
    ["from '../../../utils/rebuild.js'", "from '../../utils/rebuild.js'"]
  ],
  'functions/api/admin/rebuild/[id].js': [
    ["from '../../../../utils/rebuild.js'", "from '../../../utils/rebuild.js'"]
  ],
  'functions/api/quiz/[id].js': [
    ["from '../../../utils/rebuild.js'", "from '../../utils/rebuild.js'"]
  ],
  'functions/api/quiz/[id]/submit.js': [
    ["from '../../../../utils/auth.js'", "from '../../../utils/auth.js'"],
    ["from '../../../../utils/rebuild.js'", "from '../../../utils/rebuild.js'"]
  ],
  'functions/api/user/revision/submit.js': [
    ["from '../../../../utils/auth.js'", "from '../../../utils/auth.js'"]
  ]
};

for (const [file, replacements] of Object.entries(fixMap)) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed imports');
