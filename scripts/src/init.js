import Promise from "bluebird";
import fs from "fs-extra";
Promise.promisifyAll(fs);

import which from "which";
which.async = Promise.promisify(which);
