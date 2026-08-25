Simple logger plugin.

Just logs to the console, no file output (yet).

## Usage

    process.logger = require("simplelog");

    ...

    process.logger.info("Message"); // debug|info|warn|error