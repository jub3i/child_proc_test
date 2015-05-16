var childProcess = require('child_process');
var spawn = childProcess.spawn;
var once = require('once');

// INSTRUCTIONS: try `total` values of 1, 2, 3, 4, 5, 10, 100, 1000
// IMPORTANT: run this program *a view times* for each value of `total`
var total = parseInt(process.argv[2]) || 1;
var count = 0;

var failed = 0;
var success = 0;

var debug = true;

// simple async counter to display results of tests once they are all done
var counter = function(allData) {
  if (debug) {
    console.log(count + ': ' + allData.slice(0, 5) + '...');
  }

  count++;

  if (count === total) {
    console.log('failed:', failed);
    console.log('success:', success);
  }
};

// run the test `total` times in parallel
for (var i = 0; i < total; i++) {
  runTest(counter);
}

function runTest(cb) {
  // `ps` should always return results with (parentPid === 1)
  var ps = spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', 1]);
  var allData = '';

  // drain the stdout stream into `allData`
  ps.stdout.on('data', function (data) {
    data = data.toString('ascii');
    allData += data;
  });

  var exitCloseCB = once(function() {
    // if allData is empty, then the stdout stream has not emptied yet
    if (allData.length === 0) {
      failed++;
    // otherwise we will count a success
    } else {
      success++;
    }
    // call to `counter()` callback when done
    return cb(allData);
  });

  // `exit` event on child_process
  // https://iojs.org/api/child_process.html#child_process_event_exit
  // 'Note that the child process stdio streams might still be open.'
  ps.on('exit', exitCloseCB);

  ps.on('close', exitCloseCB);
}
