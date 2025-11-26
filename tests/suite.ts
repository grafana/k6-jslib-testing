import { options, runSuite } from "../dist/index.js";

import "./expectations/toBeInstanceOf.ts";
import "./expectations/toHaveAttribute.ts";

export default runSuite();

export { options };
